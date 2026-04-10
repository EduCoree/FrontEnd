// src/app/pages/student/student-progress/student-progress.component.ts
// Branch: feature/student-progress-certificates-ui

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProgressService } from '../../../core/services/progress';
import { CourseProgress, ResumeLesson } from '../../../core/models/progress';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.component.html',
})
export class StudentProgressComponent implements OnInit {

  // ─── State Signals ────────────────────────────────────────────────────────
  progressList = signal<CourseProgress[]>([]);
  isLoading    = signal(true);
  errorMsg     = signal('');

  constructor(
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // FIXME: Replace with actual API call to fetch enrolled course IDs when available
    const enrolledCourseIds$ = of([1]); // Hardcoded mock for now

    enrolledCourseIds$.subscribe({
      next: (courseIds) => {
        if (courseIds.length === 0) {
          this.progressList.set([]);
          this.isLoading.set(false);
          return;
        }

        const progressRequests = courseIds.map(id =>
          this.progressService.getCourseProgress(id).pipe(
            catchError(() => of(null)) // Ignore failed fetches for individual courses
          )
        );

        forkJoin(progressRequests).subscribe({
          next: (results) => {
            const validResults = results.filter((r): r is CourseProgress => r !== null);
            this.progressList.set(validResults);
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMsg.set('Failed to load your course progress.');
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.errorMsg.set('Failed to fetch enrolled courses.');
        this.isLoading.set(false);
      }
    });
  }

  resumeCourse(courseId: number): void {
    this.progressService.getResumeLesson(courseId).subscribe({
      next: (resumeLesson: ResumeLesson) => {
        if (resumeLesson) {
          this.router.navigate([
            '/student/courses', courseId, 'lessons', resumeLesson.lessonId, 'player'
          ]);
        }
      },
      error: () => {
        alert('Failed to find resume point. Please open the course curriculum.');
      }
    });
  }
}
