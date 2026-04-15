// src/app/pages/student/student-agenda/student-agenda.component.ts
// Branch: feature/student-sessions-video-flow

import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveSessionResponse, JoinSessionResponse } from '../../../core/models/session';
import { LiveSessionService } from '../../../core/services/live-session';

@Component({
  selector: 'app-student-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-agenda.component.html',
})
export class StudentAgendaComponent implements OnInit, OnDestroy {

  // ─── State Signals ────────────────────────────────────────────────────────
  sessions = signal<LiveSessionResponse[]>([]);
  isLoading = signal(true);
  successMsg = signal('');
  errorMsg = signal('');

  /** Per-session joinability map — updated every 30s */
  joinableMap = signal<Record<number, boolean>>({});

  private joinabilityInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private liveSessionService: LiveSessionService
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  ngOnDestroy(): void {
    if (this.joinabilityInterval) {
      clearInterval(this.joinabilityInterval);
    }
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  loadSessions(): void {
    this.isLoading.set(true);
    this.liveSessionService.getUpcomingSessions().subscribe({
      next: (data) => {
        this.sessions.set(data);
        this.isLoading.set(false);
        this.updateJoinabilityMap();
        this.startJoinabilityTimer();
      },
      error: () => {
        this.flash('error', 'Failed to load sessions. Please refresh the page.');
        this.isLoading.set(false);
      },
    });
  }

  // ─── 15-Minute Join Rule ──────────────────────────────────────────────────

  private canJoin(session: LiveSessionResponse): boolean {
    const msUntilStart = new Date(session.scheduledAt).getTime() - Date.now();
    return msUntilStart <= 15 * 60 * 1000; // within 15 minutes or past
  }

  private updateJoinabilityMap(): void {
    const map: Record<number, boolean> = {};
    for (const s of this.sessions()) {
      map[s.id] = this.canJoin(s);
    }
    this.joinableMap.set(map);
  }

  private startJoinabilityTimer(): void {
    if (this.joinabilityInterval) clearInterval(this.joinabilityInterval);
    this.joinabilityInterval = setInterval(() => {
      this.updateJoinabilityMap();
    }, 30_000); // every 30 seconds
  }

  // ─── Join Session ─────────────────────────────────────────────────────────

  joinSession(session: LiveSessionResponse): void {
    this.liveSessionService.joinSession(session.id).subscribe({
      next: (res: JoinSessionResponse) => {
        // meet.jit.si blocks iframe embedding (X-Frame-Options: SAMEORIGIN),
        // so all providers — including Jitsi — open in a new tab.
        const url = res.provider === 'Jitsi'
          ? `https://meet.jit.si/${res.roomName}`
          : res.roomName;
        window.open(url, '_blank');
      },
      error: (err) => {
        if (err?.status === 403) {
          this.flash('error', 'You can only join within 15 minutes of the session start time.');
        } else {
          this.flash('error', 'Failed to join session. Please try again.');
        }
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private flash(type: 'success' | 'error', msg: string): void {
    if (type === 'success') {
      this.successMsg.set(msg);
      this.errorMsg.set('');
      setTimeout(() => this.successMsg.set(''), 3500);
    } else {
      this.errorMsg.set(msg);
      this.successMsg.set('');
      setTimeout(() => this.errorMsg.set(''), 3500);
    }
  }
}
