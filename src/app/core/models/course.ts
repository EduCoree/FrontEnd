
export interface CourseSummaryDto {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  level: string;
  pricingType: string;
  price: number;
  //status: string;
  categoryName: string;
  teacherName: string;
  totalStudents: number;
  totalSections: number;
  totalLessons: number;
  discountedPrice?: number | null;
  status: 'Draft' | 'Published' | 'Archived';
  
}

// details of a course
export interface CourseDetailDto {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  level: string;
  pricingType: string;
  price: number;
  status: string;
  categoryName: string;
  teacherName: string;
  sections: SectionDto[];
}

// section of a course
export interface SectionDto {
  id: number;
  title: string;
  order: number;
  lessons: LessonDto[];
}

// lesson of a section
export interface LessonDto {
  id: number;
  title: string;
  type: string;
  sortOrder: number;
  durationSeconds: number;   
  isFreePreview: boolean;
}

// creating a new course
export interface CreateCourseDto {
  title: string;
  description: string;
  categoryId: number;
  level: string;
  pricingType: string;
  price: number;
}

// updating a course
export interface UpdateCourseDto {
  title: string;
  description: string;
  level: string;
  categoryId: number;
}
// updating the pricing
export interface UpdatePricingDto {
  pricingType: string;
  price: number;
  discountedPrice?: number | null;
}

// creating a new section
export interface CreateSectionDto {
  title: string;
}

// updating a section
export interface UpdateSectionDto {
  title: string;
}

// reordering items
export interface ReorderItemDto {
  id: number;
  order: number;
  sectionId?: number;
  sortOrder?: number;
}

// the Paged Result
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// the filter
export interface CourseFilterDto {
  search?: string;
  categoryId?: number;
  level?: string;
  status?: string;
  pricingType?: string;
}

export interface StudentEnrolledCourseDto {
  courseId: number;
  title: string;
  coverImage: string | null;
  teacherName: string;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

// ─── Content Delivery: Lesson DTOs ──────────────────────────────────────────

export interface CreateLessonDto {
  sectionId: number;
  title: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface UpdateLessonDto {
  title?: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface LessonResponse {
  id: number;
  sectionId: number;
  title: string;
  type: string;          // 'None' | 'Video' | 'Pdf'
  sortOrder: number;
  durationSeconds?: number;
  isFreePreview: boolean;
  createdAt: string;
}

export interface AddVideoLessonDto {
  videoUrl: string;
  videoProvider: string; // 'youtube' | 'vimeo' | 'self'
  thumbnailUrl?: string;
}

export interface AddPdfLessonDto {
  fileUrl: string;
  fileSizeKb?: number;
}

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

export interface ToggleFreePreviewDto {
  isFreePreview: boolean;
}

