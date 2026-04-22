import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableQuizzes } from './available-quizzes';

describe('AvailableQuizzes', () => {
  let component: AvailableQuizzes;
  let fixture: ComponentFixture<AvailableQuizzes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableQuizzes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableQuizzes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
