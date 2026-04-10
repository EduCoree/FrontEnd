
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReorderItemDto, SectionDto } from '../../../core/model/courses/course.model';
import { CourseService } from '../../../core/services/courses/course.service';

@Component({
  selector: 'app-course-sections',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-sections.component.html',
  styleUrl: './course-sections.component.css'
})
export class CourseSectionsComponent implements OnInit {

  courseId!: number;
  sections = signal<SectionDto[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  
  sectionForm: FormGroup;


  editingSection: SectionDto | null = null;
  editForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private fb: FormBuilder
  ) {
    this.sectionForm = this.fb.group({
      title: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSections();
  }

  // GET 
  loadSections(): void {
    this.isLoading.set(true);
    this.courseService.getSections(this.courseId).subscribe({
      next: (res: any) => {
        this.sections.set(res.data);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  // POST - 
  addSection(): void {
    if (this.sectionForm.invalid) return;
    this.isSaving.set(true);
    this.courseService.addSection(this.courseId, this.sectionForm.value).subscribe({
      next: () => {
        this.sectionForm.reset();
        this.isSaving.set(false);
        this.loadSections();
      },
      error: () => { this.isSaving.set(false); }
    });
  }

  // PUT - 
  startEdit(section: SectionDto): void {
    this.editingSection = section;
    this.editForm.patchValue({ title: section.title });
  }

  // PUT - 
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
      }
    });
  }

  // cancel
  cancelEdit(): void {
    this.editingSection = null;
  }

  // DELETE - 
  deleteSection(sectionId: number): void {
    if (!confirm('Are you sure you want to delete this section?')) return;
    this.courseService.deleteSection(this.courseId, sectionId).subscribe({
      next: () => this.loadSections()
    });
  }

  // PUT - reorder 
  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.sections()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.sections.set(items);
    this.saveOrder();
  }

  moveDown(index: number): void {
    if (index === this.sections().length - 1) return;
    const items = [...this.sections()];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.sections.set(items);
    this.saveOrder();
  }

  saveOrder(): void {
    const items: ReorderItemDto[] = this.sections().map((s, i) => ({
      id: s.id,
      sectionId: s.id,
      order: i + 1,
      sortOrder: i + 1
    }));
    this.courseService.reorderSections(this.courseId, items).subscribe({
      next: () => {
        this.loadSections();
      },
      error: (err) => {
        console.error('Failed to save section order', err);
      }
    });
  }
getTotalLessons(): number {
  return this.sections().reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
}
  // Navigation
  goBack(): void {
    this.router.navigate(['/teacher/courses/create']);
  }

  goNext(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'media']);
  }

  goToDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}