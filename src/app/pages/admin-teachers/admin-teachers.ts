// src/app/pages/admin-teachers/admin-teachers.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminUserService } from '../../core/services/admin-user';
import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from '../../layouts/admin-topbar/admin-topbar';
import { TeacherSummary, CreateTeacherDto, UpdateTeacherDto } from '../../core/models/admin-user';

@Component({
  selector: 'app-admin-teachers',
  imports: [CommonModule, ReactiveFormsModule, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-teachers.html',
  styleUrl: './admin-teachers.css',
})
export class AdminTeachersComponent implements OnInit {
  private service = inject(AdminUserService);
  private fb      = inject(FormBuilder);

  teachers       = signal<TeacherSummary[]>([]);
  loading        = signal(false);
  successMsg     = signal('');
  errorMsg       = signal('');
  showCreateModal = signal(false);
  showEditModal   = signal(false);
  selectedTeacher = signal<TeacherSummary | null>(null);

  createForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    userName:    ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    tempPassword:['', [Validators.required, Validators.minLength(8)]],
  });

  editForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    phoneNumber: [''],
    bio:         [''],
  });

  ngOnInit() { this.load(); }

  load(search?: string) {
    this.loading.set(true);
    this.service.getTeachers(search).subscribe({
      next: (data) => { this.teachers.set(data); this.loading.set(false); },
      error: () => this.flashError('Failed to load teachers.'),
    });
  }

  onSearch(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.load(val || undefined);
  }

  openCreate() { this.createForm.reset(); this.showCreateModal.set(true); }

  submitCreate() {
    if (this.createForm.invalid) return;
    this.loading.set(true);
    this.service.createTeacher(this.createForm.value as CreateTeacherDto).subscribe({
      next: (t) => { this.teachers.update(list => [t, ...list]); this.showCreateModal.set(false); this.flash('Teacher created.'); },
      error: () => this.flashError('Failed to create teacher.'),
    });
  }

  openEdit(t: TeacherSummary) {
    this.selectedTeacher.set(t);
    this.editForm.patchValue({ name: t.name, phoneNumber: t.phoneNumber ?? '', bio: '' });
    this.showEditModal.set(true);
  }

  submitEdit() {
    if (this.editForm.invalid || !this.selectedTeacher()) return;
    this.loading.set(true);
    this.service.updateTeacher(this.selectedTeacher()!.id, this.editForm.value as UpdateTeacherDto).subscribe({
      next: (updated) => { this.teachers.update(list => list.map(t => t.id === updated.id ? updated : t)); this.showEditModal.set(false); this.flash('Teacher updated.'); },
      error: () => this.flashError('Failed to update teacher.'),
    });
  }

  toggleActive(t: TeacherSummary) {
    const action = t.isActive ? this.service.deactivateTeacher(t.id) : this.service.activateTeacher(t.id);
    action.subscribe({
      next: () => { this.teachers.update(list => list.map(x => x.id === t.id ? { ...x, isActive: !x.isActive } : x)); this.flash(`Teacher ${t.isActive ? 'deactivated' : 'activated'}.`); },
      error: () => this.flashError('Failed to update status.'),
    });
  }

  initials(name: string) { return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(); }

  get activeCount() { return this.teachers().filter(t => t.isActive).length; }
  get inactiveCount() { return this.teachers().filter(t => !t.isActive).length; }

  private flash(msg: string) { this.loading.set(false); this.errorMsg.set(''); this.successMsg.set(msg); setTimeout(() => this.successMsg.set(''), 3500); }
  private flashError(msg: string) { this.loading.set(false); this.successMsg.set(''); this.errorMsg.set(msg); setTimeout(() => this.errorMsg.set(''), 3500); }
}