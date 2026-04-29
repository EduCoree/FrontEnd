// ─── Lesson AI Study Tool — Models ────────────────────────────────────────────

/** Payload sent to all three /api/lesson-ai/* endpoints */
export interface LessonAiRequest {
  lessonId: number;
  question?: string;
  targetLanguage?: string;
}

/** Response returned by all three /api/lesson-ai/* endpoints */
export interface LessonAiResponse {
  answer: string;
  createdAt: string;
}

/** Internal UI model for the chat-style message list */
export interface LessonAiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  isError?: boolean;
  action?: 'ask' | 'summarize' | 'translate' | 'transcribe';
}
