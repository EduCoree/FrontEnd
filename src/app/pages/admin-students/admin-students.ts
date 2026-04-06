import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminUserService } from '../../core/services/admin-user';
import { StudentSummary } from '../../core/models/admin-user';
 
@Component({
  selector: 'app-admin-students',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-students.html',
  styleUrl: './admin-students.css',
})
export class AdminStudentsComponent implements OnInit {
  private service = inject(AdminUserService);
 
  students = signal<StudentSummary[]>([]);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  filterActive = signal<boolean | undefined>(undefined);
 
  ngOnInit() { this.load(); }
 
  load(search?: string, isActive?: boolean) {
    this.loading.set(true);
    this.service.getStudents(search, isActive).subscribe({
      next: (data) => { this.students.set(data); this.loading.set(false); },
      error: () => this.flashError('Failed to load students.'),
    });
  }
 
  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.load(val || undefined, this.filterActive());
  }
 
  setFilter(value: boolean | undefined) {
    this.filterActive.set(value);
    this.load(undefined, value);
  }
 
  toggleActive(student: StudentSummary) {
    const action = student.isActive
      ? this.service.deactivateStudent(student.id)
      : this.service.activateStudent(student.id);
    action.subscribe({
      next: () => {
        this.students.update((list) =>
          list.map((s) => s.id === student.id ? { ...s, isActive: !s.isActive } : s));
        this.flash(`Student ${student.isActive ? 'deactivated' : 'activated'}.`);
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