import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LiveSessionResponse, JoinSessionResponse } from '../../../core/models/session';
import { LiveSessionService } from '../../../core/services/live-session';
import { TranslateModule } from '@ngx-translate/core';
import { JitsiPlayerComponent } from '../../../shared/components/jitsi-player/jitsi-player';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-student-agenda',
  standalone: true,
  imports: [CommonModule, TranslateModule, JitsiPlayerComponent],
  templateUrl: './student-agenda.component.html',
})
export class StudentAgendaComponent implements OnInit, OnDestroy {

  // ─── State Signals ────────────────────────────────────────────────────────
  sessions = signal<LiveSessionResponse[]>([]);
  isLoading = signal(true);
  successMsg = signal('');
  errorMsg = signal('');
  jitsiRoomName = signal<string>('');

  /** Per-session joinability map — updated every 30s */
  joinableMap = signal<Record<number, boolean>>({});

  private joinabilityInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private liveSessionService: LiveSessionService,
    private sanitizer: DomSanitizer
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

  auth = inject(AuthService);
  currentUser = this.auth.currentUser;

  // ─── Join Session ─────────────────────────────────────────────────────────

  joinSession(session: LiveSessionResponse): void {
    this.liveSessionService.joinSession(session.id).subscribe({
      next: (res: JoinSessionResponse) => {
        if (res.provider === 'Jitsi') {
          this.jitsiRoomName.set(res.roomName);
        } else {
          window.open(res.roomName, '_blank');
        }
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

  // ─── Jitsi In-App Viewer ──────────────────────────────────────────────────

  /** Closes the in-app Jitsi viewer overlay. */
  leaveJitsiSession(): void {
    this.jitsiRoomName.set('');
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
