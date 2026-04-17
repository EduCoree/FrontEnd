import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-course-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebar {
  isOpen = signal(true);
  courseId: string | null = null;

  constructor(private route: ActivatedRoute) {
    // Check both potential param names from your routes.ts
    this.courseId = this.route.snapshot.params['id'] || 
                    this.route.snapshot.params['courseId'];
  }

  // Use a 'get' property so the routes are calculated 
  // every time they are accessed, ensuring the ID is ready.
  get navItems() {
    return [
      { 
        labelKey: 'Course Information', 
        icon: 'business', 
        route: `/teacher/courses/edit/${this.courseId}`, 
        exact: true  
      },
      { 
        labelKey: 'Curriculum builder', 
        icon: 'person_edit', 
        route: `/teacher/courses/${this.courseId}/sections`, 
        exact: false 
      },
      { 
        labelKey: 'Quizzes', 
        icon: 'upload', 
        route: `/teacher/courses/${this.courseId}/quizzes`, 
        exact: false 
      },
      { 
        labelKey: 'Sessions', 
        icon: 'calendar_month', 
        route: `/teacher/courses/${this.courseId}/sessions`, 
        exact: false 
      },
      { 
        labelKey: 'Progress', 
        icon: 'trending_up', 
        route: `/teacher/courses/${this.courseId}/progress`, 
        exact: false 
      },
    ];
  }
  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}
