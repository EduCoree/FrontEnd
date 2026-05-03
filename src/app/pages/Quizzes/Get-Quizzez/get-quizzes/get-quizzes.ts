import { ChangeDetectorRef, Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';
import { QuizDto } from '../../../../core/models/quiz';
import { CreateQuizComponent } from '../../CreateQuiz/create-quiz/create-quiz';
import { FormsModule } from '@angular/forms';
import { CourseSidebar } from "../../../../shared/components/ui/sidebar/course-sidebar/course-sidebar";
import { EditQuiz } from "../../edit-quiz/edit-quiz";
import { TranslateModule } from '@ngx-translate/core';
import { QuizAiWizard } from "../../quiz-ai-wizard/quiz-ai-wizard";


@Component({
  selector: 'app-quiz',
  templateUrl: './get-quizzes.html',
  imports: [CommonModule, CreateQuizComponent, FormsModule, CourseSidebar, RouterLink, EditQuiz, TranslateModule, Sidebar, QuizAiWizard],
})
export class QuizComponent implements OnInit {
  courseId!: number;
  quizzes:QuizDto[] = [];
  isLoading = false;
  errorMessage = '';
   searchTerm = '';
  showCreateModal = false;
  showEditModal=false;
  selectedQuizId :number|null=null;
  openMenuId: number | null = null;
   totalPages = signal(1);
  currentPage = signal(1);
  showAiWizard=signal(false);
 
  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef,
    private router: Router
    
  ) {}

  get showSidebar(): boolean {
    return !this.router.url.includes('/teacher/courses/edit/');
  }

  ngOnInit(): void {
    const courseIdParam =
      this.route.snapshot.paramMap.get('courseId') ||
      this.route.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('courseId') ||
      this.route.parent?.snapshot.paramMap.get('id');

    this.courseId = courseIdParam ? Number(courseIdParam) : 0;
    this.loadQuizzes();
  }
   get avgPassScore(): number {
    if (!this.quizzes.length) return 0;
    const sum = this.quizzes.reduce((s, q) => s + q.passScore, 0);
    return Math.round(sum / this.quizzes.length);
  }
    get randomizedCount(): number {
    return this.quizzes.filter(q => q.isRandomized).length;
  }

  get noLimitCount(): number {
    return this.quizzes.filter(q => !q.timeLimitMins).length;
  }
get filteredQuizzes(): QuizDto[] {
    if (!this.searchTerm.trim()) return this.quizzes;
    return this.quizzes.filter(q =>
      q.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  loadQuizzes(): void {
    const params = {
     page: this.currentPage(),
      pageSize: 5,
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.quizService.getQuizzes(this.courseId,params).subscribe({
      next: (res) => {
        this.quizzes = res.data.items
        this.totalPages.set(res.data.totalPages);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Could not load quizzes. Please check your connection and try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onQuizCreated(): void {
    this.showCreateModal = false;
    this.loadQuizzes();
  }

  onDelete(quizId: number): void {
    this.quizService.deleteQuiz( quizId).subscribe({
      next: () => this.loadQuizzes(),
      error: () => this.errorMessage = 'Failed to delete quiz.'
    });
  }


  onOpenBuilder(quizId:number)
  {
    
    this.router.navigate(
  ['/teacher/quizzes', quizId, 'builder'],
 
);
  }
  toggleMenu(quizId:number|null)
  {
      this.openMenuId = this.openMenuId === quizId ? null : quizId;
  }
  onEdit(quizId: number): void {
    this.selectedQuizId=quizId;
   this.showEditModal=true;
   
}
onQuizUpdated() {
  this.showEditModal = false;
  this.loadQuizzes(); 
}
 
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    this.openMenuId = null;
  }
}
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadQuizzes();
  }

  onAiQuizSaved(): void {
  this.showAiWizard.set(false);
  this.loadQuizzes();
}
getcourseTitle(): string {
  return this.quizzes[0]?.courseTitle ?? '';
}
}