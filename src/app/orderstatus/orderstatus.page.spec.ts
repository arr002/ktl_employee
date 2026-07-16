import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderstatusPage } from './orderstatus.page';

describe('OrderstatusPage', () => {
  let component: OrderstatusPage;
  let fixture: ComponentFixture<OrderstatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderstatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
