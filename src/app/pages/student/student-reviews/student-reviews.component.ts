import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-student-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './student-reviews.component.html',
  styleUrls: ['./student-reviews.component.css'],
})
export class StudentReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);

  reviews: Review[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.error = null;

    this.reviewService.getMyReviews().subscribe({
      next: (res) => {
        this.reviews = res.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load your reviews. Please try again.';
        this.isLoading = false;
      },
    });
  }

  get filteredReviews(): Review[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.reviews.filter((review) => {
      if (!query) return true;
      return (
        review.comment?.toLowerCase().includes(query) ||
        review.courseName?.toLowerCase().includes(query)
      );
    });
  }

  get averageRating(): string {
    if (!this.reviews.length) return '0.0';
    const avg = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
    return avg.toFixed(1);
  }

  get uniqueCoursesCount(): number {
    return new Set(this.reviews.map((review) => review.courseId)).size;
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  getStatus(review: Review): string {
    return review.rating >= 4 ? 'Published' : 'Under Review';
  }

  getInitials(text: string): string {
    return text
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  deleteReview(review: Review): void {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.reviewService.delete(review.courseId, review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((item) => item.id !== review.id);
      },
      error: () => {
        this.error = 'Failed to delete review. Please try again.';
      }
    });
  }
}
