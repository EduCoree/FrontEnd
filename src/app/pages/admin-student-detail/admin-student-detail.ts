import { CourseService } from './../../core/services/course';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminUserService } from '../../core/services/admin-user';
import { StudentDetail } from '../../core/models/admin-user';
import { CourseSummaryDto } from '../../core/models/course';
import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from '../../layouts/admin-topbar/admin-topbar';
@Component({
  selector: 'app-admin-student-detail',
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent ],
  templateUrl: './admin-student-detail.html',
  styleUrl: './admin-student-detail.css',
})
export class AdminStudentDetailComponent implements OnInit {
  private service = inject(AdminUserService);
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
 
  student = signal<StudentDetail | null>(null);
  courses = signal<CourseSummaryDto[]>([]);
  loading = signal(true);
  successMsg = signal('');
  errorMsg = signal('');
  activeTab = signal<'enrollments' | 'payments' | 'attendance'>('enrollments');
  showEnrollModal = signal(false);
 
  enrollForm: FormGroup = this.fb.group({
    courseId: ['', Validators.required],
    type: ['Paid', Validators.required],
    expiresAt: [''],
  });
 
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.getStudent(id).subscribe({
      next: (data) => { this.student.set(data); this.loading.set(false); },
      error: () => { this.errorMsg.set('Student not found.'); this.loading.set(false); },
    });
    this.courseService.getMyCourses().subscribe({
     next: (data) => this.courses.set(data.items), 
    });
  }
 
  openEnrollModal() {
    this.enrollForm.reset({ type: 'Paid' });
    this.showEnrollModal.set(true);
  }
 
  setTab(key: string) {
    this.activeTab.set(key as 'enrollments' | 'payments' | 'attendance');
  }
 
  toggleActive() {
    if (!this.student()) return;
    const s = this.student()!;
    const action = s.isActive
      ? this.service.deactivateStudent(s.id)
      : this.service.activateStudent(s.id);
    action.subscribe({
      next: () => {
        this.student.update((st) => st ? { ...st, isActive: !st.isActive } : st);
        this.flash(`Student ${s.isActive ? 'deactivated' : 'activated'}.`);
      },
      error: () => this.flashError('Failed to update status.'),
    });
  }
 
  submitEnroll() {
    if (this.enrollForm.invalid || !this.student()) return;
    const dto = {
      courseId: Number(this.enrollForm.value.courseId),
      type: this.enrollForm.value.type,
      expiresAt: this.enrollForm.value.expiresAt || undefined,
    };
    this.service.enrollStudent(this.student()!.id, dto).subscribe({
      next: (enrollment) => {
        this.student.update((st) =>
          st ? { ...st, enrollments: [enrollment, ...st.enrollments] } : st);
        this.showEnrollModal.set(false);
        this.flash('Student enrolled successfully.');
      },
      error: () => this.flashError('Failed to enroll student. May already be enrolled.'),
    });
  }
 
  get initials(): string {
    return (this.student()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
 
  get enrolledCourseIds(): Set<number> {
    return new Set(this.student()?.enrollments.map((e) => e.courseId) ?? []);
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