import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterEdit } from './center-edit';

describe('CenterEdit', () => {
  let component: CenterEdit;
  let fixture: ComponentFixture<CenterEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
