import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewattendancePage } from './viewattendance.page';

describe('ViewattendancePage', () => {
  let component: ViewattendancePage;
  let fixture: ComponentFixture<ViewattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
