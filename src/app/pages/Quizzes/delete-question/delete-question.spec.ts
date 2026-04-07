import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteQuestion } from './delete-question';

describe('DeleteQuestion', () => {
  let component: DeleteQuestion;
  let fixture: ComponentFixture<DeleteQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
