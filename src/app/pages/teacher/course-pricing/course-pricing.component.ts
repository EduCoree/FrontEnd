import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course';

@Component({
  selector: 'app-course-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-pricing.component.html',
  styleUrl: './course-pricing.component.css'
})
export class CoursePricingComponent implements OnInit {

  courseId!: number;
  isLoading = signal(false);
  isPublishing = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  pricingTypes = ['Free', 'Paid', 'Subscription'];

  pricingForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
public router: Router,
    private courseService: CourseService,
    private fb: FormBuilder
  ) {
    this.pricingForm = this.fb.group({
      pricingType: ['Free', Validators.required],
      price: [0],
      discountedPrice: [null]
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourse();
  }

  loadCourse(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (res: any) => {
        const course = res.data;
        this.pricingForm.patchValue({
          pricingType: course.pricingType,
          price: course.price,
          discountedPrice: course.discountedPrice
        });
      }
    });
  }

  savePricing(): void {
    this.isLoading.set(true);
    this.courseService.updatePricing(this.courseId, this.pricingForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Pricing saved!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  publishAndFinish(): void {
    this.isPublishing.set(true);
    // save pricing
    this.courseService.updatePricing(this.courseId, this.pricingForm.value).subscribe({
      next: () => {
        // then publish the course
        this.courseService.publishCourse(this.courseId).subscribe({
          next: () => {
            this.isPublishing.set(false);
            this.successMessage.set('Course published successfully! 🎉');
            setTimeout(() => {
              this.router.navigate(['/teacher/dashboard']);
            }, 2000);
          },
          error: () => { this.isPublishing.set(false); }
        });
      },
      error: () => { this.isPublishing.set(false); }
    });
  }

  saveDraft(): void {
    this.courseService.updatePricing(this.courseId, this.pricingForm.value).subscribe({
      next: () => this.router.navigate(['/teacher/dashboard'])
    });
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'media']);
  }

  goToDashboard(): void {
    this.router.navigate(['/teacher/dashboard']);
  }

  getEarnings(): number {
    const price = this.pricingForm.get('price')?.value || 0;
    return Math.round(price * 0.85 * 100) / 100;
  }

  getPlatformFee(): number {
    const price = this.pricingForm.get('price')?.value || 0;
    return Math.round(price * 0.15 * 100) / 100;
  }
  goToStep(step: number): void {
  switch(step) {
    case 1:
      this.router.navigate(['/teacher/courses/create']);
      break;
    case 2:
      this.router.navigate(['/teacher/courses', this.courseId, 'sections']);
      break;
    case 3:
      this.router.navigate(['/teacher/courses', this.courseId, 'media']);
      break;
  }
}
}