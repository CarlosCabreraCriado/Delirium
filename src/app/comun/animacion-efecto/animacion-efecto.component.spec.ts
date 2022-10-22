import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnimacionEfectoComponent } from './animacion-efecto.component';

describe('AnimacionEfectoComponent', () => {
  let component: AnimacionEfectoComponent;
  let fixture: ComponentFixture<AnimacionEfectoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimacionEfectoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimacionEfectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
