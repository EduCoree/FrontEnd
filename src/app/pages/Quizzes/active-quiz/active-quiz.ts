import { StudentquizService } from './../../../core/services/studentquiz.service';

import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { StudentAnswerOptionDto, StudentQuestionDto, StudentQuizDto } from '../../../core/models/quiz';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuizSubmission } from "../quiz-submission/quiz-submission";
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-active-quiz',
  imports: [CommonModule, RouterLinkActive, RouterLink, QuizSubmission , TranslateModule],
  templateUrl: './active-quiz.html',
  styleUrl: './active-quiz.css',
})
export class ActiveQuiz implements OnInit,OnDestroy {
quizId!: number;
  attemptId!: number;
  quiz: StudentQuizDto | null = null;
  StudentQuestion:StudentQuestionDto|null=null;
  StudentAnswerOptionDto:StudentAnswerOptionDto|null=null;
  showSubmitModal:boolean=false;

  loading = true;
  error: string | null = null;
  currentIndex = 0;
  answers: Map<number, number> = new Map();
  markedForReview: Set<number> = new Set();
  timeLeftSeconds = 0;
  private timerInterval: any;
  submitting = false;
  submitError: string | null = null;
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentquizservice: StudentquizService,
    private cdr:ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
 
  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    if (isPlatformBrowser(this.platformId)) this.loadQuiz();
  }
 
  ngOnDestroy(): void {
    this.clearTimer();
  }
 
  loadQuiz(): void {
    this.loading = true;
    this.error = null;
    this.studentquizservice.getStudentQuiz(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res.data;
        this.loading = false;
        if (this.quiz.timeLimitMins) {
          this.timeLeftSeconds = this.quiz.timeLimitMins * 60;
          this.startTimer();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load quiz.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  // ===== Timer =====
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeftSeconds > 0) {
        this.timeLeftSeconds--;
        this.cdr.detectChanges();
      } else {
        this.clearTimer();
        this.submitQuiz(); 
      }
    }, 1000);
  }
 
  private clearTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
 
  get formattedTime(): string {
    const m = Math.floor(this.timeLeftSeconds / 60).toString().padStart(2, '0');
    const s = (this.timeLeftSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
 
  get isTimeLow(): boolean {
    return this.timeLeftSeconds < 60 && this.timeLeftSeconds > 0;
  }
 
  // ===== Current Question =====
  get currentQuestion(): StudentQuestionDto | null {
    return this.quiz?.questions[this.currentIndex] ?? null;
  }
 
  get totalQuestions(): number {
    return this.quiz?.questions.length ?? 0;
  }
 
  get progressWidth(): string {
    return `${((this.currentIndex + 1) / this.totalQuestions) * 100}%`;
  }
 
  // ===== Answer Selection =====
  selectOption(optionId: number): void {
    if (!this.currentQuestion) return;
    this.answers.set(this.currentQuestion.id, optionId);
  }
 
  isSelected(optionId: number): boolean {
    return this.answers.get(this.currentQuestion?.id ?? -1) === optionId;
  }
 
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }
 
  // ===== Navigation =====
  goTo(index: number): void {
    if (index >= 0 && index < this.totalQuestions) {
      this.currentIndex = index;
    }
  }
 
  next(): void {
    if (this.currentIndex < this.totalQuestions - 1) {
      this.currentIndex++;
    } else {
      this.showSubmitModal=true;
    }
  }
 
  previous(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }
 
  get isLastQuestion(): boolean {
    return this.currentIndex === this.totalQuestions - 1;
  }
 
  // ===== Question Map State =====
  questionState(index: number): 'answered' | 'current' | 'marked' | 'unseen' {
    if (index === this.currentIndex) return 'current';
    const qId = this.quiz?.questions[index]?.id;
    if (qId && this.markedForReview.has(qId)) return 'marked';
    if (qId && this.answers.has(qId)) return 'answered';
    return 'unseen';
  }
 
  // ===== Mark for Review =====
  toggleMarkForReview(): void {
    if (!this.currentQuestion) return;
    const id = this.currentQuestion.id;
    if (this.markedForReview.has(id)) {
      this.markedForReview.delete(id);
    } else {
      this.markedForReview.add(id);
    }
  }
 
  get isMarked(): boolean {
    return this.markedForReview.has(this.currentQuestion?.id ?? -1);
  }
 
  // ===== Submit =====
  submitQuiz(): void {
    if (this.submitting) return;
    this.submitting = true;
    this.submitError = null;
    this.clearTimer();
 
    const answers = Array.from(this.answers.entries()).map(([questionId, answerOptionId]) => ({
      questionId,
      answerOptionId
    }));
    this.cdr.detectChanges();
 
    this.studentquizservice.submitAttempt(this.quizId, this.attemptId, { answers }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/Quiz',this.quizId,'result',this.attemptId],{state:{result:res.data}})
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Failed to submit. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
 
  exitQuiz(): void {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      this.clearTimer();
      this.router.navigate(['/student/quizzes', this.quizId]);
    }
  }
}
