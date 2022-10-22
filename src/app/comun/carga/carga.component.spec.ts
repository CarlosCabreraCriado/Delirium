import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CargaComponent } from './carga.component';

describe('CargaComponent', () => {
  let component: CargaComponent;
  let fixture: ComponentFixture<CargaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CargaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
