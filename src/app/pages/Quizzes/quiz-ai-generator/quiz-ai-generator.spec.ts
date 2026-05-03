import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAiGenerator } from './quiz-ai-generator';

describe('QuizAiGenerator', () => {
  let component: QuizAiGenerator;
  let fixture: ComponentFixture<QuizAiGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAiGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAiGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
