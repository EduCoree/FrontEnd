import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit {
  courseTitle = '';
  isPaymentFromCard = false;
  isFreeEnrollment = false;
  showAutoRedirectMessage = false;
  countdownSeconds = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseTitle = this.route.snapshot.queryParams['courseTitle'] ?? 'your course';
    this.isFreeEnrollment = this.route.snapshot.queryParams['isFree'] === 'true';
    
    // إذا كان من Card payment أو بدون courseTitle
    this.isPaymentFromCard = 
      this.route.snapshot.queryParams['fromCard'] === 'true' || 
      (!this.courseTitle || this.courseTitle === 'your course') && !this.isFreeEnrollment;

    // Auto redirect logic
    if (this.isPaymentFromCard) {
      // 🏃 Card Payment: روح مباشرة بسرعة (2.5 ثانية)
      setTimeout(() => {
        this.router.navigate(['/student/my-courses']);
      }, 2500);
    } else if (this.isFreeEnrollment) {
      // 📚 Free Enrollment: اعرض success message و عد من 10 إلى 1
      this.showAutoRedirectMessage = true;
      const countdownInterval = setInterval(() => {
        this.countdownSeconds--;
        if (this.countdownSeconds === 0) {
          clearInterval(countdownInterval);
          this.router.navigate(['/student/my-courses']);
        }
      }, 1000);
    }
  }

  goToMyCourses(): void {
    this.router.navigate(['/student/my-courses']);
  }
}