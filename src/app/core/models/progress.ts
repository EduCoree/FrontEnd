// src/app/core/models/progress.ts
// ─── Progress Tracking & Certificates — Model Interfaces ──────────────────────
// Branch: feature/progress-models-services

// ─── Student Progress ─────────────────────────────────────────────────────────

/** Per-lesson progress record for a student. */
export interface LessonProgress {
  lessonId: number;
  isCompleted: boolean;
  lastPositionSecs: number;
  completedAt?: Date;
}

/** Resume pointer — the lesson a student should continue from. */
export interface ResumeLesson {
  lessonId: number;
  title: string;
  lastPositionSecs: number;
}

/** Aggregate progress for a student across a single course. */
export interface CourseProgress {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  lastAccessedLesson?: ResumeLesson;
}

// ─── Teacher Progress Views ───────────────────────────────────────────────────

/** Summary row shown in the teacher's student progress table. */
export interface StudentProgressSummary {
  studentId: string;
  studentName: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
}

/** Detailed per-lesson record shown in the teacher's drill-down panel. */
export interface StudentLessonDetail {
  lessonId: number;
  title: string;
  isCompleted: boolean;
  lastPositionSecs: number;
  completedAt?: Date;
}

// ─── Certificates ─────────────────────────────────────────────────────────────

/** A certificate record for a student who completed a course. */
export interface Certificate {
  id: number;
  courseId: number;
  courseTitle: string;
  studentName: string;
  issuedAt: Date;
  certificateUrl: string;
  certificateUuid: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/** Payload sent on every 30-second heartbeat while a student watches a video. */
export interface WatchHeartbeatRequest {
  lastPositionSecs: number;
}
