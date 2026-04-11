export interface Review {
  id: number;
  studentId: string;
  courseId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment?: string;
}