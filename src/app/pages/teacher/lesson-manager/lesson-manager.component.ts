
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  LessonResponse,
  UpdateLessonDto,
  AddVideoLessonDto,
  AddPdfLessonDto,
  VideoLessonResponse,
  PdfLessonResponse,
} from '../../../core/models/course';
import { CourseService } from '../../../core/services/course';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lesson-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule , TranslateModule],
  templateUrl: './lesson-manager.component.html',
})
export class LessonManagerComponent implements OnInit {

  courseId!: number;
  lessonId!: number;

  lesson = signal<LessonResponse | null>(null);
  video = signal<VideoLessonResponse | null>(null);
  pdf = signal<PdfLessonResponse | null>(null);

  isLoading = signal(true);
  isSaving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Tab: 'info' | 'video' | 'pdf'
  activeTab = signal<'info' | 'video' | 'pdf'>('info');

  infoForm: FormGroup;
  videoForm: FormGroup;
  pdfForm: FormGroup;

  videoProviders = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'self', label: 'Self-hosted' },
  ];

  hasVideo = computed(() => !!this.video());
  hasPdf = computed(() => !!this.pdf());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private fb: FormBuilder
  ) {
    this.infoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      durationSeconds: [null],
      sortOrder: [null],
      isFreePreview: [false],
    });

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
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.loadLesson();
  }

  // ─── Load ────────────────────────────────────────────────────────────────

  loadLesson(): void {
    this.isLoading.set(true);
    // The backend returns lesson details via GET sections, so we navigate to reload.
    // Here we use the sections endpoint to find our lesson by id.
    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => {
        const sections = res.data ?? [];
        let found: LessonResponse | null = null;
        let foundVideo: VideoLessonResponse | null = null;
        let foundPdf: PdfLessonResponse | null = null;

        for (const section of sections) {
          const match = (section.lessons ?? []).find((l: any) => l.id === this.lessonId);
          if (match) {
            found = match as LessonResponse;
            foundVideo = match.videoLesson ?? null;
            foundPdf = match.pdfLesson ?? null;
            break;
          }
        }

        this.lesson.set(found);
        this.video.set(foundVideo);
        this.pdf.set(foundPdf);

        if (found) {
          this.infoForm.patchValue({
            title: found.title,
            durationSeconds: found.durationSeconds ?? null,
            sortOrder: found.sortOrder,
            isFreePreview: found.isFreePreview,
          });
        }

        if (foundVideo) {
          this.videoForm.patchValue({
            videoUrl: foundVideo.videoUrl,
            videoProvider: foundVideo.videoProvider,
            thumbnailUrl: foundVideo.thumbnailUrl ?? null,
          });
        }

        if (foundPdf) {
          this.pdfForm.patchValue({
            fileUrl: foundPdf.fileUrl,
            fileSizeKb: foundPdf.fileSizeKb ?? null,
          });
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.flash('error', 'Failed to load lesson details.');
        this.isLoading.set(false);
      }
    });
  }

  // ─── Info ────────────────────────────────────────────────────────────────

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    this.isSaving.set(true);

    const dto: UpdateLessonDto = {
      title: this.infoForm.value.title,
      durationSeconds: this.infoForm.value.durationSeconds || undefined,
      sortOrder: this.infoForm.value.sortOrder || undefined,
    };

    this.courseService.updateLesson(this.courseId, this.lessonId, dto).subscribe({
      next: () => {
        // Toggle free preview separately if changed
        const wantsFreePreview = !!this.infoForm.value.isFreePreview;
        const currentFreePreview = this.lesson()?.isFreePreview ?? false;

        const finish = () => {
          this.isSaving.set(false);
          this.flash('success', 'Lesson info saved!');
          this.loadLesson();
        };

        if (wantsFreePreview !== currentFreePreview) {
          this.courseService.toggleFreePreview(this.courseId, this.lessonId, { isFreePreview: wantsFreePreview }).subscribe({
            next: finish,
            error: () => {
              this.isSaving.set(false);
              this.flash('error', 'Lesson saved but failed to update free preview.');
              this.loadLesson();
            }
          });
        } else {
          finish();
        }
      },
      error: () => { this.isSaving.set(false); this.flash('error', 'Failed to save lesson info.'); }
    });
  }

  // ─── Video ───────────────────────────────────────────────────────────────

  saveVideo(): void {
    if (this.videoForm.invalid) return;
    this.isSaving.set(true);

    const dto: AddVideoLessonDto = {
      videoUrl: this.videoForm.value.videoUrl,
      videoProvider: this.videoForm.value.videoProvider,
      thumbnailUrl: this.videoForm.value.thumbnailUrl || undefined,
    };

    this.courseService.addVideo(this.courseId, this.lessonId, dto).subscribe({
      next: (v) => {
        this.video.set(v);
        this.isSaving.set(false);
        this.flash('success', 'Video attached!');
      },
      error: () => { this.isSaving.set(false); this.flash('error', 'Failed to attach video. It may already exist.'); }
    });
  }

  removeVideo(): void {
    if (!confirm('Remove video from this lesson?')) return;
    this.courseService.removeVideo(this.courseId, this.lessonId).subscribe({
      next: () => {
        this.video.set(null);
        this.videoForm.reset({ videoProvider: 'youtube' });
        this.flash('success', 'Video removed.');
      },
      error: () => this.flash('error', 'Failed to remove video.')
    });
  }

  // ─── PDF ─────────────────────────────────────────────────────────────────

  savePdf(): void {
    if (this.pdfForm.invalid) return;
    this.isSaving.set(true);

    const dto: AddPdfLessonDto = {
      fileUrl: this.pdfForm.value.fileUrl,
      fileSizeKb: this.pdfForm.value.fileSizeKb || undefined,
    };

    this.courseService.addPdf(this.courseId, this.lessonId, dto).subscribe({
      next: (p) => {
        this.pdf.set(p);
        this.isSaving.set(false);
        this.flash('success', 'PDF attached!');
      },
      error: () => { this.isSaving.set(false); this.flash('error', 'Failed to attach PDF. It may already exist.'); }
    });
  }

  removePdf(): void {
    if (!confirm('Remove PDF from this lesson?')) return;
    this.courseService.removePdf(this.courseId, this.lessonId).subscribe({
      next: () => {
        this.pdf.set(null);
        this.pdfForm.reset();
        this.flash('success', 'PDF removed.');
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

  goToMedia(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'media']);
  }
}
