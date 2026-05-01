import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-course-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebar {
  isOpen = signal(true);
  courseId: string | null = null;

  private translate = inject(TranslateService);

  constructor(private route: ActivatedRoute) {
    this.courseId =
      this.route.snapshot.params['id'] ||
      this.route.snapshot.params['courseId'];
  }

  isRtl(): boolean {
    return this.translate.currentLang === 'ar';
  }

  getToggleIcon(): string {
    const open = this.isOpen();
    const rtl  = this.isRtl();
    if (open)  return rtl ? 'chevron_right' : 'chevron_left';
    return rtl ? 'chevron_left'  : 'chevron_right';
  }

  get navItems() {
    return [
      {
        labelKey: 'sidebar.nav.courseInfo',
        icon: 'business',
        route: `/teacher/courses/edit/${this.courseId}`,
        exact: true,
      },
      {
        labelKey: 'sidebar.nav.quizzes',
        icon: 'upload',
        route: `/teacher/courses/${this.courseId}/quizzes`,
        exact: false,
      },
      {
        labelKey: 'sidebar.nav.sessions',
        icon: 'calendar_month',
        route: `/teacher/courses/edit/${this.courseId}/sessions`,
        exact: false,
      },
      {
        labelKey: 'sidebar.nav.progress',
        icon: 'trending_up',
        route: `/teacher/courses/edit/${this.courseId}/progress`,
        exact: false,
      },
    ];
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}
