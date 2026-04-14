import { TestBed } from '@angular/core/testing';

import { Answeroption } from './answeroption';

describe('Answeroption', () => {
  let service: Answeroption;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Answeroption);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
