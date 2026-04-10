import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../core/services/course';
import { CourseSummaryDto } from '../../../core/models/course';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.css'
})
export class MyCoursesComponent implements OnInit {
teacherName = localStorage.getItem('name') || 'Teacher';
  courses = signal<CourseSummaryDto[]>([]);
  isLoading = signal(true);
  totalPages = signal(1);
  currentPage = 1;

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.courseService.getMyCourses(this.currentPage).subscribe({
      next: (res) => {
        this.courses.set(res.data.items);
        this.totalPages.set(res.data.totalPages);
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

  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) return;
    this.courseService.deleteCourse(id).subscribe({
      next: () => this.loadCourses()
    });
  }

  togglePublish(course: CourseSummaryDto): void {
    const action = course.status === 'Published'
      ? this.courseService.unpublishCourse(course.id)
      : this.courseService.publishCourse(course.id);
    action.subscribe({ next: () => this.loadCourses() });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadCourses();
  }
  goToDashboard(): void {
  this.router.navigate(['/teacher/dashboard']);
}
}