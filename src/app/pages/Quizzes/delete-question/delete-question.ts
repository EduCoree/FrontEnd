// delete-question-modal.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../../core/services/quiz.service';


@Component({
  selector: 'app-delete-question-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-question.html'
})
export class DeleteQuestionModalComponent {

  @Input() courseId!: number;
  @Input() quizId!: number;
  @Input() questionId!: number;
  @Input() questionText = '';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = false;
  deleteError: string | null = null;

  constructor(private quizService: QuizService,private cdr:ChangeDetectorRef) {}

  confirm(): void {
    this.deleting = true;
    this.deleteError = null;
    this.quizService.deleteQuestion(this.courseId, this.quizId, this.questionId).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmed.emit();
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        this.deleteError = err.error?.message || 'Failed to delete question. Please try again.';
        this.deleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}