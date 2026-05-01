import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewService } from '../../../core/services/review.service';
import { CourseService } from '../../../core/services/course';
import { Review } from '../../../core/models/review.model';
import { ApiResponse } from '../../../core/models/payout.model';

@Component({
  selector: 'app-teacher-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './teacher-reviews.component.html',
  styles: [
    ".icon-fill { font-variation-settings: 'FILL' 1; }",
    ".filled-star { color: #f59e0b; }",
  ],
})
export class TeacherReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private courseService = inject(CourseService);

  reviews: Review[] = [];
  isLoading = false;
  error: string | null = null;

  // Filters
  selectedCourseId: number | undefined = undefined;
  selectedMinRating: number | undefined = undefined;

  // For delete confirmation
  deletingReviewId: number | null = null;

  courses: Array<{ id: number; name: string }> = [];

  ratingFilters = [
    { label: 'All', value: undefined },
    { label: '4★+', value: 4 },
    { label: 'Critical', value: undefined, max: 3 },
  ];

  activeRatingFilter = 'All';

  ngOnInit(): void {
    this.loadTeacherCourses();
    this.loadReviews();
  }

  loadTeacherCourses(): void {
    this.courseService.getMyCourses(1, 100).subscribe({
      next: (res: any) => {
        this.courses = (res?.data?.items ?? []).map((course: any) => ({
          id: course.id,
          name: course.title || course.name || 'Untitled Course',
        }));
      },
      error: () => {
        this.courses = [];
      },
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.error = null;

    this.reviewService
      .getTeacherReviews(this.selectedCourseId, this.selectedMinRating)
      .subscribe({
        next: (res: ApiResponse<Review[]>) => {
          this.reviews = res.data;
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to load reviews. Please try again.';
          this.isLoading = false;
        },
      });
  }

  onCourseChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCourseId = val ? +val : undefined;
    this.loadReviews();
  }

  onRatingFilter(label: string, minRating?: number): void {
    this.activeRatingFilter = label;
    this.selectedMinRating = minRating;
    this.loadReviews();
  }

  get globalAverage(): string {
    if (!this.reviews.length) return '—';
    const avg = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    return avg.toFixed(1);
  }

  deleteReview(reviewId: number): void {
    this.deletingReviewId = reviewId;
    this.reviewService.deleteAsTeacher(reviewId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== reviewId);
        this.deletingReviewId = null;
      },
      error: () => {
        this.deletingReviewId = null;
        this.error = 'Failed to delete review. Please try again.';
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarClass(index: number): string {
    const classes = [
      'bg-secondary-container text-on-secondary-container',
      'bg-tertiary-container text-on-tertiary-container',
      'bg-primary-container text-on-primary-container',
    ];
    return classes[index % classes.length];
  }

  trackById(_: number, review: Review): number {
    return review.id;
  }
}