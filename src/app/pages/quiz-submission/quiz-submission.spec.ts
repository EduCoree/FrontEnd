import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSubmission } from './quiz-submission';

describe('QuizSubmission', () => {
  let component: QuizSubmission;
  let fixture: ComponentFixture<QuizSubmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizSubmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizSubmission);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
