import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SectionDto } from '../../../core/models/course';
import { CourseService } from '../../../core/services/course';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit {

  courseId!: number;
  courseForm: FormGroup;
  pricingForm: FormGroup;
  sectionForm: FormGroup;

  sections = signal<SectionDto[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  successMessage = signal('');
  selectedFile: File | null = null;
  coverPreview = signal('');

  levels = ['Beginner', 'Intermediate', 'Advanced'];
  pricingTypes = ['Free', 'Paid', 'Subscription'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      level: ['Beginner', Validators.required],
    });

    this.pricingForm = this.fb.group({
      pricingType: ['Free', Validators.required],
      price: [0]
    });

    this.sectionForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse();
    this.loadSections();
  }

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        const course = res.data;
        this.courseForm.patchValue(course);
        this.pricingForm.patchValue(course);
        this.coverPreview.set(course.coverImage || '');
        this.isLoading.set(false);
      }
    });
  }

  loadSections(): void {
    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => { this.sections.set(res.data); }
    });
  }

  saveChanges(): void {
    if (this.courseForm.invalid) return;
    this.isSaving.set(true);
    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Saved successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isSaving.set(false); }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => this.coverPreview.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadCover(): void {
    if (!this.selectedFile) return;
    this.courseService.uploadCover(this.courseId, this.selectedFile).subscribe({
      next: () => {
        this.successMessage.set('Image uploaded successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  savePricing(): void {
    this.courseService.updatePricing(this.courseId, this.pricingForm.value).subscribe({
      next: () => {
        this.successMessage.set('Pricing updated!');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  addSection(): void {
    if (this.sectionForm.invalid) return;
    this.courseService.addSection(this.courseId, this.sectionForm.value).subscribe({
      next: () => {
        this.sectionForm.reset();
        this.loadSections();
      }
    });
  }

  deleteSection(sectionId: number): void {
    if (!confirm('Are you sure?')) return;
    this.courseService.deleteSection(this.courseId, sectionId).subscribe({
      next: () => this.loadSections()
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses']);
  }
}