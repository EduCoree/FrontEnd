// src/app/pages/teacher/teacher-sessions/teacher-sessions.component.ts
// Branch: feature/teacher-live-sessions-ui

import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  LiveSessionResponse,
  CreateLiveSessionRequest,
  UpdateLiveSessionRequest,
  UpdateRecordingRequest,
} from '../../../core/models/session';
import { LiveSessionService } from '../../../core/services/live-session';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-teacher-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule , TranslateModule],
  templateUrl: './teacher-sessions.component.html',
  styleUrl: './teacher-sessions.component.css',
})
export class TeacherSessionsComponent implements OnInit {

  courseId!: number;

  // ─── State Signals ────────────────────────────────────────────────────────
  sessions        = signal<LiveSessionResponse[]>([]);
  isLoading       = signal(true);
  isSaving        = signal(false);
  showModal       = signal(false);
  editingSession  = signal<LiveSessionResponse | null>(null);
  showRecordingModal    = signal(false);
  recordingTargetId     = signal<number | null>(null);
  successMsg      = signal('');
  errorMsg        = signal('');

  // ─── Computed Groups ──────────────────────────────────────────────────────
  now = Date.now();

  currentSessions = computed(() =>
    this.sessions().filter(s => {
      const msUntilStart = new Date(s.scheduledAt).getTime() - this.now;
      return msUntilStart <= 15 * 60 * 1000 && msUntilStart >= -120 * 60 * 1000;
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  );

  upcomingSessions = computed(() =>
    this.sessions().filter(s => {
      const msUntilStart = new Date(s.scheduledAt).getTime() - this.now;
      return msUntilStart > 15 * 60 * 1000;
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  );

  pastSessions = computed(() =>
    this.sessions().filter(s => {
      const msUntilStart = new Date(s.scheduledAt).getTime() - this.now;
      return msUntilStart < -120 * 60 * 1000;
    }).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  );

  // ─── Forms ───────────────────────────────────────────────────────────────
  sessionForm: FormGroup;
  recordingForm: FormGroup;

  providers = [
    { value: 'Jitsi',          label: 'Jitsi' },
    { value: 'Zoom',           label: 'Zoom' },
    { value: 'MicrosoftTeams', label: 'Microsoft Teams' },
    { value: 'GoogleMeet',     label: 'Google Meet' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liveSessionService: LiveSessionService,
    private fb: FormBuilder
  ) {
    this.sessionForm = this.fb.group({
      provider:     ['Jitsi', Validators.required],
      meetingUrl:   [null],                         // validator toggled by effect()
      scheduledAt:  ['', Validators.required],
      title:        ['', [Validators.required, Validators.maxLength(200)]],
      description:  [null],
    });

    this.recordingForm = this.fb.group({
      recordingUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });

    // ─── Toggle meetingUrl validator based on provider ────────────────────
    effect(() => {
      // Read provider from form — run on every change cycle
      const providerControl = this.sessionForm.get('provider');
      const urlControl      = this.sessionForm.get('meetingUrl');
      if (!providerControl || !urlControl) return;

      providerControl.valueChanges.subscribe((provider: string) => {
        if (provider === 'Jitsi') {
          urlControl.clearValidators();
          urlControl.setValue(null);
        } else {
          urlControl.setValidators([Validators.required, Validators.maxLength(255)]);
        }
        urlControl.updateValueAndValidity();
      });
    });
  }

  ngOnInit(): void {
    // Parent shell route param is :id  (teacher/courses/edit/:id)
    const parentParams = this.route.parent?.snapshot.paramMap;
    this.courseId = Number(
      parentParams?.get('id') ?? this.route.snapshot.paramMap.get('courseId')
    );
    this.loadSessions();
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  loadSessions(): void {
    this.isLoading.set(true);
    this.now = Date.now();
    this.liveSessionService.getSessionsByCourse(this.courseId).subscribe({
      next: (data) => {
        this.sessions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.flash('error', 'Failed to load sessions.');
        this.isLoading.set(false);
      },
    });
  }

  // ─── Modal: Schedule / Edit ────────────────────────────────────────────────

  openScheduleModal(): void {
    this.editingSession.set(null);
    this.sessionForm.reset({ provider: 'Jitsi' });
    this.showModal.set(true);
  }

  openEditModal(session: LiveSessionResponse): void {
    this.editingSession.set(session);
    this.sessionForm.patchValue({
      provider:    session.provider,
      meetingUrl:  session.meetingUrl,
      scheduledAt: this.toDatetimeLocal(session.scheduledAt),
      title:       session.title ?? '',
      description: session.description ?? null,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingSession.set(null);
    this.sessionForm.reset({ provider: 'Jitsi' });
  }

  submitSessionForm(): void {
    if (this.sessionForm.invalid) return;
    this.isSaving.set(true);

    const val = this.sessionForm.value;
    const editing = this.editingSession();

    if (editing) {
      // ── Update
      const payload: UpdateLiveSessionRequest = {
        provider:    val.provider,
        scheduledAt: val.scheduledAt,
        title:       val.title,
        description: val.description || undefined,
        meetingUrl:  val.provider !== 'Jitsi' ? val.meetingUrl : undefined,
      };
      this.liveSessionService.updateSession(this.courseId, editing.id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.flash('success', 'Session updated successfully!');
          this.loadSessions();
        },
        error: () => {
          this.isSaving.set(false);
          this.flash('error', 'Failed to update session.');
        },
      });
    } else {
      // ── Create
      const payload: CreateLiveSessionRequest = {
        provider:    val.provider,
        scheduledAt: val.scheduledAt,
        title:       val.title,
        description: val.description || undefined,
        meetingUrl:  val.provider !== 'Jitsi' ? val.meetingUrl : undefined,
      };
      this.liveSessionService.scheduleSession(this.courseId, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.flash('success', 'Session scheduled!');
          this.loadSessions();
        },
        error: () => {
          this.isSaving.set(false);
          this.flash('error', 'Failed to schedule session.');
        },
      });
    }
  }

  // ─── Cancel Session ───────────────────────────────────────────────────────

  cancelSession(sessionId: number): void {
    const confirmed = confirm(
      'Are you sure? This will cancel the session and notify all actively enrolled students.'
    );
    if (!confirmed) return;

    this.liveSessionService.cancelSession(this.courseId, sessionId).subscribe({
      next: () => {
        this.flash('success', 'Session cancelled and students notified.');
        this.loadSessions();
      },
      error: () => this.flash('error', 'Failed to cancel session.'),
    });
  }

  joinSession(session: LiveSessionResponse): void {
    const url = session.provider === 'Jitsi' 
      ? `https://meet.jit.si/${session.meetingUrl}` 
      : session.meetingUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }

  // ─── Recording Modal ──────────────────────────────────────────────────────

  openRecordingModal(sessionId: number): void {
    this.recordingTargetId.set(sessionId);
    this.recordingForm.reset();
    this.showRecordingModal.set(true);
  }

  closeRecordingModal(): void {
    this.showRecordingModal.set(false);
    this.recordingTargetId.set(null);
    this.recordingForm.reset();
  }

  submitRecordingForm(): void {
    if (this.recordingForm.invalid) return;
    const targetId = this.recordingTargetId();
    if (!targetId) return;

    this.isSaving.set(true);
    const payload: UpdateRecordingRequest = {
      recordingUrl: this.recordingForm.value.recordingUrl,
    };

    this.liveSessionService.addRecording(this.courseId, targetId, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeRecordingModal();
        this.flash('success', 'Recording URL saved!');
        this.loadSessions();
      },
      error: () => {
        this.isSaving.set(false);
        this.flash('error', 'Failed to save recording URL.');
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Convert ISO string to value compatible with <input type="datetime-local"> */
  private toDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

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

  isJitsi(): boolean {
    return this.sessionForm.get('provider')?.value === 'Jitsi';
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'sections']);
  }

  goToMedia(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'media']);
  }

  goToDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}
