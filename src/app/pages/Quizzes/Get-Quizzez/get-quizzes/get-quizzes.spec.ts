import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetQuizzes } from './get-quizzes';

describe('GetQuizzes', () => {
  let component: GetQuizzes;
  let fixture: ComponentFixture<GetQuizzes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetQuizzes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetQuizzes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
