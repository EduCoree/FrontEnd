
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from '../../layouts/admin-topbar/admin-topbar';
import { AdminCourseService } from '../../core/services/admin-course';
import { CourseSummaryDto, UpdatePricingDto } from '../../core/models/course';

@Component({
  selector: 'app-admin-courses',
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css',
})
export class AdminCoursesComponent implements OnInit {
  private service = inject(AdminCourseService);
  private fb      = inject(FormBuilder);

  // ── State signals ────────────────────────────────────────────────────────────
  courses         = signal<CourseSummaryDto[]>([]);
  loading         = signal(false);
  successMsg      = signal('');
  errorMsg        = signal('');
  currentPage     = signal(1);
  totalCount      = signal(0);
  totalPages      = signal(1);
  statusFilter    = signal('');
  searchQuery     = signal('');
  showPricingModal = signal(false);
  selectedCourse  = signal<CourseSummaryDto | null>(null);

  // ── Computed helpers ─────────────────────────────────────────────────────────
  get publishedCount(): number { return this.courses().filter(c => c.status === 'Published').length; }
  get draftCount():    number { return this.courses().filter(c => c.status === 'Draft').length; }
  get archivedCount(): number { return this.courses().filter(c => c.status === 'Archived').length; }

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // ── Pricing form ─────────────────────────────────────────────────────────────
  pricingForm: FormGroup = this.fb.group({
    pricingType:     ['Paid', Validators.required],
    price:           [0, [Validators.required, Validators.min(0)]],
    discountedPrice: [null],
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit() { this.load(1); }

  // ── Data loading ─────────────────────────────────────────────────────────────
  load(page: number = 1) {
    this.loading.set(true);
    this.service.getCourses(
      page,
      10,
      this.searchQuery() || undefined,
      this.statusFilter() || undefined,
    ).subscribe({
      next: (result) => {
        this.courses.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.currentPage.set(result.pageNumber);
        this.loading.set(false);
      },
      error: () => this.flashError('Failed to load courses.'),
    });
  }

  // ── Search & filter ───────────────────────────────────────────────────────────
  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
    this.load(1);
  }

  setStatusFilter(status: string) {
    this.statusFilter.set(status);
    this.load(1);
  }

  // ── Publish / Unpublish ───────────────────────────────────────────────────────
  togglePublish(course: CourseSummaryDto) {
    const action = course.status === 'Published'
      ? this.service.unpublishCourse(course.id)
      : this.service.publishCourse(course.id);

    action.subscribe({
      next: () => {
        const newStatus = course.status === 'Published' ? 'Archived' : 'Published';
        this.courses.update(list =>
          list.map(c => c.id === course.id ? { ...c, status: newStatus } : c)
        );
        this.flash(`Course ${course.status === 'Published' ? 'unpublished' : 'published'} successfully.`);
      },
      error: () => this.flashError('Failed to update course status.'),
    });
  }

  // ── Pricing modal ─────────────────────────────────────────────────────────────
  openPricing(course: CourseSummaryDto) {
    this.selectedCourse.set(course);
    this.pricingForm.patchValue({
      pricingType:     course.pricingType,
      price:           course.price,
      discountedPrice: course.discountedPrice ?? null,
    });
    this.showPricingModal.set(true);
  }

  savePricing() {
    if (this.pricingForm.invalid || !this.selectedCourse()) return;
    this.loading.set(true);
    const dto: UpdatePricingDto = this.pricingForm.value;
    this.service.updatePricing(this.selectedCourse()!.id, dto).subscribe({
      next: () => {
        this.courses.update(list =>
          list.map(c =>
            c.id === this.selectedCourse()!.id
              ? { ...c, pricingType: dto.pricingType, price: dto.price, discountedPrice: dto.discountedPrice }
              : c
          )
        );
        this.showPricingModal.set(false);
        this.flash('Pricing updated successfully.');
      },
      error: () => this.flashError('Failed to update pricing.'),
    });
  }

  // ── Toast helpers ─────────────────────────────────────────────────────────────
  private flash(msg: string) {
    this.loading.set(false);
    this.errorMsg.set('');
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  private flashError(msg: string) {
    this.loading.set(false);
    this.successMsg.set('');
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 3500);
  }
}