import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../../../core/services/quiz.service';


@Component({
  selector: 'app-create-quiz',
  templateUrl: './create-quiz.html',
  imports:[CommonModule,ReactiveFormsModule],
  styleUrls: ['./create-quiz.css']
})
export class CreateQuizComponent implements OnInit {
  @Input() courseId!: number;
  @Output() quizCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  quizForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  constructor(private fb: FormBuilder, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(160)]],
      timeLimitMins: [null],
      passScore: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAttempts: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      isRandomized: [false]
  }
    );
  }
  onsubmit(): void {
    if (this.quizForm.invalid) 
      return;
    this.isLoading = true;
    this.quizService.createQuiz(this.courseId, this.quizForm.value).subscribe(
      {
        next: () => {
          this.isLoading = false;
          this.quizCreated.emit();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create quiz. Please try again.';
        }
      }
    )
    }
  onCancel(): void {
    this.cancelled.emit();
  }
  toggleRandomized(): void {
    const currentValue = this.quizForm.get('isRandomized')?.value;
    this.quizForm.get('isRandomized')?.setValue(!currentValue);
  }

}