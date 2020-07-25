import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustesComponent } from './ajustes.component';

describe('BugLogComponent', () => {
  let component: AjustesComponent;
  let fixture: ComponentFixture<AjustesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjustesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjustesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
