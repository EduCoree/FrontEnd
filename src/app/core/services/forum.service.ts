import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ForumPostDto, ForumPostDetailDto,
  CreatePostDto, UpdatePostDto,
  CreateReplyDto, UpdateReplyDto,
  ReportPostDto, PostReportDto
} from '../models/forum';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/courses`;
  private adminBase = `${environment.apiUrl}/api/admin/forum`;

  // ── Posts ──────────────────────────────────────────────────────────────────

  getPosts(courseId: number, sort: string = 'newest'): Observable<ForumPostDto[]> {
    const params = new HttpParams().set('sort', sort);
    return this.http.get<ForumPostDto[]>(`${this.base}/${courseId}/forum/posts`, { params });
  }

  getPostDetails(courseId: number, postId: number): Observable<ForumPostDetailDto> {
    return this.http.get<ForumPostDetailDto>(`${this.base}/${courseId}/forum/posts/${postId}`);
  }

  createPost(courseId: number, dto: CreatePostDto): Observable<ForumPostDto> {
    return this.http.post<ForumPostDto>(`${this.base}/${courseId}/forum/posts`, dto);
  }

  updatePost(courseId: number, postId: number, dto: UpdatePostDto): Observable<ForumPostDto> {
    return this.http.put<ForumPostDto>(`${this.base}/${courseId}/forum/posts/${postId}`, dto);
  }

  deletePost(courseId: number, postId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}/forum/posts/${postId}`);
  }

  // ── Replies ───────────────────────────────────────────────────────────────

  addReply(courseId: number, postId: number, dto: CreateReplyDto): Observable<any> {
    return this.http.post<any>(`${this.base}/${courseId}/forum/posts/${postId}/replies`, dto);
  }

  updateReply(courseId: number, postId: number, replyId: number, dto: UpdateReplyDto): Observable<any> {
    return this.http.put<any>(`${this.base}/${courseId}/forum/posts/${postId}/replies/${replyId}`, dto);
  }

  deleteReply(courseId: number, postId: number, replyId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}/forum/posts/${postId}/replies/${replyId}`);
  }

  // ── Upvote ────────────────────────────────────────────────────────────────

  upvotePost(courseId: number, postId: number): Observable<any> {
    return this.http.post<any>(`${this.base}/${courseId}/forum/posts/${postId}/upvote`, {});
  }

  // ── Report ────────────────────────────────────────────────────────────────

  reportPost(courseId: number, postId: number, dto: ReportPostDto): Observable<any> {
    return this.http.post<any>(`${this.base}/${courseId}/forum/posts/${postId}/report`, dto);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  getReports(): Observable<PostReportDto[]> {
    return this.http.get<PostReportDto[]>(`${this.adminBase}/reports`);
  }

  dismissReport(reportId: number): Observable<any> {
    return this.http.put<any>(`${this.adminBase}/reports/${reportId}/dismiss`, {});
  }

  adminDeletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/posts/${postId}`);
  }
}
