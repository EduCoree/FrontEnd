
export interface CourseSummaryDto {
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
  totalStudents: number;
  totalSections: number;
  totalLessons: number;
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