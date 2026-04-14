import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CenterService } from '../../../../core/services/center.service';
import { Center } from '../../../../core/models/center.model';
import { Sidebar } from "../../../../shared/components/ui/sidebar/sidebar";
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service'; 

@Component({
  selector: 'app-center-detail',
  imports: [CommonModule, RouterLink, Sidebar, TranslateModule],
  templateUrl: './center-detail.html',
  styleUrl: './center-detail.css',
})
export class CenterDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private centerService = inject(CenterService);
  private langService = inject(LanguageService); 

  center = signal<Center | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  deleting = signal(false);

  private centerId = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
   
    effect(() => {
      this.langService.currentLang(); 
      this.loadCenter();
    });
  }

  ngOnInit() {
    
  }

  loadCenter() {
    this.loading.set(true);
    this.centerService.getById(this.centerId).subscribe({
      next: (data) => {
        this.center.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load center details.');
        this.loading.set(false);
      }
    });
  }

  confirmDelete() {
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
  }

  deleteCenter() {
    const id = this.center()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.centerService.delete(id).subscribe({
      next: () => this.router.navigate(['/centers']),
      error: () => {
        this.error.set('Failed to delete center.');
        this.deleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }

  getSocialLinksArray() {
    const links = this.center()?.socialLinks;
    if (!links) return [];
    return Object.entries(links)
      .filter(([_, v]) => v)
      .map(([key, value]) => ({ key, value }));
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
