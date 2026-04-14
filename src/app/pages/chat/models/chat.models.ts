export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  courseId?: number;
}

export interface ChatResponse {
  reply: string;
  createdAt: string;
}

// Backend returns Result<T> wrapper
export interface ChatApiResponse {
  isSuccess: boolean;
  value: ChatResponse;
  error?: { code: string; message: string };
}
