// ─── Lesson AI Study Tool — Service ───────────────────────────────────────────
// Follows the same signal-based reactive pattern as ChatService.

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  LessonAiRequest,
  LessonAiResponse,
  LessonAiMessage,
} from '../models/lesson-ai.models';

@Injectable({ providedIn: 'root' })
export class LessonAiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/lesson-ai`;

  // ── Reactive State ──────────────────────────────────────────────────────────
  messages   = signal<LessonAiMessage[]>([]);
  isLoading  = signal(false);
  error      = signal<string | null>(null);
  isOpen     = signal(false);
  isExpanded = signal(false);

  hasMessages = computed(() => this.messages().length > 0);

  // ── Actions ─────────────────────────────────────────────────────────────────

  askQuestion(lessonId: number, question: string): void {
    if (!question.trim() || this.isLoading()) return;

    this.pushUserMessage(question, 'ask');
    const body: LessonAiRequest = { lessonId, question: question.trim() };
    this.callEndpoint(`${this.base}/ask`, body, 'ask');
  }

  summarize(lessonId: number): void {
    if (this.isLoading()) return;

    this.pushUserMessage('Summarize this lesson', 'summarize');
    const body: LessonAiRequest = { lessonId };
    this.callEndpoint(`${this.base}/summarize`, body, 'summarize');
  }

  translate(lessonId: number, targetLanguage: string = 'Arabic'): void {
    if (this.isLoading()) return;

    this.pushUserMessage(`Translate content to ${targetLanguage}`, 'translate');
    const body: LessonAiRequest = { lessonId, targetLanguage };
    this.callEndpoint(`${this.base}/translate`, body, 'translate');
  }

  transcribe(lessonId: number): void {
    if (this.isLoading()) return;

    this.pushUserMessage('Transcribe video audio', 'transcribe');
    const body: LessonAiRequest = { lessonId };
    this.callEndpoint(`${this.base}/transcribe`, body, 'transcribe');
  }

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  togglePanel(): void {
    this.isOpen.update(v => !v);
  }

  openPanel(): void {
    this.isOpen.set(true);
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private pushUserMessage(content: string, action: LessonAiMessage['action']): void {
    const msg: LessonAiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
      action,
    };
    this.messages.update(msgs => [...msgs, msg]);
    this.isLoading.set(true);
    this.error.set(null);
  }

  private callEndpoint(
    url: string,
    body: LessonAiRequest,
    action: LessonAiMessage['action'],
  ): void {
    // Auth header attached automatically by authInterceptor
    this.http.post<any>(url, body).subscribe({
      next: (res) => {
        // Backend returns { answer, createdAt } directly or wrapped in Result<T>
        const data = res.value ?? res;
        if (data.answer) {
          const assistantMsg: LessonAiMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.answer,
            createdAt: new Date(data.createdAt),
            action,
          };
          this.messages.update(msgs => [...msgs, assistantMsg]);
        } else {
          this.appendError(
            res.error?.message ?? 'Unexpected response from the server.'
          );
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.appendError('Your session has expired. Please log in again.');
        } else if (err.status === 403) {
          this.appendError('You must be enrolled in this course to use the AI Study Tool.');
        } else if (err.status === 0) {
          this.appendError('You appear to be offline. Please check your connection.');
        } else {
          this.appendError('Sorry, something went wrong. Please try again.');
        }
      },
    });
  }

  private appendError(content: string): void {
    const errorMsg: LessonAiMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      createdAt: new Date(),
      isError: true,
    };
    this.messages.update(msgs => [...msgs, errorMsg]);
    this.error.set(content);
  }
}
