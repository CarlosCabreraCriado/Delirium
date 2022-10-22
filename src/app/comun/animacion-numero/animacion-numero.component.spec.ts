import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnimacionNumeroComponent } from './animacion-numero.component';

describe('AnimacionNumeroComponent', () => {
  let component: AnimacionNumeroComponent;
  let fixture: ComponentFixture<AnimacionNumeroComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimacionNumeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimacionNumeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
