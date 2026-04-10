import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSidebar } from './course-sidebar';

describe('CourseSidebar', () => {
  let component: CourseSidebar;
  let fixture: ComponentFixture<CourseSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
