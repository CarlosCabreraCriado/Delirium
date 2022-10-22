import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarcoClaseComponent } from './marco-clase.component';

describe('MarcoClaseComponent', () => {
  let component: MarcoClaseComponent;
  let fixture: ComponentFixture<MarcoClaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarcoClaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcoClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
