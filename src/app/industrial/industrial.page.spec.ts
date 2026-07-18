import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndustrialPage } from './industrial.page';

describe('IndustrialPage', () => {
  let component: IndustrialPage;
  let fixture: ComponentFixture<IndustrialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustrialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
