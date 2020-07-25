import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperToolComponent } from './developer-tool.component';

describe('DeveloperToolComponent', () => {
  let component: DeveloperToolComponent;
  let fixture: ComponentFixture<DeveloperToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeveloperToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeveloperToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
