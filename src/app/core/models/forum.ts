
// ─── Forum Post ─────────────────────────────────────────────────────────────

export interface ForumPostDto {
  id: number;
  lessonId: number;
  studentId: string;
  studentName: string;
  title: string;
  body: string;
  upvoteCount: number;
  replyCount: number;
  hasUpvoted: boolean;
  isRemoved: boolean;
  createdAt: string;
}

export interface ForumPostDetailDto {
  id: number;
  lessonId: number;
  studentId: string;
  studentName: string;
  title: string;
  body: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  isRemoved: boolean;
  createdAt: string;
  replies: ForumReplyDto[];
}

// ─── Forum Reply ────────────────────────────────────────────────────────────

export interface ForumReplyDto {
  id: number;
  postId: number;
  userId: string;
  userName: string;
  body: string;
  upvoteCount: number;
  isRemoved: boolean;
  createdAt: string;
}

// ─── Create / Update DTOs ───────────────────────────────────────────────────

export interface CreatePostDto {
  title: string;
  body: string;
}

export interface UpdatePostDto {
  title: string;
  body: string;
}

export interface CreateReplyDto {
  body: string;
}

export interface UpdateReplyDto {
  body: string;
}

export interface ReportPostDto {
  reason: string;
}

// ─── Admin Report ───────────────────────────────────────────────────────────

export interface PostReportDto {
  id: number;
  userId: string;
  reporterName: string;
  postId: number;
  postTitle: string;
  reason: string;
  createdAt: string;
}
