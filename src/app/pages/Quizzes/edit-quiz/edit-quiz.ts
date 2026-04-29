import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuizService } from '../../../core/services/quiz.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-quiz',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './edit-quiz.html',
  styleUrl: './edit-quiz.css',
})
export class EditQuiz {
@Input({ required: true }) quizId!: number;
  
  @Output() updated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

    quizForm!: FormGroup;
  isLoading = true;
  isSaving=false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private quizService: QuizService,private cdr:ChangeDetectorRef) {}

   ngOnInit(): void {
    this.initForm();
    this.LoadquizData();
   
  }
  private initForm():void{
   this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(160)]],
      timeLimitMins: [null],
      passScore: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAttempts: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      isRandomized: [false]
  }
    );
  }

  private LoadquizData():void{
   this.isLoading=true;
   this.quizService.getQuizById(this.quizId).subscribe(
    {
      next:(data)=>
      {
        this.quizForm.patchValue(data.data);
        this.isLoading = false;
        this.cdr.detectChanges();

      },
      error:(err)=>
      {
        this.errorMessage=err.error?.message||'Failed To Load Quiz';
        this.isLoading=false;
        this.cdr.detectChanges();
      }
    }
   )
  }
  onSave() {
     if (this.quizForm.invalid) 
      return;
    this.isSaving = true;
    if (this.quizForm.valid) {
      this.quizService.updateQuiz(this.quizId, this.quizForm.value).subscribe(
        {
           next: () => {
          this.isSaving = false;
          this.updated.emit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
           this.errorMessage=err.error?.message||'Failed To update Quiz';
           this.cdr.detectChanges();
        }
        }
      )
    }
  }
   onCancel(): void {
    this.cancelled.emit();
    this.cdr.detectChanges();
  }
toggleRandomized(): void {
    const currentValue = this.quizForm.get('isRandomized')?.value;
    this.quizForm.get('isRandomized')?.setValue(!currentValue);
  }


}
