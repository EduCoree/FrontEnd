import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterDelete } from './center-delete';

describe('CenterDelete', () => {
  let component: CenterDelete;
  let fixture: ComponentFixture<CenterDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
