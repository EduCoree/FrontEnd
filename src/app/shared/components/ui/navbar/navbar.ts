import { NotificationService } from './../../../../core/services/notification.service';

import { ChangeDetectorRef, ElementRef, HostListener, OnInit } from '@angular/core';
// src/app/layouts/navbar/navbar.ts


import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive ,RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { UserService } from '../../../../core/services/user';
import { LanguageService } from '../../../../core/services/language.service'; 
import { TranslateModule } from '@ngx-translate/core';
import { metadata, NotificationDto } from '../../../../core/models/notification';
import { TimeAgoPipePipe } from "../../../pipes/time-ago-pipe-pipe";
@Component({
  selector: 'app-navbar',
  
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, TranslateModule, TimeAgoPipePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  user = inject(UserService);
  notification= inject(NotificationService)
  private router = inject(Router);
   langService = inject(LanguageService);

  unreadcount$=this.notification.unreadCount$;   // loaded from loggin in
  isMarkingRead=false
  isDropdownOpen=false;
  errorMessage: string | null = null;
  eRef = inject(ElementRef);
  userProfile$ = this.user.getMe();
  mobileMenuOpen = signal(false);
  currentLang = this.langService.currentLang; 

  switchLang() { 
    this.langService.toggle();
  }

  logout() {
    const refreshToken = this.auth.getRefreshToken();
    if (refreshToken) {
      this.auth.logout(refreshToken).subscribe();
    }
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isTeacher(): boolean {
    return this.getRole() === 'Teacher';
  }

  /** Route the "Live Sessions" nav link based on the logged-in role */
  get liveSessionsRoute(): string {
    return this.isTeacher() ? '/teacher/dashboard' : '/student/sessions';
  }

  private getRole(): string {
    const token = this.auth.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? payload['role'] ?? [];
      const role = Array.isArray(roles) ? roles[0] : roles;
      return role ?? '';
    } catch {
      return '';
    }
  }

  get userInitials(): string {
    return (this.auth.currentUser()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }

  toggleDropdown()
  {
    this.isDropdownOpen=!this.isDropdownOpen
    if(this.isDropdownOpen)
    {
      this.notification.loadNotifications(1).subscribe();
    }

  }
  markAllAsRead(event:Event)
  {
    // Prevent bubbling to document; otherwise, if the button is replaced by a spinner,
  // the HostListener's .contains(event.target) check will fail (since the button 
  // is no longer in the DOM), causing the dropdown to close incorrectly.
    event.stopPropagation();  
    this.isMarkingRead=true;
     this.notification.markAllAsRead().subscribe(
      {
        next:()=>
        {
          this.notification.loadNotifications(1).subscribe();
          this.isMarkingRead=false;
        },
        error: () => {
        this.isMarkingRead = false;
        this.errorMessage = "Could not sync with server. Try again?";
        setTimeout(() => this.errorMessage = null, 3000);
}
      }

      
     )
  }


 onNotificationClick(notification: NotificationDto, event: Event): void {
    event.stopPropagation(); 
    
    if (!notification.isRead) {
      this.notification.markAsRead(notification.id).subscribe({
        next: () => {
          console.log('Notification marked as read');
          this.navigateToNotification(notification);
        },
        error: (err) => {
          console.error('Failed to mark as read:', err);
          this.navigateToNotification(notification);
        }
      });
    } else {
      // Already read, just navigate
      this.navigateToNotification(notification);
    }
  }
 private navigateToNotification(notification: NotificationDto): void {
    
    this.isDropdownOpen=false;
  let extraData: metadata|null = null
if (notification.metadata) {
  try {
    extraData = JSON.parse(notification.metadata) as metadata;
  } catch (e) {
    console.error("Failed to parse notification metadata", e);
  }
}

    switch (notification.type) {
      case 'QuizResult':
        if (notification.entityId && extraData?.attemptId) {
      this.router.navigate(['/Quiz', notification.entityId, 'result', extraData.attemptId]);
        }
        else {
      this.router.navigate(['/quiz/intro', notification.entityId]);
        }
        break;
      case 'Enrollment':
        this.router.navigate(['/courses', notification.entityId]); // ← course page
        break;
      case 'LiveSession':
        this.router.navigate(['/student/sessions']); // ← course page
        break;
      case 'SessionCancelled':
        this.router.navigate(['/student/sessions']); // ← course page
        break;
        
      default:
          this.router.navigate(['/notifications'])
        
    }
  }

  getIconForType(type: string): string {
    const icons: Record<string, string> = {
      'QuizResult': 'quiz',
      'ForumReply': 'forum',
      'Enrollment': 'person_add',
       'LiveSession':'podcasts',
       'SessionCancelled':'podcasts'
    };
    
    return icons[type] || 'notifications';
  }

  goToAllNotifications()
  {
    this.isDropdownOpen=false;
    this.router.navigate(['/notifications'])

  }



  @HostListener('document:click', ['$event'])   //like document.addeventlistner in js but here is a decorator function
  clickOutside(event: Event) {
    if (this.isDropdownOpen && !this.eRef.nativeElement.contains(event.target)) {  // if we removed the second check -> every click on the bell will close again , we tell him when the drop down is open and the click is not inside the navbar on the bell(when iam not opening it by myself)
      this.isDropdownOpen = false;
    }
  }
}