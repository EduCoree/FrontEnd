import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicCourseService } from '../../../core/services/public-course.service';
import { ProgressService } from '../../../core/services/progress';
import { StudentContentService } from '../../../core/services/student-content';
import { CourseDetailDto, LessonDto } from '../../../core/models/course';
import { CourseProgress, ResumeLesson } from '../../../core/models/progress';
import { TranslateModule } from '@ngx-translate/core';

declare var Plyr: any;

@Component({
  selector: 'app-course-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './course-workspace.component.html',
  styleUrl:    './course-workspace.component.css',
})
export class CourseWorkspaceComponent implements OnInit, OnDestroy {

  // ── Course State ────────────────────────────────────────────────────────────
  courseId      = signal<number>(0);
  course        = signal<CourseDetailDto | null>(null);
  progress      = signal<CourseProgress | null>(null);
  resume        = signal<ResumeLesson | null>(null);
  isLoading     = signal(true);
  errorMsg      = signal('');
  openSectionId = signal<number | null>(null);

  // ── Active Lesson / Player State ────────────────────────────────────────────
  activeLesson     = signal<LessonDto | null>(null);
  signedUrl        = signal<string | null>(null);
  safeUrl          = signal<SafeResourceUrl | null>(null);
  provider         = signal<string>('');        // 'youtube' | 'vimeo' | 'self'
  youtubeVideoId   = signal<string | null>(null);
  vimeoVideoId     = signal<string | null>(null);
  isVideoLoading   = signal(false);
  videoError       = signal('');
  isCompleting     = signal(false);
  isLessonComplete = signal(false);
  expiresAt        = signal<string | null>(null);
  currentPosSecs   = signal(0);

  private plyrInstance: any = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private expiryInterval:    ReturnType<typeof setInterval> | null = null;
  private isExpired = false;

  // ── Derived ─────────────────────────────────────────────────────────────────
  completedIds = computed<Set<number>>(() => {
    const p = this.progress() as any;
    if (!p?.lessonProgress) return new Set<number>();
    return new Set<number>(
      (p.lessonProgress as any[]).filter(lp => lp.isCompleted).map(lp => lp.lessonId)
    );
  });

  totalLessons = computed(() =>
    this.course()?.sections?.reduce((acc, s) => acc + s.lessons.length, 0) ?? 0
  );

  allLessons = computed<LessonDto[]>(() => {
    const list: LessonDto[] = [];
    const sections = this.course()?.sections;
    if (sections) {
      for (const s of sections) {
        if (s.lessons) {
          list.push(...s.lessons);
        }
      }
    }
    return list;
  });

  activeLessonIndex = computed<number>(() => {
    const l = this.activeLesson();
    if (!l) return -1;
    return this.allLessons().findIndex(x => x.id === l.id);
  });

  isLastLesson = computed<boolean>(() => {
    const idx = this.activeLessonIndex();
    if (idx === -1) return false;
    return idx === this.allLessons().length - 1;
  });

  nextLesson = computed<LessonDto | null>(() => {
    const idx = this.activeLessonIndex();
    if (idx === -1 || idx === this.allLessons().length - 1) return null;
    return this.allLessons()[idx + 1];
  });

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private sanitizer: DomSanitizer,
    private publicCourseService:   PublicCourseService,
    private progressService:       ProgressService,
    private studentContentService: StudentContentService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('courseId'));
    this.courseId.set(id);
    this.loadAll(id);
  }

  ngOnDestroy(): void {
    this.clearIntervals();
  }

  // ── Data Loading ─────────────────────────────────────────────────────────────

  private loadAll(courseId: number): void {
    this.isLoading.set(true);

    this.publicCourseService.getCourseById(courseId).subscribe({
      next: (res) => {
        const c: CourseDetailDto = res.data ?? res;
        this.course.set(c);
        if (c.sections?.length) {
          this.openSectionId.set(c.sections[0].id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load course.');
        this.isLoading.set(false);
      },
    });

    this.progressService.getCourseProgress(courseId).subscribe({
      next: (p) => this.progress.set(p),
      error: () => {},
    });

    this.progressService.getResumeLesson(courseId).subscribe({
      next: (r) => this.resume.set(r),
      error: () => {},
    });
  }

  // ── Inline Video Player ───────────────────────────────────────────────────────

  selectLesson(lesson: LessonDto): void {
    if (lesson.type?.toLowerCase() === 'pdf') {
      window.open(
        `/student/courses/${this.courseId()}/lessons/${lesson.id}/watch`,
        '_blank'
      );
      return;
    }

    if (lesson.type?.toLowerCase() === 'quiz') {
      this.router.navigate(['/quiz/intro', lesson.id]);
      return;
    }

    // Video lesson — load signed URL inline
    this.activeLesson.set(lesson);
    this.signedUrl.set(null);
    this.safeUrl.set(null);
    this.videoError.set('');
    this.isVideoLoading.set(true);
    this.isLessonComplete.set(this.isCompleted(lesson.id));
    this.isExpired = false;
    this.currentPosSecs.set(0);
    this.destroyPlyr();
    this.clearIntervals();

    this.studentContentService.getVideoSignedUrl(lesson.id).subscribe({
      next: (res) => {
        this.signedUrl.set(res.url);
        this.expiresAt.set(res.expiresAt);
        const p = this.detectProvider(res.url);
        this.provider.set(p);
        this.buildSafeUrl(res.url, p);
        this.startExpiryWatcher(res.expiresAt);
        this.startHeartbeat(lesson.id);
        this.isVideoLoading.set(false);
        
        if (p === 'youtube' || p === 'vimeo') {
          setTimeout(() => this.initPlyr(), 0);
        }
      },
      error: (err) => {
        if (err?.status === 403) {
          this.videoError.set('Enroll in this course to watch this lesson.');
        } else {
          this.videoError.set('Failed to load video. Please try again.');
        }
        this.isVideoLoading.set(false);
      },
    });
  }

  closePlayer(): void {
    this.clearIntervals();
    this.destroyPlyr();
    this.activeLesson.set(null);
    this.signedUrl.set(null);
    this.safeUrl.set(null);
    this.youtubeVideoId.set(null);
    this.vimeoVideoId.set(null);
    this.videoError.set('');
    this.isExpired = false;
  }

  onTimeUpdate(event: Event): void {
    const v = event.target as HTMLVideoElement;
    this.currentPosSecs.set(Math.floor(v.currentTime));
  }

  markComplete(goToNext: boolean = false): void {
    const lesson = this.activeLesson();
    if (!lesson) return;

    if (this.isLessonComplete()) {
      if (goToNext) {
        const next = this.nextLesson();
        if (next) this.selectLesson(next);
      }
      return;
    }

    this.isCompleting.set(true);
    this.progressService.markLessonComplete(lesson.id).subscribe({
      next: () => {
        this.isLessonComplete.set(true);
        this.isCompleting.set(false);
        // refresh progress
        this.progressService.getCourseProgress(this.courseId()).subscribe({
          next: (p) => {
             this.progress.set(p);
             if (goToNext) {
               const next = this.nextLesson();
               if (next) this.selectLesson(next);
             }
          },
          error: () => {},
        });
      },
      error: () => this.isCompleting.set(false),
    });
  }

  refreshVideo(): void {
    const lesson = this.activeLesson();
    if (lesson) this.selectLesson(lesson);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private detectProvider(url: string): string {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/vimeo\.com/.test(url)) return 'vimeo';
    if (/drive\.google\.com/.test(url)) return 'drive';
    return 'self';
  }

  private buildSafeUrl(url: string, provider: string): void {
    this.youtubeVideoId.set(null);
    this.vimeoVideoId.set(null);
    
    if (provider === 'youtube') {
      const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (m) {
        this.youtubeVideoId.set(m[1]);
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${m[1]}?autoplay=1`));
      }
    } else if (provider === 'vimeo') {
      const m = url.match(/vimeo\.com\/(\d+)/);
      if (m) {
        this.vimeoVideoId.set(m[1]);
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${m[1]}?autoplay=1`));
      }
    } else if (provider === 'drive') {
      let previewUrl = url;
      // Extract from drive.google.com/uc?export=download&id=XYZ
      const match = url.match(/id=([^&]+)/);
      if (match) {
        previewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      } else if (url.includes('/view')) {
        previewUrl = url.replace('/view', '/preview');
      }
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl));
    }
  }

  private initPlyr(): void {
    if (typeof window === 'undefined' || typeof Plyr === 'undefined') return;

    this.destroyPlyr();
    try {
      this.plyrInstance = new Plyr('#plyr-player', {
        youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 },
        vimeo: { byline: false, portrait: false, title: false, transparent: false, responsive: true }
      });
      
    // Attempt auto-play gracefully if browser allows
    this.plyrInstance.on('ready', () => {
      const playPromise = this.plyrInstance?.play();
      if (playPromise !== undefined && typeof (playPromise as any).catch === 'function') {
        (playPromise as Promise<void>).catch(() => {});
      }
    });

    // Auto-complete lesson and drop the UI nicely
    this.plyrInstance.on('ended', () => {
      this.markComplete();
      // Emitting 'stop' allows the poster CSS hack to cleanly cover the related grids
      setTimeout(() => this.plyrInstance?.stop(), 100);
    });
  } catch(err) {
    console.error('Failed to load Plyr:', err);
  }
  }

  private destroyPlyr(): void {
    if (this.plyrInstance) {
      this.plyrInstance.destroy();
      this.plyrInstance = null;
    }
  }

  private startExpiryWatcher(expiresAt: string): void {
    this.expiryInterval = setInterval(() => {
      if (Date.now() >= new Date(expiresAt).getTime()) {
        this.isExpired = true;
        this.videoError.set('Session expired. Click refresh to continue.');
        clearInterval(this.expiryInterval!);
      }
    }, 60_000);
  }

  private startHeartbeat(lessonId: number): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.provider() !== 'self') {
        this.currentPosSecs.update(v => v + 30);
      }
      this.progressService.recordWatchProgress(lessonId, {
        lastPositionSecs: this.currentPosSecs()
      }).subscribe({ error: () => {} });
    }, 30_000);
  }

  private clearIntervals(): void {
    if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
    if (this.expiryInterval)    { clearInterval(this.expiryInterval);    this.expiryInterval = null; }
  }

  // ── Section / UI helpers ──────────────────────────────────────────────────────

  toggleSection(sectionId: number): void {
    this.openSectionId.set(this.openSectionId() === sectionId ? null : sectionId);
  }

  isCompleted(lessonId: number): boolean { return this.completedIds().has(lessonId); }

  isActiveLesson(lessonId: number): boolean { return this.activeLesson()?.id === lessonId; }

  isResumeLesson(lessonId: number): boolean {
    return !this.activeLesson() && this.resume()?.lessonId === lessonId;
  }

  getLessonIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'video': return 'play_circle';
      case 'pdf':   return 'description';
      case 'quiz':  return 'quiz';
      default:      return 'article';
    }
  }

  lessonNumber(i: number): string { return String(i + 1).padStart(2, '0'); }

  formatDuration(secs: number): string {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}:${String(s).padStart(2, '0')} mins` : `${m} mins`;
  }

  goBack(): void { this.router.navigate(['/student/my-courses']); }

  resumeCourse(): void {
    const r   = this.resume();
    const cid = this.courseId();
    const first = this.course()?.sections?.[0]?.lessons?.[0];
    const target = r?.lessonId
      ? this.course()?.sections?.flatMap(s => s.lessons).find(l => l.id === r.lessonId)
      : first;
    if (target) this.selectLesson(target);
  }

  get progressPct(): number { return this.progress()?.percentComplete ?? 0; }

  get isVideoExpired(): boolean { return this.isExpired; }
}
