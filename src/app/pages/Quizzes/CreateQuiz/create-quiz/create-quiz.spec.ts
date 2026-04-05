import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuiz } from './create-quiz';

describe('CreateQuiz', () => {
  let component: CreateQuiz;
  let fixture: ComponentFixture<CreateQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
