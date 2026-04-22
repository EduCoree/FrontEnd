import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ChatMessage, ChatRequest, ChatApiResponse } from '../models/chat.models';
import { AuthService } from '../../../core/services/auth';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private base = `${environment.apiUrl}/api/chat`;

  // ── Reactive State (Signals) ───────────────────────────────────────────────
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  isOpen = signal<boolean>(false);
  error = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  hasMessages = computed(() => this.messages().length > 0);

  // ── User Info (from JWT) ───────────────────────────────────────────────────
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user?.name ?? 'You';
  });

  userInitial = computed(() => {
    const name = this.userName();
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  sendMessage(text: string, courseId?: number): void {
    if (!text.trim() || this.isLoading()) return;

    // Optimistic: add user message immediately
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      createdAt: new Date(),
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);
    this.error.set(null);

    const body: ChatRequest = { message: text.trim() };
    if (courseId) body.courseId = courseId;

    // Auth header is attached automatically by the auth interceptor
    this.http.post<any>(this.base, body).subscribe({
      next: (res) => {
        // Handle both direct {reply, createdAt} and wrapped {isSuccess, value} formats
        const data = res.value ?? res;
        if (data.reply) {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.reply,
            createdAt: new Date(data.createdAt),
          };
          this.messages.update(msgs => [...msgs, assistantMsg]);
        } else {
          this.appendErrorMessage(res.error?.message ?? 'Unexpected response from the server.');
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          // Auth interceptor will attempt refresh; if that also fails,
          // user is redirected to login. We still surface a message.
          this.appendErrorMessage('Your session has expired. Please log in again.');
        } else if (err.status === 0) {
          this.appendErrorMessage('You appear to be offline. Please check your connection.');
        } else {
          this.appendErrorMessage('Sorry, something went wrong. Please try again.');
        }
      },
    });
  }

  clearHistory(): void {
    this.http.delete(`${this.base}/history`).subscribe({
      next: () => {
        this.messages.set([]);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Failed to clear history.');
      },
    });
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private appendErrorMessage(content: string): void {
    const errorMsg: ChatMessage = {
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
