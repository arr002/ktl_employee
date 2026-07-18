import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TadapopupPage } from './tadapopup.page';

describe('TadapopupPage', () => {
  let component: TadapopupPage;
  let fixture: ComponentFixture<TadapopupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TadapopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
