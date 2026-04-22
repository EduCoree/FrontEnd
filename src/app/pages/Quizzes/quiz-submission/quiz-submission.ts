import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-quiz-submission',
  imports: [CommonModule , TranslateModule],
  templateUrl: './quiz-submission.html',
  styleUrl: './quiz-submission.css',
})
export class QuizSubmission {
@Input() answeredCount:number=0;
@Input() TotalQuestions:number=0;
@Input() submetting:boolean = false; 
@Output() ConfirmSubmit= new EventEmitter()
@Output() CancelModal= new EventEmitter();

onConfirm() {
    if (!this.submetting) {
      this.ConfirmSubmit.emit();
    }
  }

  onCancel() {
    if (!this.submetting) {
      this.CancelModal.emit();
    }
  }

}
