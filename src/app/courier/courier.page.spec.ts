import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourierPage } from './courier.page';

describe('CourierPage', () => {
  let component: CourierPage;
  let fixture: ComponentFixture<CourierPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
