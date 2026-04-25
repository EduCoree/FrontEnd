//  Payout System Models

// ── Enums ───────────────────────────────────────────────────────────────

export type EarningStatus = 'Pending' | 'Available' | 'Invoiced' | 'Paid' | 'Cancelled';

export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Cancelled';

export type PayoutMethod = 'Cash' | 'BankTransfer' | 'VodafoneCash' | 'InstaPay' | 'Other';


// ── Teacher-facing DTOs ─────────────────────────────────────────────────

export interface TeacherEarningDto {
  id: number;
  courseId: number;
  courseTitle: string;
  grossAmount: number;
  commissionRate: number;
  netAmount: number;
  currency: string;
  earnedAt: string;          // ISO date
  status: EarningStatus;
  invoiceId: number | null;
  invoiceNumber: string | null;
}

export interface CurrentMonthEarningsDto {
  year: number;
  month: number;
  paidEnrollmentsCount: number;
  earningsTotal: number;
  projectedTierBonus: number;
  projectedTotal: number;
  currency: string;
  nextTierThreshold: number | null;
  nextTierBonus: number | null;
  enrollmentsToNextTier: number | null;
}

export interface TeacherEarningsSummaryDto {
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  totalInvoicesCount: number;
  totalPaidEnrollments: number;
  currency: string;
}


// ── Invoice DTOs (shared between Teacher and Admin) ─────────────────────

export interface TeacherInvoiceDto {
  id: number;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  teacherId: string;
  teacherName: string | null;
  paidEnrollmentsCount: number;
  earningsTotal: number;
  tierBonus: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  payoutMethod: PayoutMethod | null;
  payoutReference: string | null;
  createdAt: string;
  issuedAt: string | null;
  paidAt: string | null;
}

export interface TeacherInvoiceDetailDto extends TeacherInvoiceDto {
  notes: string | null;
  earnings: TeacherEarningDto[];
}


// ── Admin-facing DTOs ───────────────────────────────────────────────────

export interface MarkInvoiceAsPaidDto {
  payoutMethod: PayoutMethod;
  payoutReference?: string | null;
  notes?: string | null;
}

export interface CancelInvoiceDto {
  reason: string;
}

export interface GenerateInvoicesResultDto {
  year: number;
  month: number;
  teachersProcessed: number;
  invoicesCreated: number;
  teachersSkipped: number;
  teachersFailed: number;
  totalAmountGenerated: number;
  failedTeacherIds: string[];
  messages: string[];
}

export interface AdminPayoutDashboardDto {
  totalPendingPayouts: number;
  pendingInvoicesCount: number;
  currentMonthTeacherEarnings: number;
  currentMonthPlatformRevenue: number;
  currentMonthPaidEnrollments: number;
  lastMonthPaidToTeachers: number;
  currency: string;
}


// ── Settings DTOs ───────────────────────────────────────────────────────

export interface PayoutSettingsDto {
  teacherCommissionRate: number;
  tier1Threshold: number;
  tier1Bonus: number;
  tier2Threshold: number;
  tier2Bonus: number;
  tier3Threshold: number;
  tier3Bonus: number;
  currency: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface UpdatePayoutSettingsDto {
  teacherCommissionRate: number;
  tier1Threshold: number;
  tier1Bonus: number;
  tier2Threshold: number;
  tier2Bonus: number;
  tier3Threshold: number;
  tier3Bonus: number;
  currency: string;
}


// ── Common shapes from backend ──────────────────────────────────────────

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * The backend wraps responses in ApiResponse<T>.
 * Example: { success: true, data: {...}, message: "..." }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}