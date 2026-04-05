import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterLogo } from './center-logo';

describe('CenterLogo', () => {
  let component: CenterLogo;
  let fixture: ComponentFixture<CenterLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
