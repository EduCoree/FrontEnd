import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressService } from '../../../core/services/progress';
import { StudentProgressSummary, StudentLessonDetail } from '../../../core/models/progress';

@Component({
  selector: 'app-teacher-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-progress.component.html'
})
export class TeacherProgressComponent implements OnInit {

  courseId = signal<number>(0);
  students = signal<StudentProgressSummary[]>([]);
  selectedStudent = signal<StudentProgressSummary | null>(null);
  lessonDetails = signal<StudentLessonDetail[]>([]);
  isLoading = signal(true);
  isLoadingDetail = signal(false);
  errorMsg = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('courseId'));
    this.courseId.set(id);
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.progressService.getStudentProgressList(this.courseId()).subscribe({
      next: (result) => {
        this.students.set(result);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load student progress.');
        this.isLoading.set(false);
      }
    });
  }

  selectStudent(student: StudentProgressSummary): void {
    this.selectedStudent.set(student);
    this.isLoadingDetail.set(true);
    this.lessonDetails.set([]);
    
    this.progressService.getStudentLessonDetail(this.courseId(), student.studentId).subscribe({
      next: (result) => {
        this.lessonDetails.set(result);
        this.isLoadingDetail.set(false);
      },
      error: () => {
        this.isLoadingDetail.set(false);
      }
    });
  }

  clearSelection(): void {
    this.selectedStudent.set(null);
    this.lessonDetails.set([]);
  }

  getMinSec(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + 'm ' + s + 's';
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId(), 'sections']);
  }

  goToMedia(): void {
    this.router.navigate(['/teacher/courses', this.courseId(), 'media']);
  }

  goToSessions(): void {
    this.router.navigate(['/teacher/courses', this.courseId(), 'sessions']);
  }

  goToDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }

}
