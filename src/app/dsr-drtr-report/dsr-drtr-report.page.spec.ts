import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsrDrtrReportPage } from './dsr-drtr-report.page';

describe('DsrDrtrReportPage', () => {
  let component: DsrDrtrReportPage;
  let fixture: ComponentFixture<DsrDrtrReportPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DsrDrtrReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
