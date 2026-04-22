import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { metadata, NotificationDto } from '../../core/models/notification';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TimeAgoPipePipe } from "../../shared/pipes/time-ago-pipe-pipe";

@Component({
  selector: 'app-notification',
  imports: [CommonModule, TimeAgoPipePipe],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification {

  private readonly notificationService = inject(NotificationService);
  private readonly router              = inject(Router);
  private readonly location            = inject(Location);
  private readonly cdr                 = inject(ChangeDetectorRef)
 
  notifications: NotificationDto[] = [];
  isLoading      = false;
  isMarkingRead  = false;
  errorMessage: string | null = null;
  currentPage    = 1;
  hasMorePages   = true;
  pagesize=10;
  private destroy$ = new Subject<void>();   
 
  ngOnInit(): void {

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))   // if we dont make that signalr still sending to this component even if closed
      .subscribe(list => (this.notifications = list));
    this.loadPage(1);
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();  // emit a signal to close 
    this.destroy$.complete();  // remove the destoy subject itself
  }
 
  loadPage(page: number): void {
    if (this.isLoading) return;
    this.isLoading = true;
 
    this.notificationService.loadNotifications(page).subscribe(
      {
        next:(res)=>
        {
                this.currentPage=page;
            const totalPages = Math.ceil(res.data.totalCount / this.pagesize);
            this.hasMorePages= this.currentPage<totalPages;
              this.isLoading=false;
              this.cdr.detectChanges();

        },
        error: (err) => {
    console.error('Failed to load notifications', err);
    this.isLoading = false; 
    this.cdr.detectChanges();
  }
      }
    )
    

  }
 
  loadMore(): void {
    if (!this.hasMorePages || this.isLoading) return;
    this.loadPage(this.currentPage + 1);
  }
 
  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.isMarkingRead = true;
 
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
       this.notificationService.loadNotifications(1, this.pagesize).subscribe({
        next: () => (this.isMarkingRead = false),
        error: () => (this.isMarkingRead = false)
      });
    },
    error: () => {
      this.isMarkingRead = false;
      this.showError('Could not sync with server. Try again?');
    },
    });
  }
 
  onNotificationClick(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: ()  => this.navigateTo(notification),
        error: () => this.navigateTo(notification), // navigate even if marking fails
      });
    } else {
      this.navigateTo(notification);
    }
  }
 
  private navigateTo(notification: NotificationDto): void {
    let extra: metadata | null = null;
 
    if (notification.metadata) {
      try {
        extra = JSON.parse(notification.metadata) as metadata;
      } catch {
        console.error('Failed to parse notification metadata');
      }
    }
 
    switch (notification.type) {
      case 'QuizResult':
        notification.entityId && extra?.attemptId
          ? this.router.navigate(['/Quiz', notification.entityId, 'result', extra.attemptId])
          : this.router.navigate(['/quiz/intro', notification.entityId]);
        break;
  
      default:
        console.warn('Unknown notification type:', notification.type);
    }
  }
 
  goBack(): void {
    this.location.back();
  }
 
  // ─── Grouping helpers ──────────────────────────────────────────────────────
  get newestNotifications(): NotificationDto[] {
    const start = this.startOfToday();
    return this.notifications.filter(n => new Date(n.createdAt) >= start);
  }
 
  get yesterdayNotifications(): NotificationDto[] {
    const start     = this.startOfToday();
    const yesterday = new Date(start);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.notifications.filter(n => {
      const d = new Date(n.createdAt);
      return d >= yesterday && d < start;
    });
  }
 
  get olderNotifications(): NotificationDto[] {
    const yesterday = new Date(this.startOfToday());
    yesterday.setDate(yesterday.getDate() - 1);
    return this.notifications.filter(n => new Date(n.createdAt) < yesterday);
  }
 
  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
 
 
 
  getIconForType(type: string): string {
    const map: Record<string, string> = {
      QuizResult:    'quiz',
      ForumReply:    'forum',
      NewEnrollment: 'person_add',
      LiveSession:   'podcasts',
    };
    return map[type] ?? 'notifications';
  }
 
  getIconBgClass(type: string): string {
    const map: Record<string, string> = {
      QuizResult:    'bg-[#E3F2FD]',
      ForumReply:    'bg-tertiary-container/30',
      NewEnrollment: 'bg-secondary-container',
      LiveSession:   'bg-error-container/30',
    };
    return map[type] ?? 'bg-surface-container';
  }
 
  getIconColorClass(type: string): string {
    const map: Record<string, string> = {
      QuizResult:    'text-[#1E88E5]',
      ForumReply:    'text-tertiary',
      NewEnrollment: 'text-on-secondary-container',
      LiveSession:   'text-error',
    };
    return map[type] ?? 'text-primary';
  }
 
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
 
  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = null), 3000);
  }
}
