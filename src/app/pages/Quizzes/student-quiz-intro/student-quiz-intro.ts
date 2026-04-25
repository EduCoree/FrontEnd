import { AuthService } from '../../../core/services/auth';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { AttemptHistoryDto, QuizAttemptHistoryDto, QuizDto, QuizSummaryDto } from '../../../core/models/quiz';
import { StudentquizService } from '../../../core/services/studentquiz.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-student-quiz-intro',
  imports: [CommonModule , TranslateModule],
  templateUrl: './student-quiz-intro.html',
  styleUrl: './student-quiz-intro.css',
})
export class StudentQuizIntro implements OnInit {

  studentName:string|undefined=undefined;
  quizId!: number;

  quiz: QuizSummaryDto | null = null;
  attempts: QuizAttemptHistoryDto[] = [];   // filtered by quizId

  loading = true;
  error: string | null = null;

  starting = false;
  startError: string | null = null;

  currentPage= signal(1);
  totalPages = signal(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentQuizService: StudentquizService,
    private authService:AuthService,
    private cdr : ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    if (isPlatformBrowser(this.platformId)) this.loadData();
    this.studentName= this.authService.currentUser()?.name;
   

  }
  loadData(): void {
    this.loading = true;
    this.error = null;
    const params = {
     page: this.currentPage(),
      pageSize: 3,
    }
    // Load quiz info and history in parallel
  forkJoin({
    quiz: this.studentQuizService.getQuizSummary(this.quizId),
    history: this.studentQuizService.getQuizHistory(this.quizId,params).pipe(
                 catchError(() => of({ data: { items: [], totalPages:0}})                      
                 ))
}).subscribe({
    next: ({ quiz, history }) => {
        this.quiz = quiz.data;
        this.attempts = history.data.items;
        this.totalPages.set(history.data.totalPages);
        this.loading = false;
        this.cdr.detectChanges();
    },
    error: (err) => {
        // only hits if quiz summary fails
        this.error = err.error?.message;
        this.loading = false;
        this.cdr.detectChanges();
    }
});
  }

  get attemptsRemaining(): number {
    if (!this.quiz) return 0;
    return this.quiz.maxAttempts - this.quiz.maxAttempts;
  }

  get canStart(): boolean {
    return this.quiz!.attemptsLeft > 0;
  }

  // Score bar width % capped at 100
  scoreWidth(score: number): string {
    return `${Math.min(score, 100)}%`;
  }

  // Green if passed, red if failed
  scoreColor(passed: boolean): string {
    return passed ? 'bg-primary' : 'bg-error';
  }

  startQuiz(): void {
    if (!this.canStart || this.starting) return;
    this.starting = true;
    this.startError = null;

    this.studentQuizService.startAttempt(this.quizId).subscribe({
      next: (res) => {
        this.starting = false;
        this.router.navigate(['quiz', this.quizId, 'attempt', res.data.id]);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.startError = err.error?.message || 'Could not start quiz. Please try again.';
        this.starting = false;
        this.cdr.detectChanges();
      }
    });
  }
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadData();
  }
}



