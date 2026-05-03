import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAiWizard } from './quiz-ai-wizard';

describe('QuizAiWizard', () => {
  let component: QuizAiWizard;
  let fixture: ComponentFixture<QuizAiWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAiWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAiWizard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
