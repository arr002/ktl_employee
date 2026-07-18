import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuddyattendancePage } from './buddyattendance.page';

describe('BuddyattendancePage', () => {
  let component: BuddyattendancePage;
  let fixture: ComponentFixture<BuddyattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuddyattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
