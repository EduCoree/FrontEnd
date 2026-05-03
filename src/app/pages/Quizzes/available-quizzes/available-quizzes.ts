import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AvailableQuizDto } from '../../../core/models/quiz';
import { StudentquizService } from '../../../core/services/studentquiz.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-available-quizzes',
  imports: [RouterLink,CommonModule,FormsModule , TranslateModule],
  templateUrl: './available-quizzes.html',
  styleUrl: './available-quizzes.css',
})
export class AvailableQuizzes implements OnInit{
 quizzes: AvailableQuizDto[] = [];
  courseOptions: string[] = ['All'];
  loading = true;
  error: string | null = null;
  selectedCourse = 'All';

    totalPages = 1
  currentPage = 1
  loadingCourses=false;
  

  constructor(
    private studentQuizService: StudentquizService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCourseOptions();
      this.loadQuizzes();
      
    }
  }

  loadQuizzes(): void {
     const params = {
      page: this.currentPage,
      pageSize: 8,
      courseTitle: this.selectedCourse === 'All' ? null : this.selectedCourse,
    };
    this.loading = true;
    this.studentQuizService.getAvailableQuizzes(params).subscribe({
      next: (res) => {
        this.quizzes = res.data.items;
        this.totalPages=res.data.totalPages
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load quizzes.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
   loadCourseOptions(): void {
  this.loadingCourses = true;
  this.studentQuizService.getAvailableCourseTitles().subscribe({
    next: (res) => {
      this.courseOptions = ['All', ...res.data]; 
      this.loadingCourses = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loadingCourses = false;
    }
  });
  }
  onCourseChange(): void {
    this.currentPage=1
    this.loadQuizzes();
  }
   goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage=page
    this.loadQuizzes();
  }

}
