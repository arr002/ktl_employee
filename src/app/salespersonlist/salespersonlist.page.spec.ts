import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalespersonlistPage } from './salespersonlist.page';

describe('SalespersonlistPage', () => {
  let component: SalespersonlistPage;
  let fixture: ComponentFixture<SalespersonlistPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SalespersonlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
