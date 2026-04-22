export interface EnrollFreeDto {
    // courseId: number;
}

export interface CheckoutDto {
  courseId: number;
}

export interface CheckoutResponseDto {
  paymentId: number;
  checkoutUrl: string;
}

export interface EnrollmentDto {
  id: number;
  courseId: number;
  courseTitle: string;
  courseCover?: string;
  type: 'Free' | 'Purchase' | 'Gift';
  status: 'Active' | 'Expired' | 'Cancelled';
  enrolledAt: string;
}

export interface PaymentDto {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  reference?: string;
  paidAt?: string;
  courseTitle?: string;
}

export interface CashPaymentDto {
  studentId: string;
  courseId: number;
  amount: number;
  currency: string;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}