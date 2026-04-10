import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CourseDetailDto } from '../../../core/model/courses/course.model';
import { PublicCourseService } from '../../../core/services/public-course.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
})
export class CourseDetailComponent implements OnInit {

  course: CourseDetailDto | null = null;
  isLoading = false;
  openSectionId: number | null = null;

  constructor(
    private route: ActivatedRoute,
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
}