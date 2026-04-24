import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { CourseSidebar } from "../../../shared/components/ui/sidebar/course-sidebar/course-sidebar";
import { FormsModule } from '@angular/forms';
import { QuizDetailsDto, QuestionDto, UpdateQuestionDto, UpdateAnswerOptionDto, ApiResponse, AnswerOptionDto, CreateQuestionDto, CreateAnswerOptionDto } from '../../../core/models/quiz';
import { CenterDelete } from "../../centers/center-delete/center-delete";
import { DeleteQuestionModalComponent } from "../delete-question/delete-question";
import { QuestionService } from '../../../core/services/question.service';
import { AnsweroptionService } from '../../../core/services/answeroption.service';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../../core/services/quiz.service';


interface EditingQuestion {
  question: QuestionDto;
  text: string;
  points: number;
  options: { id: number; text: string; isCorrect: boolean }[];
}
@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [CommonModule, CourseSidebar, FormsModule, DeleteQuestionModalComponent, RouterLink , TranslateModule],
  templateUrl: './quiz-builder.html'
})
export class QuizBuilderComponent implements OnInit {
  courseId!: number;
  quizId!: number;
  quiz: QuizDetailsDto | null = null;
  loading = true;
  successMsg = signal('');
  errorMsg = signal('');
  editingQuestion: EditingQuestion | null = null;
  saving = false;
  isPublishing = false;
  addingQuestion = false;
  questionToDelete: QuestionDto | null = null;
  addingQuestionError: string | null = null;


  currentPage = signal(1);
pageSize = 5;

  newQuestionText = '';
  newQuestionType = 'MCQ';
  newQuestionPoints = 10;
  newQuestionOptions: { text: string; isCorrect: boolean }[] = [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private questionservice: QuestionService,
    private quizService:QuizService,
    private answeroptionservice:AnsweroptionService,
    private cdr: ChangeDetectorRef,
    private router:Router

  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadQuizQuestions();
  }

  loadQuizQuestions(): void {
    this.loading = true;
    this.questionservice.getQuizQuestions(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.flash("error",err.error?.message || err.message || 'Failed to load quiz questions');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  onPublish() {
    this.isPublishing = true;
    this.quizService.publishQuiz(this.quizId).subscribe({
      next: (res) => {
        this.quiz!.isPublished = true; 
        this.isPublishing = false;
        this.flash("success","Quiz published successfully! Students can now see it.");
      },
      error: (err) => {
        this.isPublishing = false;
        this.flash("error",err.error?.message || 'Failed to publish quiz.');
      }
    });
  }

  get totalPoints(): number {
    return this.quiz?.questions.reduce((sum, q) => sum + q.points, 0) ?? 0;
  }

  getQuestionTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'MCQ': 'Multiple Choice',
      'TRUE_FALSE': 'True/False',
    };
    return typeMap[type] || type;
  }

  startEditing(question: QuestionDto): void {
    this.editingQuestion = {
      question,
      text: question.text,
      points: question.points,
      options: question.answerOptions.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    };
  }

  cancelEditing(): void {
    this.editingQuestion = null;
  }

  saveEditing(): void {
    if (!this.editingQuestion || this.saving) return;

    this.saving = true;
    const question = this.editingQuestion.question;
    const originalOptions = question.answerOptions;

    const questionDto: UpdateQuestionDto = {
      text: this.editingQuestion.text,
      points: this.editingQuestion.points
    };

    this.questionservice.updateQuestion( this.quizId, question.id, questionDto).subscribe({
      next: () => {
        const optionUpdates: Observable<ApiResponse<AnswerOptionDto>>[] = [];
        this.editingQuestion!.options.forEach((opt, index) => {
          const originalOpt = originalOptions[index];
          if (originalOpt.text !== opt.text || originalOpt.isCorrect !== opt.isCorrect) {
            optionUpdates.push(
              this.answeroptionservice.updateAnswerOption( question.id, opt.id, {
                text: opt.text,
                isCorrect: opt.isCorrect
              })
            );
          }
        });

        if (optionUpdates.length > 0) {
          forkJoin(optionUpdates).subscribe({
            next: () => {
              this.editingQuestion = null;
              this.saving = false;
              this.loadQuizQuestions();
            },
            error: (err) => {
              this.flash("error",err.error?.message || err.message || 'Failed to update answer options');
              this.saving = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.editingQuestion = null;
          this.saving = false;
          this.loadQuizQuestions();
        }
      },
      error: (err) => {
        this.flash("error",err.error?.message || err.message || 'Failed to update question');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleCorrectOption(index: number): void {
    if (!this.editingQuestion) return;
    this.editingQuestion.options.forEach((opt, i) => {
      opt.isCorrect = i === index;
    });
  }

  updateOptionText(index: number, text: string): void {
    if (!this.editingQuestion) return;
    this.editingQuestion.options[index].text = text;
  }

  updateQuestionText(text: string): void {
    if (!this.editingQuestion) return;
    this.editingQuestion.text = text;
  }

  updateQuestionPoints(points: number): void {
    if (!this.editingQuestion) return;
    this.editingQuestion.points = points;
  }

  isEditing(questionId: number): boolean {
    return this.editingQuestion?.question.id === questionId;
  }

  openDeleteModal(question: QuestionDto): void {
    this.questionToDelete = question;
  }

  closeDeleteModal(): void {
    this.questionToDelete = null;
  }

  onDeleteConfirmed(): void {
    this.questionToDelete = null;
    this.loadQuizQuestions();
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

    this.questionservice.addQuestion(this.quizId, questionDto).subscribe({
      next: (res:ApiResponse<QuestionDto>) => {
        console.log(res);
        const questionId = res.data.id;
        const optionCalls: Observable<ApiResponse<AnswerOptionDto>>[] = validOptions.map(opt => 
          this.answeroptionservice.addanswerOption( questionId, {
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          })
        );

        forkJoin(optionCalls).subscribe({
          next: () => {
            this.resetNewQuestionForm();
            this.loadQuizQuestions();
          },
         error: (err) => {
  if (err.error?.errors) {
    this.addingQuestionError = Object.values(err.error.errors)
      .flat()
      .join(', ');
  } else {
    this.addingQuestionError = 'Failed to add answer options';
  }
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
  onQuestionTypeChange(newtype:string):void
   {
      this.newQuestionType = newtype;

  if (newtype === 'TRUEFALSE') {
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
  AddQuestion()
  {
     
    this.router.navigate(
  ['teacher','quizzes', this.quizId,'add-question'],
    )
  
 

  }

   private flash(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMsg.set(msg);
      this.errorMsg.set('');
      setTimeout(() => this.successMsg.set(''), 3500);
    } else {
      this.errorMsg.set(msg);
      this.successMsg.set('');
      setTimeout(() => this.errorMsg.set(''), 3500);
    }
  }
  get paginatedQuestions(): QuestionDto[] {
  if (!this.quiz?.questions) return [];
  
  const startIndex = (this.currentPage() - 1) * this.pageSize;
  return this.quiz.questions.slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil((this.quiz?.questions.length || 0) / this.pageSize);
}

goToPage(page: number): void {
  this.currentPage.set(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}