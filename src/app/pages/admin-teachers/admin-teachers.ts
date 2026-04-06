import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminUserService } from '../../core/services/admin-user';
import { TeacherSummary, CreateTeacherDto, UpdateTeacherDto } from '../../core/models/admin-user';
@Component({
  selector: 'app-admin-teachers',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-teachers.html',
  styleUrl: './admin-teachers.css',
})
export class AdminTeachersComponent implements OnInit {
  private service = inject(AdminUserService);
  private fb = inject(FormBuilder);
 
  teachers = signal<TeacherSummary[]>([]);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  searchTerm = signal('');
 
  // Modal state
  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedTeacher = signal<TeacherSummary | null>(null);
 
  createForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    tempPassword: ['', [Validators.required, Validators.minLength(8)]],
  });
 
  editForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phoneNumber: [''],
    bio: [''],
  });
 
  ngOnInit() { this.load(); }
 
  load(search?: string) {
    this.loading.set(true);
    this.service.getTeachers(search).subscribe({
      next: (data) => { this.teachers.set(data); this.loading.set(false); },
      error: () => { this.flashError('Failed to load teachers.'); },
    });
  }
 
  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
    this.load(val || undefined);
  }
 
  openCreate() {
    this.createForm.reset();
    this.showCreateModal.set(true);
  }
 
  submitCreate() {
    if (this.createForm.invalid) return;
    this.loading.set(true);
    this.service.createTeacher(this.createForm.value as CreateTeacherDto).subscribe({
      next: (t) => {
        this.teachers.update((list) => [t, ...list]);
        this.showCreateModal.set(false);
        this.flash('Teacher created successfully.');
      },
      error: () => this.flashError('Failed to create teacher.'),
    });
  }
 
  openEdit(teacher: TeacherSummary) {
    this.selectedTeacher.set(teacher);
    this.editForm.patchValue({ name: teacher.name, phoneNumber: teacher.phoneNumber ?? '', bio: '' });
    this.showEditModal.set(true);
  }
 
  submitEdit() {
    if (this.editForm.invalid || !this.selectedTeacher()) return;
    this.loading.set(true);
    this.service.updateTeacher(this.selectedTeacher()!.id, this.editForm.value as UpdateTeacherDto).subscribe({
      next: (updated) => {
        this.teachers.update((list) => list.map((t) => t.id === updated.id ? updated : t));
        this.showEditModal.set(false);
        this.flash('Teacher updated successfully.');
      },
      error: () => this.flashError('Failed to update teacher.'),
    });
  }
 
  toggleActive(teacher: TeacherSummary) {
    const action = teacher.isActive
      ? this.service.deactivateTeacher(teacher.id)
      : this.service.activateTeacher(teacher.id);
    action.subscribe({
      next: () => {
        this.teachers.update((list) =>
          list.map((t) => t.id === teacher.id ? { ...t, isActive: !t.isActive } : t));
        this.flash(`Teacher ${teacher.isActive ? 'deactivated' : 'activated'}.`);
      },
      error: () => this.flashError('Failed to update status.'),
    });
  }
 
  get avatarInitials() {
    return (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
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
