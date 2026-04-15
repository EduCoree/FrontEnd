import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './error-page.html',
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-14px); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.6); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes ping {
      0% { transform: scale(1); opacity: 0.4; }
      75%, 100% { transform: scale(1.8); opacity: 0; }
    }
    .anim-float { animation: float 3.5s ease-in-out infinite; }
    .anim-icon { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .anim-1 { animation: fadeIn 0.6s ease-out 0.2s forwards; opacity: 0; }
    .anim-2 { animation: fadeIn 0.6s ease-out 0.35s forwards; opacity: 0; }
    .anim-3 { animation: fadeIn 0.6s ease-out 0.5s forwards; opacity: 0; }
    .anim-4 { animation: fadeIn 0.6s ease-out 0.65s forwards; opacity: 0; }
    .anim-ping { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  `],
})
export class ErrorPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  code = signal(404);
  isLoggedIn = signal(false);

  errorConfig: Record<number, { icon: string; title: string; message: string; iconColor: string; iconBg: string; accent: string }> = {
    401: {
      icon: 'lock',
      title: 'Session Expired',
      message: 'Your session has ended. Please sign in again to continue where you left off.',
      iconColor: '#8a6d3b',
      iconBg: '#fde9c9',
      accent: '#8a6d3b',
    },
    403: {
      icon: 'shield',
      title: 'Access Denied',
      message: "You don't have permission to view this page. Contact your administrator if you think this is a mistake.",
      iconColor: '#a83836',
      iconBg: '#ffdad6',
      accent: '#a83836',
    },
    404: {
      icon: 'search_off',
      title: 'Page Not Found',
      message: "The page you're looking for has been moved, deleted, or never existed in the first place.",
      iconColor: '#2e6959',
      iconBg: '#b2efda',
      accent: '#2e6959',
    },
    500: {
      icon: 'error_outline',
      title: 'Something Went Wrong',
      message: "Our servers are having a tough moment. We're on it — please try again in a few minutes.",
      iconColor: '#a83836',
      iconBg: '#ffdad6',
      accent: '#2e6959',
    },
  };

  ngOnInit() {
    this.code.set(Number(this.route.snapshot.data['code'] ?? 404));
    this.isLoggedIn.set(this.auth.isLoggedIn());
  }

  get config() {
    return this.errorConfig[this.code()] ?? this.errorConfig[404];
  }

  reload() {
    window.location.reload();
  }

  goBack() {
    window.history.back();
  }
}