import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { ChatMessage } from '../../models/chat.models';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  private sanitizer = inject(DomSanitizer);

  message = input.required<ChatMessage>();
  userInitial = input<string>('U');

  /** Lightweight markdown → HTML for assistant messages (bold, italic, code, lists) */
  formatContent(text: string): SafeHtml {
    let html = this.escapeHtml(text);

    // Code blocks ```...```
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="chat-code-block">$1</pre>');
    // Inline code `...`
    html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
    // Bold **...**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic *...*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Unordered list items  - item
    html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="chat-list">$&</ul>');
    // Numbered list items  1. item
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
