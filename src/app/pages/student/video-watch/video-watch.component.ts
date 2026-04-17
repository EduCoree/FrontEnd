// src/app/pages/student/video-watch/video-watch.component.ts
// Branch: feature/student-sessions-video-flow

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StudentContentService } from '../../../core/services/student-content';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-video-watch',
  standalone: true,
  imports: [CommonModule , TranslateModule],
  templateUrl: './video-watch.component.html',
})
export class StudentVideoWatchComponent implements OnInit, OnDestroy {

  // ─── State Signals ────────────────────────────────────────────────────────
  signedUrl  = signal<string | null>(null);
  expiresAt  = signal<string | null>(null);
  provider   = signal<string>('');
  isLoading  = signal(true);
  isExpired  = signal(false);
  errorMsg   = signal('');
  safeUrl    = signal<SafeResourceUrl | null>(null);

  private expiryInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentContentService: StudentContentService,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {}

  ngOnInit(): void {
    const lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.loadSignedUrl(lessonId);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
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

  // ─── Expiry Watcher ───────────────────────────────────────────────────────

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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  refreshPage(): void {
    this.location.go(this.location.path());
    window.location.reload();
  }
}
