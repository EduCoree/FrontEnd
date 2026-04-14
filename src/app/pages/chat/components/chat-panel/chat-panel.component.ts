import {
  Component, inject, input, output, effect,
  viewChild, ElementRef,
} from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [ChatMessageComponent, ChatInputComponent],
  templateUrl: './chat-panel.component.html',
  styleUrl: './chat-panel.component.scss',
})
export class ChatPanelComponent {
  chatService = inject(ChatService);

  courseId = input<number | undefined>(undefined);
  closed = output<void>();

  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    // Auto-scroll to bottom when messages change
    effect(() => {
      this.chatService.messages(); // track signal
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 50);
      }
    });
  }

  onMessageSent(text: string): void {
    this.chatService.sendMessage(text, this.courseId());
  }

  clearHistory(): void {
    this.chatService.clearHistory();
  }
}
