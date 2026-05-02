import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-jitsi-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jitsi-player.html',
  styleUrl: './jitsi-player.css'
})
export class JitsiPlayer implements AfterViewInit, OnDestroy {
  @Input() roomName!: string;
  @Input() userName!: string;
  @Input() userEmail!: string;

  @Output() leftMeeting = new EventEmitter<void>();

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;

  private api: any = null;
  private scriptLoaded = false;

  constructor() {}

  ngAfterViewInit(): void {
    this.loadJitsiScript().then(() => {
      this.initJitsi();
    }).catch(err => console.error('Failed to load Jitsi API script', err));
  }

  ngOnDestroy(): void {
    this.destroyJitsi();
  }

  private loadJitsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof JitsiMeetExternalAPI !== 'undefined') {
        this.scriptLoaded = true;
        return resolve();
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Jitsi API'));
      document.head.appendChild(script);
    });
  }

  private initJitsi(): void {
    if (!this.scriptLoaded || !this.jitsiContainer || !this.roomName) return;

    this.destroyJitsi(); // Clean up if existing

    const domain = 'meet.jit.si';
    const options = {
      roomName: this.roomName,
      width: '100%',
      height: '100%',
      parentNode: this.jitsiContainer.nativeElement,
      userInfo: {
        email: this.userEmail,
        displayName: this.userName
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      }
    };

    this.api = new JitsiMeetExternalAPI(domain, options);

    this.api.addListener('videoConferenceLeft', () => {
      this.leftMeeting.emit();
    });
  }

  private destroyJitsi(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }
}
