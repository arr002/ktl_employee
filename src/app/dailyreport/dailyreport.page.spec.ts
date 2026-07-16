import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyreportPage } from './dailyreport.page';

describe('DailyreportPage', () => {
  let component: DailyreportPage;
  let fixture: ComponentFixture<DailyreportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyreportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
