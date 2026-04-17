import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseSummaryDto } from '../../../core/models/course';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule , TranslateModule],
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent {
  @Input() course!: CourseSummaryDto;
}