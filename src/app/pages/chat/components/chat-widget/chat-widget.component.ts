import { Component, inject, input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ChatService } from '../../services/chat.service';
import { ChatPanelComponent } from '../chat-panel/chat-panel.component';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [ChatPanelComponent],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss',
  animations: [
    trigger('panelAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(12px)' }),
        animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in',
          style({ opacity: 0, transform: 'scale(0.9) translateY(12px)' })),
      ]),
    ]),
    trigger('fabPulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class ChatWidgetComponent {
  chatService = inject(ChatService);
  authService = inject(AuthService);

  courseId = input<number | undefined>(undefined);

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  closeChat(): void {
    this.chatService.closeChat();
  }
}
