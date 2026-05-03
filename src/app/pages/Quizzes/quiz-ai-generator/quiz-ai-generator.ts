import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { AiGeneratedQuestionDto, AiGeneratedQuizDto, GenerateQuizAiRequestDto, QuestionType } from '../../../core/models/quiz';
import { QuizAi } from '../../../core/services/quiz-ai';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-ai-generator',
  imports: [FormsModule,CommonModule],
  templateUrl: './quiz-ai-generator.html',
  styleUrl: './quiz-ai-generator.css',
})
export class QuizAiGenerator {

@Input() quizId!: number;
  @Output() quizSaved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // Step state
  step: 'form' | 'preview' | 'saving' | 'done' = 'form';

  // Form
  request: GenerateQuizAiRequestDto = {
    topic: '',
    questionCount: 5,
    questionType: QuestionType.MCQ,
    pointsPerQuestion: 10,
    difficulty: 'Medium'
  };

  // Generated
  generated: AiGeneratedQuizDto | null = null;

  generating = false;
  saving = false;
  error: string | null = null;

  constructor(
    private quizService: QuizAi,
    private router: Router,
    private cdr:ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  generate(): void {
    if (!this.request.topic.trim()) {
      this.error = 'Please enter a topic.';
      return;
    }
    this.error = null;
    this.generating = true;

    this.quizService.generateQuiz(this.quizId, this.request).subscribe({
      next: (res) => {
        this.generated = res.data;
        this.step = 'preview';
        this.generating = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to generate quiz. Try again.';
        this.generating = false;
        this.cdr.detectChanges();
      }
    });
  }


  removeQuestion(index: number): void {
    if (this.generated) {
      this.generated.questions.splice(index, 1);
    }
  }

  save(): void {
    if (!this.generated) return;
    this.saving = true;

    this.quizService.saveGeneratedQuiz(this.quizId, this.generated).subscribe({
      next: () => {
        this.saving = false;
        this.step = 'done';
        this.quizSaved.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save quiz.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCorrectOption(question: AiGeneratedQuestionDto): string {
    return question.options.find(o => o.isCorrect)?.text ?? '';
  }
}
