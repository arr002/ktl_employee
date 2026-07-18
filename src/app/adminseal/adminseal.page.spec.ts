import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminsealPage } from './adminseal.page';

describe('AdminsealPage', () => {
  let component: AdminsealPage;
  let fixture: ComponentFixture<AdminsealPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminsealPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
