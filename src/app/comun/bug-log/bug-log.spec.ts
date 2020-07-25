import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BugLogComponent } from './bug-log.component';

describe('BugLogComponent', () => {
  let component: BugLogComponent;
  let fixture: ComponentFixture<BugLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BugLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BugLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
