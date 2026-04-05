import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user';
import { TeacherProfileModel } from '../../core/models/user';
import { TotalStudentsPipe } from '../../shared/pipes/total-students-pipe';
@Component({
  selector: 'app-teacher-profile',
  imports: [CommonModule,TotalStudentsPipe ],
  templateUrl: './teacher-profile.html',
  styleUrl: './teacher-profile.css',
})
export class TeacherProfileComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  teacher = signal<TeacherProfileModel | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.userService.getTeacherProfile(id).subscribe({
      next: (data) => { this.teacher.set(data); this.loading.set(false); },
      error: () => { this.error.set('Teacher not found.'); this.loading.set(false); },
    });
  }

  get initials(): string {
    return (this.teacher()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}