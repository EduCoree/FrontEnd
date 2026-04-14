import { Component, output, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
})
export class ChatInputComponent {
  messageSent = output<string>();
  disabled = input<boolean>(false);

  inputText = '';

  onEnter(event: Event): void {
    const kbEvent = event as KeyboardEvent;
    if (!kbEvent.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.disabled()) return;
    this.messageSent.emit(text);
    this.inputText = '';
  }

  /** Auto-grow textarea to fit content */
  onInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }
}
