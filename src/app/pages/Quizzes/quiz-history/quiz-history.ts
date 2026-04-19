import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { AttemptHistoryDto } from '../../../core/models/quiz';
import { QuizService } from '../../../core/services/quiz.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentquizService } from '../../../core/services/studentquiz.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-quiz-history',
  imports: [CommonModule,RouterLink,FormsModule , TranslateModule],
  templateUrl: './quiz-history.html',
  styleUrl: './quiz-history.css',
})
export class QuizHistory implements OnInit {
 attempts: AttemptHistoryDto[] = [];
  loading = true;
  error: string | null = null;

  // Filters
  activeFilter: 'All' | 'Passed' | 'Failed' = 'All';
  selectedCourse = 'All';
  selectedDateRange = 'All';

  // Pagination
  totalPages = signal(1);
  currentPage = signal(1);

  // Course options from backend
  courseOptions: string[] = ['All'];
  loadingCourses=false;

  constructor(
    private studentquizservice: StudentquizService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCourseOptions()
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.loading = true;

    // Build filter params
    const params = {
      page: this.currentPage(),
      pageSize: 8,
      status: this.activeFilter === 'All' ? null : this.activeFilter,
      courseTitle: this.selectedCourse === 'All' ? null : this.selectedCourse,
      days: this.selectedDateRange === 'All' ? null : Number(this.selectedDateRange),
    };

    this.studentquizservice.getHistory(params).subscribe({
      next: (res) => {
        this.attempts = res.data.items;
        this.totalPages.set(res.data.totalPages);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load history.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCourseOptions(): void {
  this.loadingCourses = true;
  this.studentquizservice.getHistoryCourseTitles().subscribe({
    next: (res) => {
      this.courseOptions = ['All', ...res.data]; 
      this.loadingCourses = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loadingCourses = false;
    }
  });
  }

  get dateRangeOptions(): { label: string; value: string }[] {
    return [
      { label: 'All Time',     value: 'All' },
      { label: 'Last 7 Days',  value: '7'   },
      { label: 'Last 30 Days', value: '30'  },
      { label: 'Last 90 Days', value: '90'  },
    ];
  }

  setFilter(filter: 'All' | 'Passed' | 'Failed'): void {
    this.activeFilter = filter;
    this.currentPage.set(1);
    this.loadHistory();
  }

  onCourseChange(): void {
    this.currentPage.set(1);
    this.loadHistory();
  }

  onDateRangeChange(): void {
    this.currentPage.set(1);
    this.loadHistory();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadHistory();
  }

  getAttemptNumber(attempt: AttemptHistoryDto): number {
    return this.attempts
      .filter(a => a.quizId === attempt.quizId)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .findIndex(a => a.id === attempt.id) + 1;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
