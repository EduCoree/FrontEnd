import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForumService } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth';
import { ForumPostDetailDto, ForumReplyDto } from '../../../core/models/forum';

import { Sidebar } from '../../../shared/components/ui/sidebar/sidebar';

@Component({
  selector: 'app-forum-post-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar , TranslateModule],
  templateUrl: './forum-post-detail.html',
  styleUrl: './forum-post-detail.css',
})
export class ForumPostDetailComponent implements OnInit {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // ── State ─────────────────────────────────────────────────────────────────
  lessonId = 0;
  postId = 0;
  post = signal<ForumPostDetailDto | null>(null);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // ── Modals ────────────────────────────────────────────────────────────────
  showEditPostModal = signal(false);
  showReportModal = signal(false);
  showDeletePostModal = signal(false);
  showDeleteReplyModal = signal(false);
  deletingReplyId = signal<number | null>(null);

  // ── Reply editing ─────────────────────────────────────────────────────────
  editingReplyId = signal<number | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────────
  replyForm: FormGroup = this.fb.group({
    body: ['', [Validators.required]],
  });

  editReplyForm: FormGroup = this.fb.group({
    body: ['', [Validators.required]],
  });

  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    body: ['', [Validators.required]],
  });

  reportForm: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(200)]],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  currentUserId = computed(() => {
    const token = this.auth.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? payload['sub'] ?? '';
    } catch { return ''; }
  });

  isLoggedIn = computed(() => this.auth.isLoggedIn());

  visibleReplies = computed(() => {
    const p = this.post();
    if (!p || !p.replies) return [];
    return p.replies.filter(r => !r.isRemoved);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.postId = Number(this.route.snapshot.paramMap.get('postId'));
    this.loadPost();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  loadPost() {
    this.loading.set(true);
    this.forumService.getPostDetails(this.lessonId, this.postId).subscribe({
      next: (data) => {
        const result = (data as any)?.data ?? data;
        // Ensure replies is always an array
        if (result && !result.replies) result.replies = [];
        this.post.set(result);
        this.loading.set(false);
      },
      error: () => this.flashError('Failed to load post.'),
    });
  }

  // ── Edit Post ─────────────────────────────────────────────────────────────
  openEditPost() {
    const p = this.post();
    if (!p) return;
    this.postForm.patchValue({ title: p.title, body: p.body });
    this.showEditPostModal.set(true);
  }

  savePost() {
    if (this.postForm.invalid) return;
    this.loading.set(true);
    this.forumService.updatePost(this.lessonId, this.postId, this.postForm.value).subscribe({
      next: () => {
        this.showEditPostModal.set(false);
        this.flash('Post updated successfully.');
        this.loadPost();
      },
      error: () => this.flashError('Failed to update post.'),
    });
  }

  // ── Delete Post ───────────────────────────────────────────────────────────
  openDeletePostModal() {
    this.showDeletePostModal.set(true);
  }

  confirmDeletePost() {
    this.forumService.deletePost(this.lessonId, this.postId).subscribe({
      next: () => {
        this.showDeletePostModal.set(false);
        this.router.navigate(['/lessons', this.lessonId, 'forum']);
      },
      error: () => this.flashError('Failed to delete post.'),
    });
  }

  // ── Upvote ────────────────────────────────────────────────────────────────
  upvotePost() {
    const p = this.post();
    if (!p || p.hasUpvoted) return;

    this.post.set({ ...p, upvoteCount: p.upvoteCount + 1, hasUpvoted: true });

    this.forumService.upvotePost(this.lessonId, this.postId).subscribe({
      error: (err) => {
        this.post.set({ ...p, upvoteCount: p.upvoteCount, hasUpvoted: false });
        if (err.status === 400) {
          this.flashError('You have already upvoted this post.');
        } else {
          this.flashError('Failed to upvote.');
        }
      },
    });
  }

  // ── Report ────────────────────────────────────────────────────────────────
  openReport() {
    this.reportForm.reset();
    this.showReportModal.set(true);
  }

  submitReport() {
    if (this.reportForm.invalid) return;
    this.forumService.reportPost(this.lessonId, this.postId, this.reportForm.value).subscribe({
      next: () => {
        this.showReportModal.set(false);
        this.flash('Report submitted. Thank you.');
      },
      error: () => this.flashError('Failed to submit report.'),
    });
  }

  // ── Replies ───────────────────────────────────────────────────────────────
  addReply() {
    if (this.replyForm.invalid) return;
    this.forumService.addReply(this.lessonId, this.postId, this.replyForm.value).subscribe({
      next: () => {
        this.replyForm.reset();
        this.flash('Reply added.');
        this.loadPost();
      },
      error: () => this.flashError('Failed to add reply.'),
    });
  }

  startEditReply(reply: ForumReplyDto) {
    this.editingReplyId.set(reply.id);
    this.editReplyForm.patchValue({ body: reply.body });
  }

  cancelEditReply() {
    this.editingReplyId.set(null);
    this.editReplyForm.reset();
  }

  saveReply(replyId: number) {
    if (this.editReplyForm.invalid) return;
    this.forumService.updateReply(this.lessonId, this.postId, replyId, this.editReplyForm.value).subscribe({
      next: () => {
        this.editingReplyId.set(null);
        this.flash('Reply updated.');
        this.loadPost();
      },
      error: () => this.flashError('Failed to update reply.'),
    });
  }

  openDeleteReplyModal(replyId: number) {
    this.deletingReplyId.set(replyId);
    this.showDeleteReplyModal.set(true);
  }

  confirmDeleteReply() {
    const replyId = this.deletingReplyId();
    if (!replyId) return;
    this.forumService.deleteReply(this.lessonId, this.postId, replyId).subscribe({
      next: () => {
        const p = this.post();
        if (p) {
          this.post.set({
            ...p,
            replies: p.replies.map(r => r.id === replyId ? { ...r, isRemoved: true } : r),
          });
        }
        this.showDeleteReplyModal.set(false);
        this.deletingReplyId.set(null);
        this.flash('Reply deleted.');
      },
      error: () => this.flashError('Failed to delete reply.'),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isPostOwner(): boolean {
    return this.post()?.studentId === this.currentUserId();
  }

  isReplyOwner(reply: ForumReplyDto): boolean {
    return reply.userId === this.currentUserId();
  }

  getInitial(name: string): string {
    return (name ?? '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  goBack() {
    this.router.navigate(['/lessons', this.lessonId, 'forum']);
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
