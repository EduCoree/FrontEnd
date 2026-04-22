import { Component, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseDetailDto} from '../../../core/models/course';

@Component({
  selector: 'app-enrollment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment-modal.component.html',
})
export class EnrollmentModalComponent {
  @Input() course!: CourseDetailDto;
  @Output() closed = new EventEmitter<void>();

  private enrollmentService = inject(EnrollmentService);
  private router = inject(Router);

  isLoading = false;
  errorMsg = '';
  showCashContact = false;

  // Replace these with your actual admin contact numbers
  adminPhone = '+201092046113';
  adminWhatsApp = '201092046113';
  adminWhatsAppMessage = 'Hello, I want to complete cash payment for my course.';

  get isFree(): boolean {
    return this.course.pricingType === 'Free';
  }

  enrollFree(): void {
    this.isLoading = true;
    this.errorMsg = '';
    
    this.enrollmentService.enrollFree(this.course.id).subscribe({
      next: () => {
        // ✅ Close modal first
        this.close();
        
        // 🚀 Navigate to success page with auto-redirect
        this.router.navigate(['/payment/success'], {
          queryParams: { 
            courseTitle: this.course.title,
            isFree: 'true'  // Add flag to know it's free
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message ?? "Registration failed. Please try again.";
        this.errorMsg = errorMessage;
        
        // ✅ إذا المستخدم مسجل بالفعل - روح لـ my-courses
        if (errorMessage.includes('مشترك') || errorMessage.includes('enrolled')) {
          setTimeout(() => {
            this.close();
            this.router.navigate(['/student/my-courses']);
          }, 2000);
        }
        
        console.error('❌ Free Enrollment Error:', errorMessage);
      }
    });
  }

  payWithCard(): void {
    this.isLoading = true;
    this.errorMsg = '';
    
    this.enrollmentService.createCheckout({ courseId: this.course.id }).subscribe({
      next: (res) => {
        window.location.href = res.data.checkoutUrl;
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err?.error?.message ?? "Failed to create payment link. Please try again.";
        this.errorMsg = errorMessage;
        
        // ✅ إذا المستخدم مسجل بالفعل
        if (errorMessage.includes('مشترك') || errorMessage.includes('enrolled')) {
          setTimeout(() => {
            this.close();
            this.router.navigate(['/student/my-courses']);
          }, 2000);
        }
        
        console.error('❌ Card Checkout Error:', errorMessage);
      }
    });
  }

  toggleCashContact(): void {
    this.showCashContact = !this.showCashContact;
  }

  openWhatsApp(): void {
    const url = `https://api.whatsapp.com/send?phone=${this.adminWhatsApp}&text=${encodeURIComponent(this.adminWhatsAppMessage)}`;
    window.open(url, '_blank');
  }

  callAdmin(): void {
    window.location.href = `tel:${this.adminPhone}`;
  }

  close(): void {
    this.closed.emit();
  }
}