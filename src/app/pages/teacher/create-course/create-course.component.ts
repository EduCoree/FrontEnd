
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../core/services/courses/course.service';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent {

  courseForm: FormGroup;
  isLoading = false;
  errorMessage = '';
// options for select inputs
  levels = ['Beginner', 'Intermediate', 'Advanced'];
  pricingTypes = ['Free', 'Paid', 'Subscription'];
  selectedFile: File | null = null;
coverPreview: string = '';
isUploadingCover = false;
coverUploadSuccess = false;
courseIdAfterCreate: number | null = null;

  constructor(private fb: FormBuilder, private courseService: CourseService, private router: Router) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      level: ['Beginner', Validators.required],
      pricingType: ['Free', Validators.required],
      price: [0]
    });
  }

onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
  if (this.selectedFile) {
    const reader = new FileReader();
    reader.onload = (e) => this.coverPreview = e.target?.result as string;
    reader.readAsDataURL(this.selectedFile);
  }
}

uploadCover(): void {
  if (!this.selectedFile || !this.courseIdAfterCreate) return;
  this.isUploadingCover = true;
  this.courseService.uploadCover(this.courseIdAfterCreate, this.selectedFile).subscribe({
    next: () => {
      this.isUploadingCover = false;
      this.coverUploadSuccess = true;
      setTimeout(() => this.coverUploadSuccess = false, 3000);
    },
    error: () => { this.isUploadingCover = false; }
  });
}
  onSubmit(): void {
    if (this.courseForm.invalid) return;

    this.isLoading = true;
    this.courseService.createCourse(this.courseForm.value).subscribe({
    next: (res) => {
  this.isLoading = false;
  this.courseIdAfterCreate = res.data.id;
  if (this.selectedFile) {
    this.uploadCover();
  }
  this.router.navigate(['/teacher/courses', res.data.id, 'sections']);
},
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An error occurred';
      }
    });
  }
getProgress(): number {
  let count = 0;
  if (this.courseForm.get('title')?.value) count++;
  if (this.courseForm.get('categoryId')?.value) count++;
  if (this.courseForm.get('description')?.value) count++;
  return Math.round((count / 3) * 100);
}
goToDashboard(): void {
  this.router.navigate(['/teacher/dashboard']);
}
  goBack(): void {
    this.router.navigate(['/teacher/courses']);
  }
}