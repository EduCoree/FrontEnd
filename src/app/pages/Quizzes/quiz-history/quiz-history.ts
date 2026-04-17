import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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
  activeFilter: 'All' | 'Passed' | 'Failed' = 'All';
  selectedCourse='All';
  selectedDateRange='All';


  constructor(
    private studentquizservice: StudentquizService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr:ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.loading = true;
    this.studentquizservice.getHistory().subscribe({
      next: (res) => {
        this.attempts = res.data;
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
      get courseOptions(): string[] {
        const titles = this.attempts
    .map(a => a.courseTitle)
    .filter(Boolean) as string[];    // boolean is shortcut for x=>!!x thats remove everything leads to false in like null or undefined 
    return ['All', ...new Set(titles)];  // new set is js ds that remove the duplicates and return unique course titles and the ... to return it back to array
    }

     get dateRangeOptions(): { label: string; value: string }[] {
    return [
      { label: 'All Time',     value: 'All' },
      { label: 'Last 7 Days',  value: '7'   },
      { label: 'Last 30 Days', value: '30'  },
      { label: 'Last 90 Days', value: '90'  },
    ];
  }

  private isWithinRange(dateStr: string): boolean {
    if (this.selectedDateRange === 'All') return true;
    const days = Number(this.selectedDateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(dateStr) >= cutoff;
  }
 
  get filtered(): AttemptHistoryDto[] {
    return this.attempts.filter(a => {
      const matchStatus =
        this.activeFilter === 'All' ||
        (this.activeFilter === 'Passed' && a.passed) ||
        (this.activeFilter === 'Failed' && !a.passed);
 
      const matchCourse =
        this.selectedCourse === 'All' || a.courseTitle === this.selectedCourse;
 
      const matchDate = this.isWithinRange(a.submittedAt ?? a.startedAt);
 
      return matchStatus && matchCourse && matchDate;
    });
  }

    getAttemptNumber(attempt: AttemptHistoryDto): number {
    return this.attempts
      .filter(a => a.quizId === attempt.quizId)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .findIndex(a => a.id === attempt.id) + 1;
  }
 
  setFilter(filter: 'All' | 'Passed' | 'Failed'): void {
    this.activeFilter = filter;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
