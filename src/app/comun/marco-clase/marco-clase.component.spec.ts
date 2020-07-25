import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcoClaseComponent } from './marco-clase.component';

describe('MarcoClaseComponent', () => {
  let component: MarcoClaseComponent;
  let fixture: ComponentFixture<MarcoClaseComponent>;

  beforeEach(async(() => {
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
