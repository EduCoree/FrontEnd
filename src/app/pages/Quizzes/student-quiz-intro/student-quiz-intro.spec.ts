import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuizIntro } from './student-quiz-intro';

describe('StudentQuizIntro', () => {
  let component: StudentQuizIntro;
  let fixture: ComponentFixture<StudentQuizIntro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentQuizIntro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentQuizIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
