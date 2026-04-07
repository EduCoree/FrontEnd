// src/app/pages/admin-courses/admin-courses.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../core/services/course';
import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from '../../layouts/admin-topbar/admin-topbar';
import { CourseSummaryDto, UpdatePricingDto } from '../../core/models/course';

type StatusFilter = 'All' | 'Published' | 'Draft' | 'Archived';

@Component({
  selector: 'app-admin-courses',
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css',
})
export class AdminCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private fb            = inject(FormBuilder);

  courses           = signal<CourseSummaryDto[]>([]);
  loading           = signal(false);
  successMsg        = signal('');
  errorMsg          = signal('');
  statusFilter      = signal<StatusFilter>('All');
  searchTerm        = signal('');
  showPricingModal  = signal(false);
  selectedCourse    = signal<CourseSummaryDto | null>(null);

  pricingForm: FormGroup = this.fb.group({
    pricingType:     ['Paid', Validators.required],
    price:           [0, [Validators.required, Validators.min(0)]],
    discountedPrice: [null],
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const filter = {
      search: this.searchTerm() || undefined,
      status: this.statusFilter() !== 'All' ? this.statusFilter() : undefined,
    };
    // this.courseService.getAll(filter).subscribe({
    //   next: (res) => { this.courses.set(res.items); this.loading.set(false); },
    //   error: () => this.flashError('Failed to load courses.'),
    // });
  }

  onSearch(e: Event) {
    this.searchTerm.set((e.target as HTMLInputElement).value);
    this.load();
  }

  setStatusFilter(s: StatusFilter) {
    this.statusFilter.set(s);
    this.load();
  }

  publish(course: CourseSummaryDto) {
    this.courseService.publishCourse(course.id).subscribe({
      next: () => {
        this.courses.update(list => list.map(c => c.id === course.id ? { ...c, status: 'Published' } : c));
        this.flash('Course published.');
      },
      error: () => this.flashError('Failed to publish course.'),
    });
  }

  unpublish(course: CourseSummaryDto) {
    this.courseService.unpublishCourse(course.id).subscribe({
      next: () => {
        this.courses.update(list => list.map(c => c.id === course.id ? { ...c, status: 'Archived' } : c));
        this.flash('Course unpublished.');
      },
      error: () => this.flashError('Failed to unpublish course.'),
    });
  }

  openPricing(course: CourseSummaryDto) {
    this.selectedCourse.set(course);
    this.pricingForm.patchValue({
      pricingType:     course.pricingType,
      price:           course.price,
      discountedPrice: null,
    });
    this.showPricingModal.set(true);
  }

  submitPricing() {
    if (this.pricingForm.invalid || !this.selectedCourse()) return;
    const dto: UpdatePricingDto = this.pricingForm.value;
    this.courseService.updatePricing(this.selectedCourse()!.id, dto).subscribe({
      next: () => {
        this.courses.update(list =>
          list.map(c => c.id === this.selectedCourse()!.id
            ? { ...c, price: dto.price, pricingType: dto.pricingType }
            : c)
        );
        this.showPricingModal.set(false);
        this.flash('Pricing updated.');
      },
      error: () => this.flashError('Failed to update pricing.'),
    });
  }

  get publishedCount() { return this.courses().filter(c => c.status === 'Published').length; }
  get draftCount()     { return this.courses().filter(c => c.status === 'Draft').length; }
  get archivedCount()  { return this.courses().filter(c => c.status === 'Archived').length; }

  statusClass(status: string) {
    if (status === 'Published') return 'text-emerald-600';
    if (status === 'Draft')     return 'text-[#596060]/60';
    return 'text-[#a83836]';
  }

  statusDot(status: string) {
    if (status === 'Published') return 'bg-emerald-500 animate-pulse';
    if (status === 'Draft')     return 'bg-[#acb3b2]';
    return 'bg-[#a83836]';
  }

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