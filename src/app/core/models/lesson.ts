// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CreateLessonRequest {
  sectionId: number;
  title: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface ToggleFreePreviewRequest {
  isFreePreview: boolean;
}

export interface AddVideoLessonRequest {
  videoUrl: string;
  videoProvider: string;
  thumbnailUrl?: string;
}

export interface AddPdfLessonRequest {
  fileUrl: string;
  fileSizeKb?: number;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface VideoLessonResponse {
  id: number;
  lessonId: number;
  videoUrl: string;
  videoProvider: string;
  thumbnailUrl?: string;
}

export interface PdfLessonResponse {
  id: number;
  lessonId: number;
  fileUrl: string;
  fileSizeKb?: number;
}

export interface LessonResponse {
  id: number;
  sectionId: number;
  title: string;
  type: string;
  sortOrder: number;
  durationSeconds?: number;
  isFreePreview: boolean;
  createdAt: string;
  videoLesson?: VideoLessonResponse;
  pdfLesson?: PdfLessonResponse;
}

export interface SignedUrlResponse {
  url: string;
  expiresAt: string;
}