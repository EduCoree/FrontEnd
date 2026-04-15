
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { CourseService } from '../../../core/services/course';
import { CourseSummaryDto } from '../../../core/models/course';
import { LiveSessionService } from '../../../core/services/live-session';
import { LiveSessionResponse } from '../../../core/models/session';

interface DashboardSession extends LiveSessionResponse {
  courseTitle?: string;
}
@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {

  // KPIs
  totalCourses = signal(0);
  publishedCourses = signal(0);
  totalEnrolledStudents = signal(0);
  averageCourseRating = signal(0);

  // ا
  courses = signal<CourseSummaryDto[]>([]);
  upcomingSessions = signal<DashboardSession[]>([]);
  isLoading = signal(true);
  isLoadingSessions = signal(true);
  showScheduleDropdown = signal(false);

  
  teacherName = signal('');

  constructor(
    private courseService: CourseService, 
    private liveSessionService: LiveSessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teacherName.set(localStorage.getItem('name') || 'Teacher');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.courseService.getMyCourses(1, 10).subscribe({
      next: (res: any) => {
        const items: CourseSummaryDto[] = res.data.items;
        this.courses.set(items);

        //  KPIs 
        this.totalCourses.set(res.data.totalCount);
        this.publishedCourses.set(
          items.filter(c => c.status === 'Published').length
        );
        this.totalEnrolledStudents.set(
          items.reduce((sum, c) => sum + (c.totalStudents || 0), 0)
        );
        // rating comuted

        const rated = items.filter(c => (c as any).rating > 0);
        const avg = rated.length > 0
          ? rated.reduce((sum, c) => sum + (c as any).rating, 0) / rated.length
          : 0;
        this.averageCourseRating.set(Math.round(avg * 10) / 10);

        this.isLoading.set(false);
        this.loadUpcomingSessions(items);
      },
      error: () => { 
        this.isLoading.set(false); 
        this.isLoadingSessions.set(false);
      }
    });
  }

  loadUpcomingSessions(courses: CourseSummaryDto[]): void {
    if (courses.length === 0) {
      this.isLoadingSessions.set(false);
      return;
    }
    
    // Scan all active courses for upcoming sessions
    const activeCourses = courses;
    const requests = activeCourses.map(c => 
      this.liveSessionService.getSessionsByCourse(c.id).pipe(
        map(sessions => (sessions || []).map(s => ({ ...s, courseTitle: c.title })))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const allSessions = results.flat();
        const now = Date.now();
        const upcoming = allSessions
          .filter(s => new Date(s.scheduledAt).getTime() > now)
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 3);
        
        this.upcomingSessions.set(upcoming);
        this.isLoadingSessions.set(false);
      },
      error: () => this.isLoadingSessions.set(false)
    });
  }

  goToCreate(): void {
    this.router.navigate(['/teacher/courses/create']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/teacher/courses/edit', id]);
  }

  goToMyCourses(): void {
    this.router.navigate(['/teacher/courses']);
  }

  toggleScheduleDropdown(): void {
    this.showScheduleDropdown.update(v => !v);
  }

  goToCourseSessions(courseId: number): void {
    this.router.navigate(['/teacher/courses', courseId, 'sessions']);
  }
}