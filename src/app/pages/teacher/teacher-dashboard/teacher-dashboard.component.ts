
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../core/services/course';
import { CourseSummaryDto } from '../../../core/models/course';
@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {

  // KPIs
  totalCourses = signal(0);
  publishedCourses = signal(0);
  totalEnrolledStudents = signal(0);
  averageCourseRating = signal(0);

  // ا
  courses = signal<CourseSummaryDto[]>([]);
  isLoading = signal(true);

  
  teacherName = signal('');

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.teacherName.set(localStorage.getItem('name') || 'Teacher');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.courseService.getMyCourses(1, 10).subscribe({
      next: (res: any) => {
        const items: CourseSummaryDto[] = res.data.items;
        this.courses.set(items);

        //  KPIs 
        this.totalCourses.set(res.data.totalCount);
        this.publishedCourses.set(
          items.filter(c => c.status === 'Published').length
        );
        this.totalEnrolledStudents.set(
          items.reduce((sum, c) => sum + (c.totalStudents || 0), 0)
        );
        // rating comuted

        const rated = items.filter(c => (c as any).rating > 0);
        const avg = rated.length > 0
          ? rated.reduce((sum, c) => sum + (c as any).rating, 0) / rated.length
          : 0;
        this.averageCourseRating.set(Math.round(avg * 10) / 10);

        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/teacher/courses/create']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/teacher/courses/edit', id]);
  }

  goToMyCourses(): void {
    this.router.navigate(['/teacher/courses']);
  }
}