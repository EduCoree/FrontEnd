import { TestBed } from '@angular/core/testing';

import { QuizAi } from './quiz-ai';

describe('QuizAi', () => {
  let service: QuizAi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizAi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
