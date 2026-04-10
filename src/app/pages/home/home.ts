import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicCourseService } from '../../core/services/public-course.service';
import { CourseSummaryDto } from '../../core/model/courses/course.model';
import { CourseCardComponent } from '../Courses/course-card/course-card.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent],
  templateUrl: './home.html',
})
export class Home implements OnInit {

  courses: CourseSummaryDto[] = [];
  isLoading = false;

  constructor(
    private publicCourseService: PublicCourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.publicCourseService.getAllCourses({}, 1, 4).subscribe({
      next: (res) => {
        this.courses = res.data.items;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; }
    });
  }
}
