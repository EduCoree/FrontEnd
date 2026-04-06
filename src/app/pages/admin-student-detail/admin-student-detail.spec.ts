import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStudentDetailComponent } from './admin-student-detail';

describe('AdminStudentDetailComponent', () => {
  let component: AdminStudentDetailComponent;
  let fixture: ComponentFixture<AdminStudentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStudentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
