import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseDetailDto } from '../../../core/models/course';
import { PublicCourseService } from '../../../core/services/public-course.service';
import { EnrollmentModalComponent } from "../../enroll&payment/enrollment-modal/enrollment-modal.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EnrollmentModalComponent,TranslateModule],
  templateUrl: './course-detail.component.html',
})
export class CourseDetailComponent implements OnInit {

  course: CourseDetailDto | null = null;
  isLoading = false;
  openSectionId: number | null = null;
  showEnrollmentModal = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicCourseService: PublicCourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse(id);
  }

  loadCourse(id: number): void {
    this.isLoading = true;
    this.publicCourseService.getCourseById(id).subscribe({
      next: (res) => {
        this.course = res.data;
        if (this.course?.sections?.length) {
          this.openSectionId = this.course.sections[0].id;
        }
        this.isLoading = false;
        this.cdr.markForCheck(); 
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleSection(id: number): void {
    this.openSectionId = this.openSectionId === id ? null : id;
    this.cdr.markForCheck();
  }

  getTotalLessons(): number {
    return this.course?.sections?.reduce((acc, s) => acc + s.lessons.length, 0) ?? 0;
  }

  getLessonIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'video': return 'play_circle';
      case 'pdf': return 'description';
      case 'quiz': return 'quiz';
      default: return 'article';
    }
  }
  openEnrollmentModal(): void {
  this.showEnrollmentModal = true;
}

closeEnrollmentModal(): void {
  this.showEnrollmentModal = false;
}
}

  goToLesson(lessonId: number, type: string): void {
    if (!this.course) return;
    
    // We navigate to the student workspace player if it's a video
    if (type.toLowerCase() === 'video') {
      this.router.navigate(['/student/courses', this.course.id, 'lessons', lessonId, 'player']);
    } else if (type.toLowerCase() === 'quiz') {
      // Navigate to the quiz intro page
      // Assuming lesson title might contain quiz ID or there's an endpoint to get the quiz ID from lesson ID.
      // For now, if we have a generic player or we show a flash message:
      this.router.navigate(['/student/courses', this.course.id, 'lessons', lessonId, 'player']);
    }
  }
}
