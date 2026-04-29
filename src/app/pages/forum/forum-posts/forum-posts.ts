import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForumService } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth';
import { ForumPostDto } from '../../../core/models/forum';
import { Sidebar } from '../../../shared/components/ui/sidebar/sidebar';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forum-posts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Sidebar , TranslateModule],
  templateUrl: './forum-posts.html',
  styleUrl: './forum-posts.css',
})
export class ForumPostsComponent implements OnInit {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // ── State ─────────────────────────────────────────────────────────────────
  courseId = 0;
  lessonId = 0;
  posts = signal<ForumPostDto[]>([]);
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  sortBy = signal<string>('newest');

  // ── Modals ────────────────────────────────────────────────────────────────
  showPostModal = signal(false);
  showReportModal = signal(false);
  showDeleteModal = signal(false);
  editingPost = signal<ForumPostDto | null>(null);
  reportingPostId = signal<number | null>(null);
  deletingPost = signal<ForumPostDto | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────────
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

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.loadPosts();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  loadPosts() {
    this.loading.set(true);
    this.forumService.getPosts(this.lessonId, this.sortBy()).subscribe({
      next: (data) => {
        const visible = (Array.isArray(data) ? data : (data as any)?.data ?? [])
          .filter((p: ForumPostDto) => !p.isRemoved);
        this.posts.set(visible);
        this.loading.set(false);
      },
      error: () => this.flashError('Failed to load posts.'),
    });
  }

  onSortChange(e: Event) {
    this.sortBy.set((e.target as HTMLSelectElement).value);
    this.loadPosts();
  }

  // ── Create / Edit Post ────────────────────────────────────────────────────
  openCreatePost() {
    this.editingPost.set(null);
    this.postForm.reset();
    this.showPostModal.set(true);
  }

  openEditPost(post: ForumPostDto) {
    this.editingPost.set(post);
    this.postForm.patchValue({ title: post.title, body: post.body });
    this.showPostModal.set(true);
  }

  savePost() {
    if (this.postForm.invalid) return;
    this.loading.set(true);
    const dto = this.postForm.value;
    const editing = this.editingPost();

    const action = editing
      ? this.forumService.updatePost(this.lessonId, editing.id, dto)
      : this.forumService.createPost(this.lessonId, dto);

    action.subscribe({
      next: () => {
        this.showPostModal.set(false);
        this.flash(editing ? 'Post updated successfully.' : 'Post created successfully.');
        this.loadPosts();
      },
      error: () => this.flashError(editing ? 'Failed to update post.' : 'Failed to create post.'),
    });
  }

  // ── Delete Post ───────────────────────────────────────────────────────────
  openDeleteModal(post: ForumPostDto) {
    this.deletingPost.set(post);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deletingPost.set(null);
  }

  confirmDeletePost() {
    const post = this.deletingPost();
    if (!post) return;
    this.forumService.deletePost(this.lessonId, post.id).subscribe({
      next: () => {
        this.posts.update(list => list.filter(p => p.id !== post.id));
        this.closeDeleteModal();
        this.flash('Post deleted successfully.');
      },
      error: () => this.flashError('Failed to delete post.'),
    });
  }

  // ── Upvote ────────────────────────────────────────────────────────────────
  upvotePost(post: ForumPostDto) {
    if (post.hasUpvoted) return;

    // Optimistic update
    this.posts.update(list =>
      list.map(p => p.id === post.id
        ? { ...p, upvoteCount: p.upvoteCount + 1, hasUpvoted: true }
        : p)
    );

    this.forumService.upvotePost(this.lessonId, post.id).subscribe({
      error: (err) => {
        // Rollback on failure
        this.posts.update(list =>
          list.map(p => p.id === post.id
            ? { ...p, upvoteCount: p.upvoteCount - 1, hasUpvoted: false }
            : p)
        );
        if (err.status === 400) {
          this.flashError('You have already upvoted this post.');
        } else {
          this.flashError('Failed to upvote.');
        }
      },
    });
  }

  // ── Report ────────────────────────────────────────────────────────────────
  openReport(postId: number) {
    this.reportingPostId.set(postId);
    this.reportForm.reset();
    this.showReportModal.set(true);
  }

  submitReport() {
    if (this.reportForm.invalid || !this.reportingPostId()) return;
    this.forumService.reportPost(this.lessonId, this.reportingPostId()!, this.reportForm.value).subscribe({
      next: () => {
        this.showReportModal.set(false);
        this.flash('Report submitted. Thank you.');
      },
      error: () => this.flashError('Failed to submit report.'),
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goToPost(postId: number) {
    this.router.navigate(['/courses', this.courseId, 'lessons', this.lessonId, 'forum', postId]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isOwner(post: ForumPostDto): boolean {
    return post.studentId === this.currentUserId();
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
