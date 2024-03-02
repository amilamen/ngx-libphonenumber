import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxLibphonenumberComponent } from './ngx-libphonenumber.component';

describe('NgxLibphonenumberComponent', () => {
  let component: NgxLibphonenumberComponent;
  let fixture: ComponentFixture<NgxLibphonenumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxLibphonenumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxLibphonenumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
