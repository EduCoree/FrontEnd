
import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CenterService } from '../../../core/services/center.service';
import { Sidebar } from "../../../shared/components/ui/sidebar/sidebar";


@Component({
  selector: 'app-center-delete',
  imports: [CommonModule, Sidebar],
  templateUrl: './center-delete.html',
  styleUrl: './center-delete.css',
})
export class CenterDelete implements OnInit{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private centerService = inject(CenterService);
  private platformId = inject(PLATFORM_ID);

  centerId = signal<number>(0);
  centerName = signal<string>('');
  loading = signal(true);
  deleting = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.centerId.set(id);

    this.centerService.getById(id).subscribe({
      next: (center) => {
        this.centerName.set(center.name);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load center data.');
        this.loading.set(false);
      }
    });
  }

  confirmDelete() {
    this.deleting.set(true);
    this.centerService.delete(this.centerId()).subscribe({
      next: () => {
        this.router.navigate(['/centers']);
      },
      error: () => {
        this.error.set('Failed to delete center. Please try again.');
        this.deleting.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/centers', this.centerId()]);
  }
}
