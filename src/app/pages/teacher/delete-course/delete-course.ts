import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-course',
  imports: [TranslateModule],
  templateUrl: './delete-course.html',
  styleUrl: './delete-course.css',
})
export class DeleteCourse {
  @Input() courseId!: number;
  @Input() courseName!: string;
  @Output() deleted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  deleting = signal(false);
  error = signal<string | null>(null);

  constructor(private courseService: CourseService) {}

  confirmDelete() {
    this.deleting.set(true);
    this.courseService.deleteCourse(this.courseId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleted.emit();         
      },
      error: () => {
        this.error.set('Failed to delete course. Please try again.');
        this.deleting.set(false);
      }
    });
  }

  cancel() {
    this.cancelled.emit();           
  }
}

