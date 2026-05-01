import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './teacher-layout.component.html',
})
export class TeacherLayoutComponent {
  constructor(private router: Router, public langService: LanguageService) {}

  get isEditCourseRoute(): boolean {
    return this.router.url.startsWith('/teacher/courses/edit/');
  }

  get isRtl(): boolean {
    return this.langService.currentLang() === 'ar';
  }
}
