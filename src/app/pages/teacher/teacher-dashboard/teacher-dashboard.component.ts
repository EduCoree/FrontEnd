
// import { Component, OnInit, signal } from '@angular/core';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { forkJoin, map } from 'rxjs';
// import { CourseService } from '../../../core/services/course';
// import { CourseSummaryDto } from '../../../core/models/course';
// import { LiveSessionService } from '../../../core/services/live-session';
// import { LiveSessionResponse } from '../../../core/models/session';
// import { TranslateModule } from '@ngx-translate/core';

// interface DashboardSession extends LiveSessionResponse {
//   courseTitle?: string;
// }
// @Component({
//   selector: 'app-teacher-dashboard',
//   standalone: true,
//   imports: [CommonModule , TranslateModule],
//   templateUrl: './teacher-dashboard.component.html',
//   styleUrl: './teacher-dashboard.component.css'
// })
// export class TeacherDashboardComponent implements OnInit {

//   // KPIs
//   totalCourses = signal(0);
//   publishedCourses = signal(0);
//   totalEnrolledStudents = signal(0);
//   averageCourseRating = signal(0);

//   // ا
//   courses = signal<CourseSummaryDto[]>([]);
//   upcomingSessions = signal<DashboardSession[]>([]);
//   isLoading = signal(true);
//   isLoadingSessions = signal(true);
//   showScheduleDropdown = signal(false);

  
//   teacherName = signal('');

//   constructor(
//     private courseService: CourseService, 
//     private liveSessionService: LiveSessionService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.teacherName.set(localStorage.getItem('name') || 'Teacher');
//     this.loadDashboard();
//   }

//   loadDashboard(): void {
//     this.courseService.getMyCourses(1, 10).subscribe({
//       next: (res: any) => {
//         const items: CourseSummaryDto[] = res.data.items;
//         this.courses.set(items);

//         //  KPIs 
//         this.totalCourses.set(res.data.totalCount);
//         this.publishedCourses.set(
//           items.filter(c => c.status === 'Published').length
//         );
//         this.totalEnrolledStudents.set(
//           items.reduce((sum, c) => sum + (c.totalStudents || 0), 0)
//         );
//         // rating comuted

//         const rated = items.filter(c => (c as any).rating > 0);
//         const avg = rated.length > 0
//           ? rated.reduce((sum, c) => sum + (c as any).rating, 0) / rated.length
//           : 0;
//         this.averageCourseRating.set(Math.round(avg * 10) / 10);

//         this.isLoading.set(false);
//         this.loadUpcomingSessions(items);
//       },
//       error: () => { 
//         this.isLoading.set(false); 
//         this.isLoadingSessions.set(false);
//       }
//     });
//   }

//   loadUpcomingSessions(courses: CourseSummaryDto[]): void {
//     if (courses.length === 0) {
//       this.isLoadingSessions.set(false);
//       return;
//     }
    
//     // Scan all active courses for upcoming sessions
//     const activeCourses = courses;
//     const requests = activeCourses.map(c => 
//       this.liveSessionService.getSessionsByCourse(c.id).pipe(
//         map(sessions => (sessions || []).map(s => ({ ...s, courseTitle: c.title })))
//       )
//     );

//     forkJoin(requests).subscribe({
//       next: (results) => {
//         const allSessions = results.flat();
//         const now = Date.now();
//         const upcoming = allSessions
//           .filter(s => new Date(s.scheduledAt).getTime() > now)
//           .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
//           .slice(0, 3);
        
//         this.upcomingSessions.set(upcoming);
//         this.isLoadingSessions.set(false);
//       },
//       error: () => this.isLoadingSessions.set(false)
//     });
//   }

//   goToCreate(): void {
//     this.router.navigate(['/teacher/courses/create']);
//   }

//   goToEdit(id: number): void {
//     this.router.navigate(['/teacher/courses/edit', id]);
//   }

//   goToProgress(courseId: number): void {
//     this.router.navigate(['/teacher/courses', courseId, 'progress']);
//   }

//   goToMyCourses(): void {
//     this.router.navigate(['/teacher/courses']);
//   }

//   toggleScheduleDropdown(): void {
//     this.showScheduleDropdown.update(v => !v);
//   }

//   goToCourseSessions(courseId: number): void {
//     this.router.navigate(['/teacher/courses', courseId, 'sessions']);
//   }
// }


import { Component, OnInit, signal, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { CourseService } from '../../../core/services/course';
import { CourseSummaryDto } from '../../../core/models/course';
import { LiveSessionService } from '../../../core/services/live-session';
import { LiveSessionResponse } from '../../../core/models/session';
import { TranslateModule } from '@ngx-translate/core';

interface DashboardSession extends LiveSessionResponse {
  courseTitle?: string;
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {

  totalCourses = signal(0);
  publishedCourses = signal(0);
  totalEnrolledStudents = signal(0);
  averageCourseRating = signal(0);

  courses = signal<CourseSummaryDto[]>([]);
  upcomingSessions = signal<DashboardSession[]>([]);
  isLoading = signal(true);
  isLoadingSessions = signal(true);
  showScheduleDropdown = signal(false);
  teacherName = signal('');

  private chartsInitialized = false;

  constructor(
    private courseService: CourseService,
    private liveSessionService: LiveSessionService,
    private router: Router
  ) {
    // لما isLoading يبقى false تلقائياً يعمل الـ charts
    effect(() => {
      if (!this.isLoading()) {
        setTimeout(() => this.initCharts(), 200);
      }
    });
  }

  ngOnInit(): void {
    this.teacherName.set(localStorage.getItem('name') || 'Teacher');
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.courseService.getMyCourses(1, 10).subscribe({
      next: (res: any) => {
        const items: CourseSummaryDto[] = res.data.items;
        this.courses.set(items);
        this.totalCourses.set(res.data.totalCount);
        this.publishedCourses.set(items.filter(c => c.status === 'Published').length);
        this.totalEnrolledStudents.set(
          items.reduce((sum, c) => sum + (c.totalStudents || 0), 0)
        );
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
    const requests = courses.map(c =>
      this.liveSessionService.getSessionsByCourse(c.id).pipe(
        map(sessions => (sessions || []).map(s => ({ ...s, courseTitle: c.title })))
      )
    );
    forkJoin(requests).subscribe({
      next: (results) => {
        const now = Date.now();
        const upcoming = results.flat()
          .filter(s => new Date(s.scheduledAt).getTime() > now)
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 3);
        this.upcomingSessions.set(upcoming);
        this.isLoadingSessions.set(false);
      },
      error: () => this.isLoadingSessions.set(false)
    });
  }

  initCharts(): void {
    if (this.chartsInitialized) return;
    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;

    // ── Line Chart: Monthly Enrollments ──
    const enrollCtx = document.getElementById('enrollmentChart') as HTMLCanvasElement;
    if (enrollCtx) {
      new ChartJS(enrollCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Enrollments',
            data: [12, 28, 18, 45, 32, 58, 42, 70],
            borderColor: '#2e6858',
            backgroundColor: 'rgba(46,104,88,0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#2e6858',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#191c1d',
              bodyColor: '#707975',
              borderColor: 'rgba(0,0,0,0.08)',
              borderWidth: 1,
              padding: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          },
          scales: {
            x: {
              grid: { display: false },
              border: { display: false },
              ticks: { font: { size: 11, family: 'Manrope' }, color: '#707975' }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
              border: { display: false, dash: [4, 4] },
              ticks: { font: { size: 11, family: 'Manrope' }, color: '#707975' }
            }
          }
        }
      });
    }

    // ── Donut Chart: Course Status ──
    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (statusCtx) {
      const published = this.publishedCourses();
      const draft = this.totalCourses() - published;
      new ChartJS(statusCtx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [published || 1, draft || 0],
            backgroundColor: ['#2e6858', '#f0a500'],
            borderWidth: 0,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#191c1d',
              bodyColor: '#707975',
              borderColor: 'rgba(0,0,0,0.08)',
              borderWidth: 1,
            }
          }
        }
      });
    }

    this.chartsInitialized = true;
  }

  goToCreate(): void { this.router.navigate(['/teacher/courses/create']); }
  goToEdit(id: number): void { this.router.navigate(['/teacher/courses/edit', id]); }
  goToProgress(courseId: number): void { this.router.navigate(['/teacher/courses', courseId, 'progress']); }
  goToMyCourses(): void { this.router.navigate(['/teacher/courses']); }
  toggleScheduleDropdown(): void { this.showScheduleDropdown.update(v => !v); }
  goToCourseSessions(courseId: number): void { this.router.navigate(['/teacher/courses', courseId, 'sessions']); }
}