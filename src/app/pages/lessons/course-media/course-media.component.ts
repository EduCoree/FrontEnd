
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  SectionDto,
  LessonDto,
  AddVideoLessonDto,
  AddPdfLessonDto,
  VideoLessonResponse,
  PdfLessonResponse,
} from '../../../core/models/course';
import { CourseService } from '../../../core/services/course';

interface LessonMediaState extends Omit<LessonDto, 'durationSeconds' | 'isFreePreview'> {
  sectionTitle: string;
  hasVideo: boolean;
  hasPdf: boolean;
  videoUrl?: string;
  videoProvider?: string;
  pdfUrl?: string;
  durationSeconds?: number | null;
  isFreePreview?: boolean;
}

@Component({
  selector: 'app-course-media',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-media.component.html',
})
export class CourseMediaComponent implements OnInit {

  courseId!: number;

  lessons = signal<LessonMediaState[]>([]);
  selectedLesson = signal<LessonMediaState | null>(null);

  isLoading = signal(true);
  isSavingVideo = signal(false);
  isSavingPdf = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  videoForm: FormGroup;
  pdfForm: FormGroup;

  videoProviders = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'self', label: 'Self-hosted' },
  ];

  getMediaProgress = computed(() => {
    const all = this.lessons();
    if (!all.length) return 0;
    const done = all.filter(l => l.hasVideo).length;
    return Math.round((done / all.length) * 100);
  });

  completedVideosCount = computed(() => {
    return this.lessons().filter(l => l.hasVideo).length;
  });

  // UI state for the new design
  showPdfForm = signal(false);

  videoProgress = signal(0);
  videoFileName = signal('');
  uploadingVideo = signal(false);
  videoUrl = signal('');

  pdfs = signal<{ name: string; size: string; fileUrl: string }[]>([]);

  /** Live YouTube preview — set when a valid ID is detected */
  safePreviewUrl = signal<SafeResourceUrl | null>(null);

  /**
   * Extracts a YouTube video ID from any of these formats:
   *   - https://www.youtube.com/watch?v=VIDEO_ID
   *   - https://youtu.be/VIDEO_ID
   *   - https://www.youtube.com/embed/VIDEO_ID
   *   - https://www.youtube.com/shorts/VIDEO_ID
   */
  getYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Called on every (input) event on the video URL field.
   * Extracts the YouTube ID and builds a safe iframe embed URL.
   */
  onVideoUrlInput(event: Event): void {
    const url = (event.target as HTMLInputElement).value.trim();
    const id = this.getYouTubeId(url);
    if (id) {
      const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
      this.safePreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    } else {
      this.safePreviewUrl.set(null);
    }
  }

  /** Return a thumbnail URL based on provider */
  getVideoThumbnail(url: string, provider: string): string | null {
    if (provider === 'youtube') {
      const id = this.getYouTubeId(url);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    return null;
  }

  /** Short domain label for display */
  getVideoDomainLabel(url: string): string {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.videoForm = this.fb.group({
      videoUrl: ['', [Validators.required, Validators.maxLength(255)]],
      videoProvider: ['youtube', Validators.required],
      thumbnailUrl: [null],
    });

    this.pdfForm = this.fb.group({
      fileUrl: ['', [Validators.required, Validators.maxLength(255)]],
      fileSizeKb: [null],
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadLessons();
  }

  loadLessons(): void {
    this.isLoading.set(true);
    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => {
        const sections: SectionDto[] = res.data ?? [];
        const flat: LessonMediaState[] = [];
        for (const section of sections) {
          for (const lesson of section.lessons ?? []) {
            flat.push({
              ...lesson,
              sectionTitle: section.title,
              hasVideo: ((lesson as any).videoLesson != null),
              hasPdf: ((lesson as any).pdfLesson != null),
              videoUrl: (lesson as any).videoLesson?.videoUrl,
              videoProvider: (lesson as any).videoLesson?.videoProvider,
              pdfUrl: (lesson as any).pdfLesson?.fileUrl,
              durationSeconds: (lesson as any).durationSeconds ?? null,
              isFreePreview: (lesson as any).isFreePreview ?? false,
            });
          }
        }
        this.lessons.set(flat);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  selectLesson(lesson: LessonMediaState): void {
    this.selectedLesson.set(lesson);
    this.successMsg.set('');
    this.errorMsg.set('');
    this.showPdfForm.set(false);
    this.safePreviewUrl.set(null);   // clear live preview for new lesson

    // Pre-fill forms if content exists
    if (lesson.hasVideo) {
      this.videoForm.patchValue({
        videoUrl: lesson.videoUrl ?? '',
        videoProvider: lesson.videoProvider ?? 'youtube',
        thumbnailUrl: null,
      });
      this.videoUrl.set(lesson.videoUrl ?? '');
    } else {
      this.videoForm.reset({ videoProvider: 'youtube' });
      this.videoUrl.set('');
    }

    if (lesson.hasPdf) {
      this.pdfForm.patchValue({ fileUrl: lesson.pdfUrl ?? '', fileSizeKb: null });
      this.pdfs.set([{ name: 'Existing PDF', size: 'Attached', fileUrl: lesson.pdfUrl ?? '' }]);
    } else {
      this.pdfForm.reset();
      this.pdfs.set([]);
    }
  }

  // ─── Video ───────────────────────────────────────────────────────────────

  /** Simulate URL-based "upload" (actual upload happens via saveVideo) */
  onVideoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.videoFileName.set(file.name);
    this.uploadingVideo.set(true);
    // Simulate progress for UX
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      this.videoProgress.set(p);
      if (p >= 100) { clearInterval(interval); this.uploadingVideo.set(false); }
    }, 100);
  }

  saveVideo(): void {
    if (this.videoForm.invalid || !this.selectedLesson()) return;
    const lesson = this.selectedLesson()!;
    this.isSavingVideo.set(true);

    const dto: AddVideoLessonDto = {
      videoUrl: this.videoForm.value.videoUrl,
      videoProvider: this.videoForm.value.videoProvider,
      thumbnailUrl: this.videoForm.value.thumbnailUrl || undefined,
    };

    this.courseService.addVideo(this.courseId, lesson.id, dto).subscribe({
      next: (v: VideoLessonResponse) => {
        this.videoUrl.set(v.videoUrl);
        this.isSavingVideo.set(false);
        this.flash('success', 'Video attached successfully!');
        this.loadLessons();
      },
      error: () => { this.isSavingVideo.set(false); this.flash('error', 'Failed to attach video. It may already be attached.'); }
    });
  }

  removeVideo(): void {
    if (!this.selectedLesson()) return;
    if (!confirm('Remove video from this lesson?')) return;
    this.courseService.removeVideo(this.courseId, this.selectedLesson()!.id).subscribe({
      next: () => {
        this.videoUrl.set('');
        this.videoForm.reset({ videoProvider: 'youtube' });
        this.flash('success', 'Video removed.');
        this.loadLessons();
      },
      error: () => this.flash('error', 'Failed to remove video.')
    });
  }

  // ─── PDF ─────────────────────────────────────────────────────────────────

  onPdfSelected(event: Event): void {
    // This triggers the pdfForm fill via URL field — file upload not supported here
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Show file name as feedback only
    this.pdfs.update(list => [...list, { name: file.name, size: `${Math.round(file.size / 1024)} KB`, fileUrl: '' }]);
  }

  savePdf(): void {
    if (this.pdfForm.invalid || !this.selectedLesson()) return;
    const lesson = this.selectedLesson()!;
    this.isSavingPdf.set(true);

    const dto: AddPdfLessonDto = {
      fileUrl: this.pdfForm.value.fileUrl,
      fileSizeKb: this.pdfForm.value.fileSizeKb || undefined,
    };

    this.courseService.addPdf(this.courseId, lesson.id, dto).subscribe({
      next: (p: PdfLessonResponse) => {
        this.pdfs.set([{ name: 'PDF Material', size: p.fileSizeKb ? `${p.fileSizeKb} KB` : 'Attached', fileUrl: p.fileUrl }]);
        this.isSavingPdf.set(false);
        this.flash('success', 'PDF attached successfully!');
        this.loadLessons();
      },
      error: () => { this.isSavingPdf.set(false); this.flash('error', 'Failed to attach PDF. It may already be attached.'); }
    });
  }

  removePdf(pdf: { name: string; size: string; fileUrl: string }): void {
    if (!this.selectedLesson()) return;
    this.courseService.removePdf(this.courseId, this.selectedLesson()!.id).subscribe({
      next: () => {
        this.pdfs.update(list => list.filter(p => p !== pdf));
        this.pdfForm.reset();
        this.flash('success', 'PDF removed.');
        this.loadLessons();
      },
      error: () => this.flash('error', 'Failed to remove PDF.')
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private flash(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMsg.set(msg);
      this.errorMsg.set('');
      setTimeout(() => this.successMsg.set(''), 3500);
    } else {
      this.errorMsg.set(msg);
      this.successMsg.set('');
      setTimeout(() => this.errorMsg.set(''), 3500);
    }
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'sections']);
  }

  goNext(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'pricing']);
  }

  goToDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}
