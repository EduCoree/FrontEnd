// src/app/core/services/progress.ts
// ─── ProgressService ──────────────────────────────────────────────────────────
// Branch: feature/progress-models-services

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CourseProgress,
  ResumeLesson,
  StudentProgressSummary,
  StudentLessonDetail,
  WatchHeartbeatRequest,
} from '../models/progress';

@Injectable({ providedIn: 'root' })
export class ProgressService {

  private base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // ─── Student: Watch Heartbeat ─────────────────────────────────────────────

  /**
   * POST /api/progress/lessons/{lessonId}/watch
   * Called every 30 seconds while the student is watching a video.
   * Saves the student's current playback position for resume support.
   */
  recordWatchProgress(
    lessonId: number,
    payload: WatchHeartbeatRequest
  ): Observable<void> {
    return this.http.post<void>(
      `${this.base}/progress/lessons/${lessonId}/watch`,
      payload
    );
  }

  // ─── Student: Mark Complete ───────────────────────────────────────────────

  /**
   * PUT /api/progress/lessons/{lessonId}/complete
   * Marks a lesson as fully completed for the authenticated student.
   */
  markLessonComplete(lessonId: number): Observable<void> {
    return this.http.put<void>(
      `${this.base}/progress/lessons/${lessonId}/complete`,
      {}
    );
  }

  // ─── Student: Course Progress ─────────────────────────────────────────────

  /**
   * GET /api/progress/courses/{courseId}
   * Returns overall progress metrics for the student in a given course.
   */
  getCourseProgress(courseId: number): Observable<CourseProgress> {
    return this.http
      .get<any>(`${this.base}/progress/courses/${courseId}`)
      .pipe(map((res) => res.data ?? res));
  }

  /**
   * GET /api/progress/courses/{courseId}/resume
   * Returns the lesson the student should resume next (last accessed, incomplete).
   */
  getResumeLesson(courseId: number): Observable<ResumeLesson> {
    return this.http
      .get<any>(`${this.base}/progress/courses/${courseId}/resume`)
      .pipe(map((res) => res.data ?? res));
  }

  // ─── Teacher: Student Progress List ──────────────────────────────────────

  /**
   * GET /api/teacher/progress/courses/{courseId}/students
   * Returns an aggregate summary row for every enrolled student.
   * Consumed by TeacherProgressComponent to render the summary table.
   */
  getStudentProgressList(courseId: number): Observable<StudentProgressSummary[]> {
    return this.http
      .get<any>(`${this.base}/teacher/progress/courses/${courseId}/students`)
      .pipe(map((res) => res.data ?? res));
  }

  // ─── Teacher: Student Lesson Drill-Down ───────────────────────────────────

  /**
   * GET /api/teacher/progress/courses/{courseId}/students/{studentId}
   * Returns a per-lesson breakdown for one specific student.
   * Consumed by TeacherProgressComponent's detail panel.
   */
  getStudentLessonDetail(
    courseId: number,
    studentId: string
  ): Observable<StudentLessonDetail[]> {
    return this.http
      .get<any>(
        `${this.base}/teacher/progress/courses/${courseId}/students/${studentId}`
      )
      .pipe(map((res) => res.data ?? res));
  }
}
