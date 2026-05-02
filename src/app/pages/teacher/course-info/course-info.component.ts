import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import {
  ReorderItemDto,
  SectionDto,
  LessonDto,
  UpdateLessonDto,
  AddVideoLessonDto,
  AddPdfLessonDto,
  VideoLessonResponse,
  PdfLessonResponse,
  CreateLessonDto,
} from '../../../core/models/course';
import { CourseService } from '../../../core/services/course';
import { TranslateModule } from '@ngx-translate/core';
import { DrivePickerService } from '../../../core/services/drive-picker.service';

// Extended lesson shape that includes attached media from the sections response
interface LessonWithMedia extends LessonDto {
  sectionTitle: string;
  hasVideo: boolean;
  hasPdf: boolean;
  videoUrl?: string;
  videoProvider?: string;
  pdfUrl?: string;
}

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './course-info.component.html',
  styleUrl: '../edit-course/edit-course.component.css',
})
export class CourseInfoComponent implements OnInit {

  courseId!: number;

  // ── Course forms ────────────────────────────────────────────────────────────
  courseForm: FormGroup;
  pricingForm: FormGroup;
  sectionForm: FormGroup;
  editForm: FormGroup;

  sections = signal<SectionDto[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  successMessage = signal('');
  selectedFile: File | null = null;
  coverPreview = signal('');
  courseStatus = signal('');
  editingSection: SectionDto | null = null;

  levels = ['Beginner', 'Intermediate', 'Advanced'];
  pricingTypes = ['Free', 'Paid', 'Subscription'];
  categories: Category[] = [];
  courseCategoryName = '';
  isCategoriesLoaded = false;

  // ── Add Lesson Modal ────────────────────────────────────────────────────────
  showAddLessonModal = signal(false);
  addLessonTargetSectionId = signal<number | null>(null);
  isCreatingLesson = signal(false);
  lessonForm: FormGroup;

  // ── Inline Lesson Editor ────────────────────────────────────────────────────
  lessonPanelOpen = signal(false);
  selectedLesson = signal<LessonWithMedia | null>(null);
  activeLessonTab = signal<'info' | 'video' | 'pdf'>('info');
  isLessonLoading = signal(false);
  isSavingLesson = signal(false);
  lessonSuccessMsg = signal('');
  lessonErrorMsg = signal('');

  infoForm: FormGroup;
  videoForm: FormGroup;
  pdfForm: FormGroup;

  hasVideo = computed(() => !!this.selectedLesson()?.hasVideo);
  hasPdf  = computed(() => !!this.selectedLesson()?.hasPdf);

  safePreviewUrl = signal<SafeResourceUrl | null>(null);

  videoProviders = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo',   label: 'Vimeo' },
    { value: 'self',    label: 'Self-hosted' },
  ];

  isDrivePickingPdf   = signal(false);
  isDrivePickingVideo = signal(false);

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private drivePicker: DrivePickerService
  ) {
    this.courseForm = this.fb.group({
      title:       ['', Validators.required],
      description: ['', Validators.required],
      categoryId:  [null, Validators.required],
      level:       ['Beginner', Validators.required],
    });

    this.pricingForm = this.fb.group({
      pricingType: ['Free', Validators.required],
      price: [0]
    });

    this.sectionForm = this.fb.group({ title: ['', Validators.required] });
    this.editForm    = this.fb.group({ title: ['', Validators.required] });

    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      durationSeconds: [null],
      sortOrder: [null]
    });

    this.infoForm = this.fb.group({
      title:           ['', [Validators.required, Validators.maxLength(200)]],
      durationSeconds: [null],
      sortOrder:       [null],
      isFreePreview:   [false],
    });

    this.videoForm = this.fb.group({
      videoUrl:      ['', [Validators.required, Validators.maxLength(255)]],
      videoProvider: ['youtube', Validators.required],
      thumbnailUrl:  [null],
    });

    this.pdfForm = this.fb.group({
      fileUrl:    ['', [Validators.required, Validators.maxLength(255)]],
      fileSizeKb: [null],
    });
  }

  ngOnInit(): void {
    // Read :id from the parent shell route (teacher/courses/edit/:id)
    const currentParams = this.route.snapshot.paramMap;
    const parentParams = this.route.parent?.snapshot.paramMap;
    const grandParentParams = this.route.parent?.parent?.snapshot.paramMap;

    this.courseId = Number(
      currentParams.get('id') ??
      currentParams.get('courseId') ??
      parentParams?.get('id') ??
      parentParams?.get('courseId') ??
      grandParentParams?.get('id') ??
      grandParentParams?.get('courseId')
    );

    this.loadCategories();
    this.loadCourse();
    this.loadSections();
  }

  // ── Course ──────────────────────────────────────────────────────────────────

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        const course = res.data;
        this.courseCategoryName = course.categoryName || '';
        this.courseForm.patchValue({
          title:       course.title,
          description: course.description,
          categoryId:  course.categoryId ?? null,
          level:       course.level
        });

        if (!this.courseForm.get('categoryId')?.value && this.courseCategoryName) {
          const match = this.categories.find(c => c.name === this.courseCategoryName);
          if (match) this.courseForm.patchValue({ categoryId: match.id });
        }

        this.pricingForm.patchValue(course);
        this.coverPreview.set(course.coverImageUrl || course.coverImage || '');
        this.courseStatus.set(course.status);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    const centerId = 1;
    this.categoryService.getAll(centerId).subscribe({
      next: (res: any) => {
        this.categories = res.data || res || [];
        this.isCategoriesLoaded = true;
        if (!this.courseForm.get('categoryId')?.value && this.courseCategoryName) {
          const match = this.categories.find(c => c.name === this.courseCategoryName);
          if (match) this.courseForm.patchValue({ categoryId: match.id });
        }
      },
      error: () => {
        console.error('Failed to load categories');
        this.isCategoriesLoaded = true;
      }
    });
  }

  loadSections(): void {
    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => { this.sections.set(res.data); }
    });
  }

  saveChanges(): void {
    if (this.courseForm.invalid) return;
    this.isSaving.set(true);
    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isSaving.set(false); }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => this.coverPreview.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadCover(): void {
    if (!this.selectedFile) return;
    this.courseService.uploadCover(this.courseId, this.selectedFile).subscribe({
      next: () => {
        this.successMessage.set('Image uploaded successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  savePricing(): void {
    this.courseService.updatePricing(this.courseId, this.pricingForm.value).subscribe({
      next: () => {
        this.successMessage.set('Pricing updated!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  addSection(): void {
    if (this.sectionForm.invalid) return;
    this.courseService.addSection(this.courseId, this.sectionForm.value).subscribe({
      next: () => { this.sectionForm.reset(); this.loadSections(); }
    });
  }

  startEdit(section: SectionDto): void {
    this.editingSection = section;
    this.editForm.patchValue({ title: section.title });
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingSection) return;
    this.courseService.updateSection(
      this.courseId,
      this.editingSection.id,
      this.editForm.value
    ).subscribe({
      next: () => {
        this.editingSection = null;
        this.loadSections();
        this.successMessage.set('Section updated successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  cancelEdit(): void { this.editingSection = null; }

  deleteSection(sectionId: number): void {
    if (!confirm('Are you sure?')) return;
    this.courseService.deleteSection(this.courseId, sectionId).subscribe({
      next: () => this.loadSections()
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.sections()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.sections.set(items);
    this.saveOrder();
  }

  moveDown(index: number): void {
    if (index === this.sections().length - 1) return;
    const items = [...this.sections()];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.sections.set(items);
    this.saveOrder();
  }

  saveOrder(): void {
    const items: ReorderItemDto[] = this.sections().map((s, i) => ({
      id: s.id, sectionId: s.id, order: i + 1, sortOrder: i + 1
    }));
    this.courseService.reorderSections(this.courseId, items).subscribe({
      next: () => {
        this.successMessage.set('Sections reordered!');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadSections();
      },
      error: (err) => console.error('Failed to save section order', err)
    });
  }

  // ── Add Lesson Modal ────────────────────────────────────────────────────────
  
  openAddLesson(sectionId: number): void {
    this.lessonForm.reset();
    this.addLessonTargetSectionId.set(sectionId);
    this.showAddLessonModal.set(true);
  }

  closeAddLesson(): void {
    this.showAddLessonModal.set(false);
    this.addLessonTargetSectionId.set(null);
  }

  submitAddLesson(): void {
    if (this.lessonForm.invalid) return;
    const sectionId = this.addLessonTargetSectionId();
    if (!sectionId) return;

    this.isCreatingLesson.set(true);
    const dto: CreateLessonDto = {
      sectionId,
      title: this.lessonForm.value.title,
      durationSeconds: this.lessonForm.value.durationSeconds || undefined,
      sortOrder: this.lessonForm.value.sortOrder || undefined,
    };

    this.courseService.createLesson(this.courseId, dto).subscribe({
      next: () => {
        this.isCreatingLesson.set(false);
        this.successMessage.set('Lesson created successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.closeAddLesson();
        this.loadSections();
      },
      error: () => {
        this.isCreatingLesson.set(false);
      }
    });
  }

  // ── Inline Lesson Editor ────────────────────────────────────────────────────

  openLessonEditor(lesson: LessonDto, sectionTitle: string): void {
    this.isLessonLoading.set(true);
    this.lessonSuccessMsg.set('');
    this.lessonErrorMsg.set('');
    this.activeLessonTab.set('info');
    this.safePreviewUrl.set(null);

    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => {
        const sections: SectionDto[] = res.data ?? [];
        let found: LessonWithMedia | null = null;

        for (const sec of sections) {
          const match = (sec.lessons ?? []).find((l: any) => l.id === lesson.id);
          if (match) {
            const raw = match as any;
            found = {
              ...match,
              sectionTitle: sec.title,
              hasVideo: raw.videoLesson != null,
              hasPdf:   raw.pdfLesson != null,
              videoUrl:      raw.videoLesson?.videoUrl,
              videoProvider: raw.videoLesson?.videoProvider,
              pdfUrl:        raw.pdfLesson?.fileUrl,
            };
            break;
          }
        }

        this.selectedLesson.set(found);

        if (found) {
          this.infoForm.patchValue({
            title:           found.title,
            durationSeconds: found.durationSeconds ?? null,
            sortOrder:       found.sortOrder,
            isFreePreview:   found.isFreePreview ?? false,
          });

          if (found.hasVideo) {
            this.videoForm.patchValue({
              videoUrl:      found.videoUrl ?? '',
              videoProvider: found.videoProvider ?? 'youtube',
              thumbnailUrl:  null,
            });
            if (found.videoProvider === 'youtube' && found.videoUrl) {
              const id = this.getYouTubeId(found.videoUrl);
              if (id) {
                const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
                this.safePreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
              }
            }
          } else {
            this.videoForm.reset({ videoProvider: 'youtube' });
          }

          if (found.hasPdf) {
            this.pdfForm.patchValue({ fileUrl: found.pdfUrl ?? '', fileSizeKb: null });
          } else {
            this.pdfForm.reset();
          }
        }

        this.isLessonLoading.set(false);
        this.lessonPanelOpen.set(true);
      },
      error: () => {
        this.isLessonLoading.set(false);
        this.lessonFlash('error', 'Failed to load lesson details.');
      }
    });
  }

  closeLessonEditor(): void {
    this.lessonPanelOpen.set(false);
    this.selectedLesson.set(null);
    this.safePreviewUrl.set(null);
  }

  goToLessonManager(): void {
    const lesson = this.selectedLesson();
    if (lesson) {
      this.router.navigate(['/teacher/courses', this.courseId, 'lessons', lesson.id]);
    }
  }

  getYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

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

  saveInfo(): void {
    const lesson = this.selectedLesson();
    if (this.infoForm.invalid || !lesson) return;
    this.isSavingLesson.set(true);

    const dto: UpdateLessonDto = {
      title:           this.infoForm.value.title,
      durationSeconds: this.infoForm.value.durationSeconds || undefined,
      sortOrder:       this.infoForm.value.sortOrder || undefined,
    };

    this.courseService.updateLesson(this.courseId, lesson.id, dto).subscribe({
      next: () => {
        const wantsFreePreview = !!this.infoForm.value.isFreePreview;
        const currentFreePreview = lesson.isFreePreview ?? false;
        if (wantsFreePreview !== currentFreePreview) {
          this.courseService.toggleFreePreview(this.courseId, lesson.id, { isFreePreview: wantsFreePreview }).subscribe();
        }
        this.isSavingLesson.set(false);
        this.lessonFlash('success', 'Lesson info saved!');
        this.loadSections();
      },
      error: () => { this.isSavingLesson.set(false); this.lessonFlash('error', 'Failed to save lesson info.'); }
    });
  }

  saveVideo(): void {
    const lesson = this.selectedLesson();
    if (this.videoForm.invalid || !lesson) return;
    this.isSavingLesson.set(true);

    const dto: AddVideoLessonDto = {
      videoUrl:      this.videoForm.value.videoUrl,
      videoProvider: this.videoForm.value.videoProvider,
      thumbnailUrl:  this.videoForm.value.thumbnailUrl || undefined,
    };

    this.courseService.addVideo(this.courseId, lesson.id, dto).subscribe({
      next: (v: VideoLessonResponse) => {
        this.isSavingLesson.set(false);
        this.lessonFlash('success', 'Video attached!');
        this.selectedLesson.update(l => l ? { ...l, hasVideo: true, videoUrl: v.videoUrl, videoProvider: v.videoProvider } : l);
        this.loadSections();
      },
      error: () => { this.isSavingLesson.set(false); this.lessonFlash('error', 'Failed to attach video. It may already be attached.'); }
    });
  }

  removeVideo(): void {
    const lesson = this.selectedLesson();
    if (!lesson) return;
    if (!confirm('Remove video from this lesson?')) return;
    this.courseService.removeVideo(this.courseId, lesson.id).subscribe({
      next: () => {
        this.videoForm.reset({ videoProvider: 'youtube' });
        this.safePreviewUrl.set(null);
        this.selectedLesson.update(l => l ? { ...l, hasVideo: false, videoUrl: undefined, videoProvider: undefined } : l);
        this.lessonFlash('success', 'Video removed.');
        this.loadSections();
      },
      error: () => this.lessonFlash('error', 'Failed to remove video.')
    });
  }

  savePdf(): void {
    const lesson = this.selectedLesson();
    if (this.pdfForm.invalid || !lesson) return;
    this.isSavingLesson.set(true);

    const dto: AddPdfLessonDto = {
      fileUrl:    this.pdfForm.value.fileUrl,
      fileSizeKb: this.pdfForm.value.fileSizeKb || undefined,
    };

    this.courseService.addPdf(this.courseId, lesson.id, dto).subscribe({
      next: (p: PdfLessonResponse) => {
        this.isSavingLesson.set(false);
        this.lessonFlash('success', 'PDF attached!');
        this.selectedLesson.update(l => l ? { ...l, hasPdf: true, pdfUrl: p.fileUrl } : l);
        this.loadSections();
      },
      error: () => { this.isSavingLesson.set(false); this.lessonFlash('error', 'Failed to attach PDF.'); }
    });
  }

  removePdf(): void {
    const lesson = this.selectedLesson();
    if (!lesson) return;
    if (!confirm('Remove PDF from this lesson?')) return;
    this.courseService.removePdf(this.courseId, lesson.id).subscribe({
      next: () => {
        this.pdfForm.reset();
        this.selectedLesson.update(l => l ? { ...l, hasPdf: false, pdfUrl: undefined } : l);
        this.lessonFlash('success', 'PDF removed.');
        this.loadSections();
      },
      error: () => this.lessonFlash('error', 'Failed to remove PDF.')
    });
  }

  private lessonFlash(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.lessonSuccessMsg.set(msg);
      this.lessonErrorMsg.set('');
      setTimeout(() => this.lessonSuccessMsg.set(''), 3500);
    } else {
      this.lessonErrorMsg.set(msg);
      this.lessonSuccessMsg.set('');
      setTimeout(() => this.lessonErrorMsg.set(''), 3500);
    }
  }

  // ─── Google Drive Picker ─────────────────────────────────────────────────

  async openDrivePickerForPdf(): Promise<void> {
    this.isDrivePickingPdf.set(true);
    try {
      const file = await this.drivePicker.openPicker('application/pdf');
      if (file) {
        this.pdfForm.patchValue({
          fileUrl:    file.url,
          fileSizeKb: file.sizeBytes ? Math.round(file.sizeBytes / 1024) : null,
        });
        this.lessonFlash('success', `"${file.name}" selected from Drive!`);
      }
    } catch {
      this.lessonFlash('error', 'Could not open Google Drive. Check your API credentials.');
    } finally {
      this.isDrivePickingPdf.set(false);
    }
  }

  async openDrivePickerForVideo(): Promise<void> {
    this.isDrivePickingVideo.set(true);
    try {
      const file = await this.drivePicker.openPicker('video/mp4,video/quicktime,video/x-msvideo');
      if (file) {
        this.videoForm.patchValue({ videoUrl: file.url, videoProvider: 'self' });
        if (this.videoForm.value.videoProvider === 'youtube') {
          this.onVideoUrlInput({ target: { value: file.url } } as any);
        } else {
          this.safePreviewUrl.set(null);
        }
        this.lessonFlash('success', `"${file.name}" selected from Drive!`);
      }
    } catch {
      this.lessonFlash('error', 'Could not open Google Drive. Check your API credentials.');
    } finally {
      this.isDrivePickingVideo.set(false);
    }
  }
}
