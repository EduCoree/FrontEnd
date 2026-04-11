import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { QuizService } from '../../core/services/quiz.service';
import { AnswerOptionDto, ApiResponse, CreateQuestionDto, QuestionDto, QuizDetailsDto, QuizDto } from '../../core/models/quiz';
import { forkJoin, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-question',
  imports: [CommonModule,FormsModule],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css',
})
export class AddQuestion implements OnInit {
addingQuestion = false;
 addingQuestionError: string | null = null;
 newQuestionText = '';
 newQuestionPoints = 10;
 newQuestionOptions: { text: string; isCorrect: boolean }[] = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ];
  newQuestionType = 'MCQ';
    courseId!: number;
    quizId!: number;
    quiz: QuizDto | null = null;
    loading = true;
    error: string | null = null;
    saving = false;

    quizName:string|null=null;
  
constructor(private quizservice:QuizService,private cdr:ChangeDetectorRef,private route:ActivatedRoute,private router:Router)
{
   this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.route.queryParamMap.subscribe(params => {
   this.quizName = params.get('name');
});
  
}
  ngOnInit(): void {
     this.quizservice.getQuizById(this.courseId, this.quizId).subscribe(res => {
    this.quiz = res.data;

    // 3. Override with real value
    this.quizName = this.quiz.title;
    console.log(this.quiz.questionsCount);
    this.cdr.detectChanges();
  });
  }
 addNewOption(): void {
     this.newQuestionOptions.push({ text: '', isCorrect: false });
   }
 
   removeNewOption(index: number): void {
     if (this.newQuestionOptions.length > 2) {
       this.newQuestionOptions.splice(index, 1);
     }
   }
 
   setNewOptionCorrect(index: number): void {
     this.newQuestionOptions.forEach((opt, i) => {
       opt.isCorrect = i === index;
     });
   }
   onQuestionTypeChange(newtype:string):void
   {
      this.newQuestionType = newtype;

  if (newtype === 'TrueFalse') {
    // Set exactly 2 options for True/False
    this.newQuestionOptions = [
      { text: 'True', isCorrect: false },
      { text: 'False', isCorrect: false }
    ];
  } else if (newtype === 'MCQ') {
    // Reset to default empty options for MCQ
    this.newQuestionOptions = [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ];
   }
  }
    
   saveNewQuestion(): void {
     this.addingQuestionError = null;
     if (!this.newQuestionText.trim()) {
       this.addingQuestionError = 'Question text is required';
       return;
     }
     const validOptions = this.newQuestionOptions.filter(opt => opt.text.trim());
     if (validOptions.length < 2) {
       this.addingQuestionError = 'At least 2 answer options are required';
       return;
     }
     if (!validOptions.some(opt => opt.isCorrect)) {
       this.addingQuestionError = 'Please select a correct answer';
       return;
     }
 
     this.addingQuestion = true;
     const questionDto: CreateQuestionDto = {
       text: this.newQuestionText.trim(),
       type: this.newQuestionType,
       points: this.newQuestionPoints
     };
 
     this.quizservice.addQuestion(this.courseId, this.quizId, questionDto).subscribe({
       next: (res:ApiResponse<QuestionDto>) => {
         console.log(res);
         const questionId = res.data.id;
         const optionCalls: Observable<ApiResponse<AnswerOptionDto>>[] = validOptions.map(opt => 
           this.quizservice.addanswerOption(this.courseId, this.quizId, questionId, {
             text: opt.text.trim(),
             isCorrect: opt.isCorrect
           })
         );
 
         forkJoin(optionCalls).subscribe({
           next: () => {
  this.saving = false;
  this.router.navigate([
    '/teacher/courses', this.courseId,
    'quizzes', this.quizId, 'builder'
  ]);
},
          error: (err) => {
   if (err.error?.errors) {
     this.addingQuestionError = Object.values(err.error.errors)
       .flat()
       .join(', ');
   } else {
     this.addingQuestionError = 'Failed to add answer options';
   }
 
   console.log('Option error:', err); // 🔥 VERY IMPORTANT
   this.addingQuestion = false;
 }
         });
       },
       error: (err) => {
         this.addingQuestionError = err.error?.message || 'Failed to add question';
         this.addingQuestion = false;
         this.cdr.detectChanges();
       }
     });
   }
 
   resetNewQuestionForm(): void {
     this.newQuestionText = '';
     this.newQuestionType = 'MCQ';
     this.newQuestionPoints = 10;
     this.newQuestionOptions = [
       { text: '', isCorrect: true },
       { text: '', isCorrect: false }
     ];
     this.addingQuestion = false;
     this.addingQuestionError = null;
   }
}
