import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { Router } from '@angular/router';
import { AiGeneratedQuizDto, CreateQuizDto, GenerateQuizAiRequestDto, QuestionType } from '../../../core/models/quiz';
import { QuizAi } from '../../../core/services/quiz-ai';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Step = 'form' | 'preview' | 'done';
@Component({
  selector: 'app-quiz-ai-wizard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './quiz-ai-wizard.html',
  styleUrl: './quiz-ai-wizard.css',
})
export class QuizAiWizard {
 

  @Input({ required: true }) courseId!: number;
 
  @Output() cancelled = new EventEmitter<void>();
  @Output() quizCreated = new EventEmitter<{ quizId: number }>();
 
  private quizService = inject(QuizService);
  private quizAi = inject(QuizAi);
  private router = inject(Router);
 
  // UI state
  step = signal<Step>('form');
  generating = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  generated = signal<AiGeneratedQuizDto | null>(null);
  createdQuizId = signal<number | null>(null);
 
  // Form values
  quizTitle = '';
  quizSettings: Omit<CreateQuizDto, 'title'> = {
    timeLimitMins: 60,
    passScore: 50,
    maxAttempts: 1,
    isRandomized: false,
  };
 
  request: GenerateQuizAiRequestDto = {
    topic: '',
    questionCount: 10,
    pointsPerQuestion: 10,
    questionType: QuestionType.MCQ,
    difficulty: 'Medium',
  };
 
  toggleRandomized(): void {
    this.quizSettings.isRandomized = !this.quizSettings.isRandomized;
  }
 
  generate(): void {
    if (!this.quizTitle.trim() || !this.request.topic.trim()) {
      this.error.set('Please fill in the quiz title and topic.');
      return;
    }
 
    this.generating.set(true);
    this.error.set(null);
 
    const createDto: CreateQuizDto = {
      title: this.quizTitle,
      timeLimitMins: this.quizSettings.timeLimitMins,
      passScore: this.quizSettings.passScore,
      maxAttempts: this.quizSettings.maxAttempts,
      isRandomized: this.quizSettings.isRandomized,
    };
 
    // Step 1: Create quiz
    this.quizService.createQuiz(this.courseId, createDto).subscribe({
      next: (res) => {
        this.createdQuizId.set(res.data.id);
 
        // Step 2: Generate questions
        this.quizAi.generateQuiz(res.data.id, this.request).subscribe({
          next: (res) => {
            this.generated.set(res.data);
            this.step.set('preview');
            this.generating.set(false);
          },
          error: (err) => {
            this.error.set(err?.error?.message ?? 'Failed to generate questions. Please try again.');
            this.generating.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to create quiz. Please try again.');
        this.generating.set(false);
      },
    });
  }
 
  regenerate(): void {
    this.step.set('form');
    this.generated.set(null);
    this.error.set(null);
  }
 
  removeQuestion(index: number): void {
    const current = this.generated();
    if (!current) return;
 
    this.generated.set({
      ...current,
      questions: current.questions.filter((_, i) => i !== index),
    });
  }
 
  // Step 3: Save reviewed questions
  save(): void {
    const quiz = this.generated();
    const quizId = this.createdQuizId();
    if (!quiz || quiz.questions.length === 0 || !quizId) return;
 
    this.saving.set(true);
    this.error.set(null);
 
    this.quizAi.saveGeneratedQuiz(quizId, quiz).subscribe({
      next: () => {
        this.step.set('done');
        this.quizCreated.emit({ quizId });
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to save questions. Please try again.');
        this.saving.set(false);
      },
    });
  }
 
  openBuilder(): void {
    const id = this.createdQuizId();
    if (id) {
      this.router.navigate(['/courses/quiz-builder', id]);
    }
    this.cancelled.emit();
  }
 
  onCancel(): void {
    this.cancelled.emit();
  }
}
