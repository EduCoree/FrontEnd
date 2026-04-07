import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-course-sidebar',
  imports: [CommonModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebar {
 isOpen = false;
}
