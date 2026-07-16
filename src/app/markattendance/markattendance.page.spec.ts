import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkattendancePage } from './markattendance.page';

describe('MarkattendancePage', () => {
  let component: MarkattendancePage;
  let fixture: ComponentFixture<MarkattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
