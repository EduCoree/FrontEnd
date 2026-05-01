import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-course-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebar {
  private translate = inject(TranslateService);
  isOpen = signal(true);
  courseId: string | null = null;

  get toggleIcon(): string {
    const open = this.isOpen();
    const isRtl = this.translate.currentLang === 'ar';
    if (open) {
      return isRtl ? 'chevron_right' : 'chevron_left';
    }
    return isRtl ? 'chevron_left' : 'chevron_right';
  }

  constructor(private route: ActivatedRoute) {
    // Read the edit route ID from whichever active route level provides it.
    this.courseId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('courseId') ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('courseId') ||
      null;
  }

  // Use a 'get' property so the routes are calculated 
  // every time they are accessed, ensuring the ID is ready.
  get navItems() {
    return [
      {
        labelKey: 'courseBuilder.courseInfo',
        icon: 'business',
        route: `/teacher/courses/edit/${this.courseId}/info`,
        exact: true
      },
      {
        labelKey: 'teacherProgress.quizzes',
        icon: 'upload',
        route: `/teacher/courses/edit/${this.courseId}/quizzes`,
        exact: false
      },
      {
        labelKey: 'teacherSessions.sessions',
        icon: 'calendar_month',
        route: `/teacher/courses/edit/${this.courseId}/sessions`,
        exact: false
      },
      {
        labelKey: 'teacherProgress.progress',
        icon: 'trending_up',
        route: `/teacher/courses/edit/${this.courseId}/progress`,
        exact: false
      },
    ];
  }
  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}
