// ── Admin ─────────────────────────────────────────────

export interface AdminDashboard {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  newEnrollmentsToday: number;
  certificatesIssued: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TopCourse {
  courseId: number;
  title: string;
  coverImage: string | null;
  teacherName: string;
  enrollmentCount: number;
}

// ── Teacher ───────────────────────────────────────────

export interface TeacherDashboard {
  totalCourses: number;
  publishedCourses: number;
  totalEnrolledStudents: number;
  averageCourseRating: number;
  upcomingSessions: UpcomingSession[];
  recentEnrollments: RecentEnrollment[];
}

export interface UpcomingSession {
  sessionId: number;
  lessonTitle: string;
  courseTitle: string;
  scheduledAt: string;
  meetingUrl: string;
}

export interface RecentEnrollment {
  enrollmentId: number;
  studentName: string;
  studentAvatarUrl: string | null;
  courseTitle: string;
  enrolledAt: string;
}

// ── Student ───────────────────────────────────────────

export interface StudentDashboard {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  overallProgressPercent: number;
  upcomingSessions: UpcomingSession[];
  recentQuizResults: RecentQuizResult[];
}

export interface RecentQuizResult {
  attemptId: number;
  quizTitle: string;
  courseTitle: string;
  score: number | null;
  passed: boolean;
  submittedAt: string | null;
}