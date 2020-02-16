import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimacionEfectoComponent } from './animacion-efecto.component';

describe('AnimacionEfectoComponent', () => {
  let component: AnimacionEfectoComponent;
  let fixture: ComponentFixture<AnimacionEfectoComponent>;

  beforeEach(async(() => {
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
