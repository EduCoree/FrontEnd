import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.css'],
})
export class PaymentFailedComponent {
  courseId = '';

  constructor(private route: ActivatedRoute) {
    this.courseId = this.route.snapshot.queryParams['courseId'] ?? '';
  }
}