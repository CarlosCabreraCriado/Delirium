import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RngComponent } from './rng.component';

describe('RngComponent', () => {
  let component: RngComponent;
  let fixture: ComponentFixture<RngComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RngComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
