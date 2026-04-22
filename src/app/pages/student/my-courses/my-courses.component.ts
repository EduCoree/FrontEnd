import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicCourseService } from '../../../core/services/public-course.service';
import { StudentEnrolledCourseDto } from '../../../core/models/course';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule , TranslateModule],
  templateUrl: './my-courses.component.html',
})
export class MyCoursesComponent implements OnInit {

  courses: StudentEnrolledCourseDto[] = [];
  isLoading = false;
  filter: 'active' | 'completed' | 'all' = 'active';

  get filteredCourses(): StudentEnrolledCourseDto[] {
    switch (this.filter) {
      case 'active':    return this.courses.filter(c => c.progressPercentage < 100);
      case 'completed': return this.courses.filter(c => c.progressPercentage === 100);
      default:          return this.courses;
    }
  }

  get featuredCourse(): StudentEnrolledCourseDto | null {
    return this.filteredCourses[0] ?? null;
  }

  get restCourses(): StudentEnrolledCourseDto[] {
    return this.filteredCourses.slice(1);
  }

  constructor(
    private publicCourseService: PublicCourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
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

  tabs: { label: string; value: 'active' | 'completed' | 'all' }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' }
];

setFilter(f: 'active' | 'completed' | 'all'): void {
  this.filter = f;
}
}