// src/app/core/models/session.ts
// ─── Live Sessions & Signed Video — Model Interfaces ─────────────────────────
// Branch: feature/live-session-models-services

// ─── Enum ────────────────────────────────────────────────────────────────────

export enum LiveProvider {
  Jitsi          = 'Jitsi',
  Zoom           = 'Zoom',
  MicrosoftTeams = 'MicrosoftTeams',
  GoogleMeet     = 'GoogleMeet',
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface LiveSessionResponse {
  id: number;
  courseId: number;
  provider: string;
  meetingUrl: string;
  scheduledAt: string;       // ISO string — use | date:'medium' in templates
  recordingUrl?: string;
  title?: string;
  description?: string;
  createdAt: string;         // ISO string
  courseName?: string;
  teacherName?: string;
}

export interface JoinSessionResponse {
  roomName: string;
  provider: string;
  title?: string;
}

export interface SignedUrlResponse {
  url: string;
  expiresAt: string;         // ISO string — 2-hour TTL from server
}

// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateLiveSessionRequest {
  provider: string;
  meetingUrl?: string;       // Optional — not sent when provider is 'Jitsi'
  scheduledAt: string;       // ISO string
  title: string;
  description?: string;
}

export interface UpdateLiveSessionRequest {
  provider?: string;
  meetingUrl?: string;
  scheduledAt?: string;
  title?: string;
  description?: string;
}

export interface UpdateRecordingRequest {
  recordingUrl: string;
}
