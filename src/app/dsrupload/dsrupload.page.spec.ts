import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsruploadPage } from './dsrupload.page';

describe('DsruploadPage', () => {
  let component: DsruploadPage;
  let fixture: ComponentFixture<DsruploadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DsruploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
