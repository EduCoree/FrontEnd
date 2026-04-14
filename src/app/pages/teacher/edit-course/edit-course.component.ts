import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ReorderItemDto, SectionDto } from '../../../core/models/course';
import { CourseService } from '../../../core/services/course';
import { CourseSidebar } from "../../../shared/components/ui/sidebar/course-sidebar/course-sidebar";

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CourseSidebar],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.css'
})
export class EditCourseComponent implements OnInit {

  courseId!: number;
  courseForm: FormGroup;
  pricingForm: FormGroup;
  sectionForm: FormGroup;
  editForm: FormGroup;

  sections = signal<SectionDto[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  successMessage = signal('');
  selectedFile: File | null = null;
  coverPreview = signal('');
  courseStatus = signal('');
  editingSection: SectionDto | null = null;

  levels = ['Beginner', 'Intermediate', 'Advanced'];
  pricingTypes = ['Free', 'Paid', 'Subscription'];
  categories: Category[] = [];
  courseCategoryName = '';

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: [null, Validators.required],
      level: ['Beginner', Validators.required],
    });

    this.pricingForm = this.fb.group({
      pricingType: ['Free', Validators.required],
      price: [0]
    });

    this.sectionForm = this.fb.group({
      title: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadCourse();
    this.loadSections();
  }

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        const course = res.data;
        this.courseCategoryName = course.categoryName || '';
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          categoryId: course.categoryId ?? null,
          level: course.level
        });

        if (!this.courseForm.get('categoryId')?.value && this.courseCategoryName) {
          const matchedCategory = this.categories.find(c => c.name === this.courseCategoryName);
          if (matchedCategory) {
            this.courseForm.patchValue({ categoryId: matchedCategory.id });
          }
        }

        this.pricingForm.patchValue(course);
        this.coverPreview.set(course.coverImageUrl || course.coverImage || '');
        this.courseStatus.set(course.status);
        this.isLoading.set(false);
      }
    });
  }

  loadCategories(): void {
    const centerId = 11;
    this.categoryService.getAll(centerId).subscribe({
      next: (res: Category[]) => {
        this.categories = res;
        if (!this.courseForm.get('categoryId')?.value && this.courseCategoryName) {
          const matchedCategory = this.categories.find(c => c.name === this.courseCategoryName);
          if (matchedCategory) {
            this.courseForm.patchValue({ categoryId: matchedCategory.id });
          }
        }
      },
      error: () => {
        console.error('Failed to load categories');
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

  // فتح فورم التعديل
  startEdit(section: SectionDto): void {
    this.editingSection = section;
    this.editForm.patchValue({ title: section.title });
  }

  // حفظ التعديل
 saveEdit(): void {
  if (this.editForm.invalid || !this.editingSection) return;
  this.courseService.updateSection(
    this.courseId,
    this.editingSection.id,
    this.editForm.value
  ).subscribe({
    next: () => {
      this.editingSection = null;
      this.loadSections();
      this.successMessage.set('Section updated successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  });
}

  // إلغاء التعديل
  cancelEdit(): void {
    this.editingSection = null;
  }

  deleteSection(sectionId: number): void {
    if (!confirm('Are you sure?')) return;
    this.courseService.deleteSection(this.courseId, sectionId).subscribe({
      next: () => this.loadSections()
    });
  }

  // تحريك السيكشن لفوق
  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.sections()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.sections.set(items);
    this.saveOrder();
  }

  // تحريك السيكشن لتحت
  moveDown(index: number): void {
    if (index === this.sections().length - 1) return;
    const items = [...this.sections()];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.sections.set(items);
    this.saveOrder();
  }

  // حفظ الترتيب
 saveOrder(): void {
  const items: ReorderItemDto[] = this.sections().map((s, i) => ({
    id: s.id,
    sectionId: s.id,
    order: i + 1,
    sortOrder: i + 1
  }));
  this.courseService.reorderSections(this.courseId, items).subscribe({
    next: () => {
      this.successMessage.set('Sections reordered!');
      setTimeout(() => this.successMessage.set(''), 3000);
      this.loadSections();
    },
    error: (err) => {
      console.error('Failed to save section order', err);
    }
  });
}
publishCourse(): void {
  this.courseService.publishCourse(this.courseId).subscribe({
    next: () => {
      this.courseStatus.set('Published');
      this.successMessage.set('Course published successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  });
}

unpublishCourse(): void {
  this.courseService.unpublishCourse(this.courseId).subscribe({
    next: () => {
      this.courseStatus.set('Draft');
      this.successMessage.set('Course unpublished!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  });
}
  goBack(): void {
    this.router.navigate(['/teacher/courses']);
  }
}