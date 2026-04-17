import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { Review, ReviewSummary } from '../../core/models/review.model';
import { TranslateModule } from '@ngx-translate/core';

type SortType = 'recent' | 'highest' | 'lowest';

@Component({
  selector: 'app-reviews',
  imports: [CommonModule, ReactiveFormsModule , TranslateModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews implements OnInit {

  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  courseId = signal<number>(0);
  reviews = signal<Review[]>([]);
  summary = signal<ReviewSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  sortBy = signal<SortType>('recent');
  searchQuery = signal('');

  showForm = signal(false);
  editingReview = signal<Review | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  hoveredStar = signal(0);

  showDeleteModal = signal(false);
  reviewToDelete = signal<Review | null>(null);
  deleting = signal(false);


  tabs: { key: SortType; label: string }[] = [
    { key: 'recent',  label: 'Most Recent'   },
    { key: 'highest', label: 'Highest Rated' },
    { key: 'lowest',  label: 'Lowest Rated'  }
  ];

  form: FormGroup = this.fb.group({
    rating:  [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('courseId'));
    this.courseId.set(id);
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.reviewService.getSummary(this.courseId()).subscribe({
      next: (s) => this.summary.set(s),
      error: () => {}
    });
    this.reviewService.getAll(this.courseId()).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load reviews.');
        this.loading.set(false);
      }
    });
  }

  get filteredReviews(): Review[] {
    let list = [...this.reviews()];
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(r => r.comment?.toLowerCase().includes(q));

    if (this.sortBy() === 'highest') list.sort((a, b) => b.rating - a.rating);
    else if (this.sortBy() === 'lowest') list.sort((a, b) => a.rating - b.rating);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }

  getDistributionPercent(star: number): number {
    const dist = this.summary()?.distribution;
    const total = this.summary()?.totalReviews ?? 0;
    if (!dist || total === 0) return 0;
    return Math.round(((dist[star] ?? 0) / total) * 100);
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }


  setSort(s: SortType) {
    this.sortBy.set(s);
  }

  openCreateForm() {
    this.editingReview.set(null);
    this.form.reset({ rating: 0, comment: '' });
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEditForm(review: Review) {
    this.editingReview.set(review);
    this.form.patchValue({ rating: review.rating, comment: review.comment });
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.hoveredStar.set(0);
  }

  setRating(star: number) {
    this.form.patchValue({ rating: star });
  }

  saveReview() {
    if (this.form.invalid || this.form.value.rating === 0) {
      this.formError.set('Please select a rating.');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);

    const dto = this.form.value;
    const editing = this.editingReview();

    if (editing) {
      this.reviewService.update(this.courseId(), editing.id, dto).subscribe({
        next: (updated) => {
          this.reviews.update(list => list.map(r => r.id === updated.id ? updated : r));
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: () => {
          this.formError.set('Failed to update review.');
          this.saving.set(false);
        }
      });
    } else {
      this.reviewService.create(this.courseId(), dto).subscribe({
        next: (created) => {
          this.reviews.update(list => [created, ...list]);
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: (err) => {
          if (err.status === 409) this.formError.set('You already reviewed this course.');
          else if (err.status === 400) this.formError.set('Active enrollment required.');
          else this.formError.set('Failed to submit review.');
          this.saving.set(false);
        }
      });
    }
  }

  openDeleteModal(review: Review) {
    this.reviewToDelete.set(review);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.reviewToDelete.set(null);
  }

  confirmDelete() {
    const r = this.reviewToDelete();
    if (!r) return;
    this.deleting.set(true);
    this.reviewService.delete(this.courseId(), r.id).subscribe({
      next: () => {
        this.reviews.update(list => list.filter(x => x.id !== r.id));
        this.deleting.set(false);
        this.closeDeleteModal();
        this.loadData();
      },
      error: () => {
        this.deleting.set(false);
        this.closeDeleteModal();
      }
    });
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  getInitials(id: string): string {
    return id.slice(0, 2).toUpperCase();
  }
}