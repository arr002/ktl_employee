import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllattendancePage } from './allattendance.page';

describe('AllattendancePage', () => {
  let component: AllattendancePage;
  let fixture: ComponentFixture<AllattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
