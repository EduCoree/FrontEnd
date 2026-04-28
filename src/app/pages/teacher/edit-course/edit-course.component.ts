import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CourseSidebar } from '../../../shared/components/ui/sidebar/course-sidebar/course-sidebar';
import { CourseService } from '../../../core/services/course';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, TranslateModule, CourseSidebar, RouterOutlet],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css',
})
export class EditCourseComponent implements OnInit {

  courseId!: number;

  // ── Shell-level state (publish button + toast) ──────────────────────────
  courseStatus    = signal('');
  shellSuccessMsg = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseStatus();
  }

  /** Load only the status (for the publish/unpublish button). */
  loadCourseStatus(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        this.courseStatus.set(res.data?.status ?? '');
      }
    });
  }

  publishCourse(): void {
    this.courseService.publishCourse(this.courseId).subscribe({
      next: () => {
        this.courseStatus.set('Published');
        this.flash('Course published successfully!');
      }
    });
  }

  unpublishCourse(): void {
    this.courseService.unpublishCourse(this.courseId).subscribe({
      next: () => {
        this.courseStatus.set('Draft');
        this.flash('Course unpublished!');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses']);
  }

  private flash(msg: string): void {
    this.shellSuccessMsg.set(msg);
    setTimeout(() => this.shellSuccessMsg.set(''), 3000);
  }
}