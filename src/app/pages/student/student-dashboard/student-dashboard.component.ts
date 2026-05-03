import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicCourseService } from '../../../core/services/public-course.service';
import { StudentEnrolledCourseDto } from '../../../core/models/course';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule , TranslateModule],
  templateUrl: './student-dashboard.component.html',
})
export class StudentDashboardComponent implements OnInit {

  courses: StudentEnrolledCourseDto[] = [];
  isLoading = false;

  get enrolledCount(): number { return this.courses.length; }
  get completedCount(): number { return this.courses.filter(c => c.progressPercentage === 100).length; }
  get overallProgress(): number {
    if (!this.courses.length) return 0;
    return Math.round(this.courses.reduce((acc, c) => acc + c.progressPercentage, 0) / this.courses.length);
  }

  constructor(
    private publicCourseService: PublicCourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.isLoading = true;
    this.publicCourseService.getMyCoursesWithEnrollment().subscribe({
      next: (res) => {
        this.courses = res.data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; }
    });
  }

  getCircleDashOffset(): number {
    const circumference = 251.2;
    return circumference - (circumference * this.overallProgress / 100);
  }

  getImageUrl(path: string | null): string {
    if (!path) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}/${path}`;
  }
}