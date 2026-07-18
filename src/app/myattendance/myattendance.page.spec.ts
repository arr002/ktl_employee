import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyattendancePage } from './myattendance.page';

describe('MyattendancePage', () => {
  let component: MyattendancePage;
  let fixture: ComponentFixture<MyattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
