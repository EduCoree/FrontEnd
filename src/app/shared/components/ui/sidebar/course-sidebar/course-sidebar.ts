import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-course-sidebar',
  imports: [CommonModule , TranslateModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebar {
 isOpen = false;
}
