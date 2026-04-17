import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../../../layouts/admin-sidebar/admin-sidebar';
import { ForumService } from '../../../core/services/forum.service';
import { PostReportDto } from '../../../core/models/forum';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forum-admin-reports',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent , TranslateModule],
  templateUrl: './forum-admin-reports.html',
  styleUrl: './forum-admin-reports.css',
})
export class ForumAdminReportsComponent implements OnInit {
  private forumService = inject(ForumService);

  // ── State ─────────────────────────────────────────────────────────────────
  reports = signal<PostReportDto[]>([]);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // ── Modals ────────────────────────────────────────────────────────────────
  showDismissModal = signal(false);
  showDeleteModal = signal(false);
  actionReport = signal<PostReportDto | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadReports();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  loadReports() {
    this.loading.set(true);
    this.forumService.getReports().subscribe({
      next: (data) => {
        const result = Array.isArray(data) ? data : (data as any)?.data ?? [];
        this.reports.set(result);
        this.loading.set(false);
      },
      error: () => this.flashError('Failed to load reports.'),
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  openDismissModal(report: PostReportDto) {
    this.actionReport.set(report);
    this.showDismissModal.set(true);
  }

  confirmDismiss() {
    const report = this.actionReport();
    if (!report) return;
    this.forumService.dismissReport(report.id).subscribe({
      next: () => {
        this.reports.update(list => list.filter(r => r.id !== report.id));
        this.showDismissModal.set(false);
        this.actionReport.set(null);
        this.flash('Report dismissed.');
      },
      error: () => this.flashError('Failed to dismiss report.'),
    });
  }

  openDeleteModal(report: PostReportDto) {
    this.actionReport.set(report);
    this.showDeleteModal.set(true);
  }

  confirmDeletePost() {
    const report = this.actionReport();
    if (!report) return;
    this.forumService.adminDeletePost(report.postId).subscribe({
      next: () => {
        this.reports.update(list => list.filter(r => r.postId !== report.postId));
        this.showDeleteModal.set(false);
        this.actionReport.set(null);
        this.flash('Post deleted successfully.');
      },
      error: () => this.flashError('Failed to delete post.'),
    });
  }

  closeModals() {
    this.showDismissModal.set(false);
    this.showDeleteModal.set(false);
    this.actionReport.set(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getInitial(name: string): string {
    return (name ?? '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  private flash(msg: string) {
    this.loading.set(false);
    this.errorMsg.set('');
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  private flashError(msg: string) {
    this.loading.set(false);
    this.successMsg.set('');
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 3500);
  }
}
