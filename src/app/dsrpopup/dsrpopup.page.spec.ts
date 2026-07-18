import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsrpopupPage } from './dsrpopup.page';

describe('DsrpopupPage', () => {
  let component: DsrpopupPage;
  let fixture: ComponentFixture<DsrpopupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DsrpopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
