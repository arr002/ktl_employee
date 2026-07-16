import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditattendancePage } from './editattendance.page';

describe('EditattendancePage', () => {
  let component: EditattendancePage;
  let fixture: ComponentFixture<EditattendancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditattendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
