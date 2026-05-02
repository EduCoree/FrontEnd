import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JitsiPlayer } from './jitsi-player';

describe('JitsiPlayer', () => {
  let component: JitsiPlayer;
  let fixture: ComponentFixture<JitsiPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JitsiPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JitsiPlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
