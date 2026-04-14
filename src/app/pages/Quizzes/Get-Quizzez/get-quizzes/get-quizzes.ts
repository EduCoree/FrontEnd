import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { QuizService } from '../../../../core/services/quiz.service';
import { QuizDto } from '../../../../core/models/quiz';
import { CreateQuizComponent } from '../../CreateQuiz/create-quiz/create-quiz';
import { FormsModule } from '@angular/forms';
import { CourseSidebar } from "../../../../shared/components/ui/sidebar/course-sidebar/course-sidebar";
import { Sidebar } from "../../../../shared/components/ui/sidebar/sidebar";

@Component({
  selector: 'app-quiz',
  templateUrl: './get-quizzes.html',
  imports: [CommonModule, CreateQuizComponent, FormsModule, CourseSidebar, Sidebar, RouterLink],
})
export class QuizComponent implements OnInit {
  courseId!: number;
  quizzes:QuizDto[] = [];
  isLoading = false;
  errorMessage = '';
   searchTerm = '';
   courseTitle='jndjendije';
  showCreateModal = false;
 
  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef,
    private router: Router
    
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
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
    this.isLoading = true;
    this.errorMessage = '';
    this.quizService.getQuizzes(this.courseId).subscribe({
      next: (data) => {
        this.quizzes = data;
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
    this.quizService.deleteQuiz(this.courseId, quizId).subscribe({
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
}