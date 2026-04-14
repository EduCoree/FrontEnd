import { TestBed } from '@angular/core/testing';

import { Studentquiz } from './studentquiz';

describe('Studentquiz', () => {
  let service: Studentquiz;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Studentquiz);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
