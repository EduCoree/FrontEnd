import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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


interface EditingQuestion {
  question: QuestionDto;
  text: string;
  points: number;
  options: { id: number; text: string; isCorrect: boolean }[];
}
@Component({
  selector: 'app-quiz-builder',
  standalone: true,
  imports: [CommonModule, CourseSidebar, FormsModule, DeleteQuestionModalComponent, RouterLink],
  templateUrl: './quiz-builder.html'
})
export class QuizBuilderComponent implements OnInit {
  courseId!: number;
  quizId!: number;
  quiz: QuizDetailsDto | null = null;
  loading = true;
  error: string | null = null;
  editingQuestion: EditingQuestion | null = null;
  saving = false;

  addingQuestion = false;

  questionToDelete: QuestionDto | null = null;

  addingQuestionError: string | null = null;

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
    this.error = null;
    this.questionservice.getQuizQuestions(this.quizId).subscribe({
      next: (res) => {
        this.quiz = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || err.message || 'Failed to load quiz questions';
        this.loading = false;
        this.cdr.detectChanges();
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
              this.error = err.error?.message || err.message || 'Failed to update answer options';
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
        this.error = err.error?.message || err.message || 'Failed to update question';
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
  { queryParams: { name: this.quiz?.title } }
    )
  
 

  }
}