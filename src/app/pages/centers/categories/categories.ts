import { Component, inject, OnInit, signal, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Sidebar } from "../../../shared/components/ui/sidebar/sidebar";
import { TranslateModule } from '@ngx-translate/core'; 
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule, Sidebar, TranslateModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private langService = inject(LanguageService);

  centerId = signal<number>(0);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showPanel = signal(false);
  panelMode = signal<'create' | 'edit'>('create');
  selectedCategory = signal<Category | null>(null);
  saving = signal(false);
  panelError = signal<string | null>(null);

  showDeleteModal = signal(false);
  categoryToDelete = signal<Category | null>(null);
  deleting = signal(false);
  deleteError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  constructor() {
    
    effect(() => {
      this.langService.currentLang();
      if (this.centerId() > 0) 
        this.loadCategories();
    });
  }

  get slugPreview(): string {
    const name = this.form.get('name')?.value ?? '';
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '-');
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('centerId'));
    this.centerId.set(id);
    this.loadCategories(); 
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService.getAll(this.centerId()).subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories.');
        this.loading.set(false);
      }
    });
  }

  openCreatePanel() {
    this.panelMode.set('create');
    this.selectedCategory.set(null);
    this.form.reset();
    this.panelError.set(null);
    this.showPanel.set(true);
  }

  openEditPanel(category: Category) {
    this.panelMode.set('edit');
    this.selectedCategory.set(category);
    this.form.patchValue({ name: category.name });
    this.panelError.set(null);
    this.showPanel.set(true);
  }

  closePanel() {
    this.showPanel.set(false);
    this.form.reset();
  }

  saveCategory() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.panelError.set(null);

    if (this.panelMode() === 'create') {
      this.categoryService.create(this.centerId(), this.form.value).subscribe({
        next: (newCat) => {
          this.categories.update(cats => [...cats, newCat]);
          this.saving.set(false);
          this.closePanel();
        },
        error: () => {
          this.panelError.set('Failed to create category.');
          this.saving.set(false);
        }
      });
    } else {
      const id = this.selectedCategory()!.id;
      this.categoryService.update(this.centerId(), id, this.form.value).subscribe({
        next: (updated) => {
          this.categories.update(cats =>
            cats.map(c => c.id === id ? updated : c)
          );
          this.saving.set(false);
          this.closePanel();
        },
        error: () => {
          this.panelError.set('Failed to update category.');
          this.saving.set(false);
        }
      });
    }
  }

  openDeleteModal(category: Category) {
    this.categoryToDelete.set(category);
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.categoryToDelete.set(null);
  }

  confirmDelete() {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.deleting.set(true);
    this.categoryService.delete(this.centerId(), cat.id).subscribe({
      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== cat.id));
        this.deleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        if (err.status === 409)
          this.deleteError.set('Cannot delete: this category has existing courses.');
        else
          this.deleteError.set('Failed to delete category.');
        this.deleting.set(false);
      }
    });
  }
}