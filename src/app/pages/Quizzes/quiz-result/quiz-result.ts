import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AttemptResultDto } from '../../../core/models/quiz';
import { QuizService } from '../../../core/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentquizService } from '../../../core/services/studentquiz.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-quiz-result',
  imports: [CommonModule , TranslateModule],
  templateUrl: './quiz-result.html',
  styleUrl: './quiz-result.css',
})
export class QuizResult implements OnInit {
  

  AttemptResult!:AttemptResultDto;
  quizId!:number;
  AttemptId!:number;
  isloading=true;
  errormessage:string='';



  constructor(private studentquizservice:StudentquizService,private router:Router, private route:ActivatedRoute,private cdr:ChangeDetectorRef)
  {
     
  }
  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.AttemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    const nav = this.router.currentNavigation();
    const state= nav?.extras?.state as {result : AttemptResultDto}
    if(state?.result)
    {
      this.AttemptResult=state.result;
      this.isloading=false;
    }
    else
    {
      this.studentquizservice.getAttemptResult(this.quizId,this.AttemptId)
      .subscribe(
        {
          next:(res)=>
          {
            this.AttemptResult=res.data;
            this.isloading=false;
            this.cdr.detectChanges();

          },
          error:(err)=>
          {
            this.errormessage=err.error?.message||'Something went wrong.please Try Again';
            this.isloading=false;
             this.cdr.detectChanges();

          }

        }
      )
      
    }
}

 get missedCount():number
    {
      return this.AttemptResult.review.filter(q=>!q.isCorrect).length;
    }

  get CorrectCount():number
  {
    return this.AttemptResult.review.filter(q=>q.isCorrect).length;
  }
  retakeQuiz()
  {
    this.router.navigate(['/quiz','intro',this.quizId]) 
  }
  backToCourse()
  {
    this.router.navigate(['/'])
  }
}
