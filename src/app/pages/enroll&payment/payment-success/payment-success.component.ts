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
  
  this.isPaymentFromCard = 
    this.route.snapshot.queryParams['fromCard'] === 'true' || 
    ((!this.courseTitle || this.courseTitle === 'your course') && !this.isFreeEnrollment);

  if (this.isPaymentFromCard) {
  setTimeout(() => {
    const user = localStorage.getItem('user');
    if (user) {
      this.router.navigate(['/student/my-courses']);
    } else {
      this.router.navigate(['/login']);
    }
  }, 2500);
}
}

  goToMyCourses(): void {
    this.router.navigate(['/student/my-courses']);
  }
}