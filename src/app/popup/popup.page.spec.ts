import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupPage } from './popup.page';

describe('PopupPage', () => {
  let component: PopupPage;
  let fixture: ComponentFixture<PopupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
