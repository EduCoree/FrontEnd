import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseCardComponent } from '../course-card/course-card.component';
import { CourseFilterDto, CourseSummaryDto, PagedResult } from '../../../core/models/course';
import { PublicCourseService } from '../../../core/services/public-course.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CourseCardComponent , TranslateModule],
  templateUrl: './courses-list.component.html',
})
export class CoursesListComponent implements OnInit {

  courses: CourseSummaryDto[] = [];
  isLoading = false;
  totalPages = 0;
  currentPage = 1;
  pageSize = 9;

  filter: CourseFilterDto = {
    search: '',
    level: '',
    pricingType: '',
  };

  levels = ['Beginner', 'Intermediate', 'Advanced'];
  pricingTypes = ['Free', 'Paid'];

  constructor(private PublicCourseService: PublicCourseService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
  this.isLoading = true;
  this.PublicCourseService.getAllCourses(this.filter, this.currentPage, this.pageSize)
    .subscribe({
      next: (res) => {
        this.courses = res.data.items; 
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; }
    });
}

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCourses();
  }

  resetFilters(): void {
    this.filter = { search: '', level: '', pricingType: '' };
    this.currentPage = 1;
    this.loadCourses();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCourses();
  }
}