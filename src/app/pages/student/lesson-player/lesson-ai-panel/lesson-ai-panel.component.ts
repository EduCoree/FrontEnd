import {
  Component, inject, input, effect,
  viewChild, ElementRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonAiService } from '../../../../core/services/lesson-ai.service';

@Component({
  selector: 'app-lesson-ai-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lesson-ai-panel.component.html',
  styleUrl: './lesson-ai-panel.component.css',
})
export class LessonAiPanelComponent {
  aiService = inject(LessonAiService);

  lessonId = input.required<number>();
  courseId = input.required<number>();

  questionText = signal('');

  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    // Auto-scroll to bottom when messages change
    effect(() => {
      this.aiService.messages(); // track signal
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 50);
      }
    });
  }

  onSendQuestion(): void {
    const q = this.questionText().trim();
    if (!q) return;
    this.aiService.askQuestion(this.lessonId(), q);
    this.questionText.set('');
  }

  onSummarize(): void {
    this.aiService.summarize(this.lessonId());
  }

  onTranslate(): void {
    this.aiService.translate(this.lessonId(), 'Arabic');
  }

  onTranscribe(): void {
    this.aiService.transcribe(this.lessonId());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendQuestion();
    }
  }

  closePanel(): void {
    this.aiService.closePanel();
  }

  toggleExpand(): void {
    this.aiService.toggleExpand();
  }

  clearMessages(): void {
    this.aiService.clearMessages();
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }
}
