export interface Review {
  id: number;
  studentId: string;
  studentName: string;
  courseId: number;
  courseName: string;  
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


export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}