import { TestBed } from '@angular/core/testing';

import { NgxLibphonenumberService } from './ngx-libphonenumber.service';

describe('NgxLibphonenumberService', () => {
  let service: NgxLibphonenumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxLibphonenumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
