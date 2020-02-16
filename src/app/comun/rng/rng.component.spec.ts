import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RngComponent } from './rng.component';

describe('RngComponent', () => {
  let component: RngComponent;
  let fixture: ComponentFixture<RngComponent>;

  beforeEach(async(() => {
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
