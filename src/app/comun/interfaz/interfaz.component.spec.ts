
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfazComponent } from './interfaz.component';

describe('InterfazComponent', () => {
  let component: InterfazComponent;
  let fixture: ComponentFixture<InterfazComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterfazComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterfazComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
