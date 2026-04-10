// src/app/pages/student/lesson-player/lesson-player.component.ts
// Branch: feature/lesson-player

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StudentContentService } from '../../../core/services/student-content';
import { ProgressService } from '../../../core/services/progress';

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-player.component.html',
})
export class LessonPlayerComponent implements OnInit, OnDestroy {

  // ─── State Signals ────────────────────────────────────────────────────────
  lessonId            = signal<number>(0);
  courseId            = signal<number>(0);
  signedUrl           = signal<string | null>(null);
  expiresAt           = signal<string | null>(null);
  provider            = signal<string>('');
  safeUrl             = signal<SafeResourceUrl | null>(null);
  isLoading           = signal(true);
  isExpired           = signal(false);
  isCompleted         = signal(false);
  currentPositionSecs = signal(0);
  successMsg          = signal('');
  errorMsg            = signal('');

  private expiryInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentContentService: StudentContentService,
    private progressService: ProgressService,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {}

  ngOnInit(): void {
    const routeCourseId = Number(this.route.snapshot.paramMap.get('courseId'));
    const routeLessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    
    this.courseId.set(routeCourseId);
    this.lessonId.set(routeLessonId);
    
    this.loadSignedUrl(routeLessonId);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  // ─── Load Signed URL ──────────────────────────────────────────────────────

  private loadSignedUrl(lessonId: number): void {
    this.isLoading.set(true);
    this.studentContentService.getVideoSignedUrl(lessonId).subscribe({
      next: (res) => {
        this.signedUrl.set(res.url);
        this.expiresAt.set(res.expiresAt);
        this.provider.set(this.detectProvider(res.url));
        this.buildSafeUrl(res.url);
        this.startExpiryWatcher(res.expiresAt);
        this.startHeartbeatWatcher(lessonId);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.errorMsg.set('You must be enrolled to watch this lesson.');
        } else {
          this.errorMsg.set('Failed to load video. Please try again.');
        }
        this.isLoading.set(false);
      },
    });
  }

  // ─── Provider Detection & Safe URL ───────────────────────────────────────

  private detectProvider(url: string): string {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/vimeo\.com/.test(url)) return 'vimeo';
    return 'self';
  }

  private buildSafeUrl(url: string): void {
    const p = this.provider();

    if (p === 'youtube') {
      const regex = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      if (match) {
        const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
      }
    } else if (p === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) {
        const embedUrl = `https://player.vimeo.com/video/${match[1]}`;
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
      }
    }
    // 'self' uses signedUrl() directly in the <video> tag — no safeUrl needed
  }

  // ─── Intervals (Expiry & Heartbeat) ───────────────────────────────────────

  private startExpiryWatcher(expiresAt: string): void {
    if (this.expiryInterval) clearInterval(this.expiryInterval);
    this.expiryInterval = setInterval(() => {
      if (Date.now() >= new Date(expiresAt).getTime()) {
        this.isExpired.set(true);
        clearInterval(this.expiryInterval!);
        this.expiryInterval = null;
      }
    }, 60_000); // check every 60 seconds
  }

  private startHeartbeatWatcher(lessonId: number): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      const p = this.provider();
      if (p !== 'self') {
        // If iframe provider, we can't reliably read exact native playback time
        // Just increment by roughly the heartbeat duration as best effort.
        this.currentPositionSecs.update(val => val + 30);
      }
      
      this.progressService.recordWatchProgress(lessonId, {
        lastPositionSecs: this.currentPositionSecs()
      }).subscribe({
        error: () => console.warn('Heartbeat limit reached or progress failed sync.')
      });
      
    }, 30_000); // Send heartbeat every 30 seconds
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  onTimeUpdate(event: Event): void {
    const videoElement = event.target as HTMLVideoElement;
    this.currentPositionSecs.set(Math.floor(videoElement.currentTime));
  }

  markComplete(): void {
    if (this.isCompleted()) return;

    this.progressService.markLessonComplete(this.lessonId()).subscribe({
      next: () => {
        this.isCompleted.set(true);
        this.flash('success', 'Lesson marked as complete!');
      },
      error: () => {
        this.flash('error', 'Failed to mark lesson as complete.');
      }
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

  refreshPage(): void {
    this.location.go(this.location.path());
    window.location.reload();
  }
}
