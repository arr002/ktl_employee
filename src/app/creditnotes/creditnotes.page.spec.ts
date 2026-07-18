import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditnotesPage } from './creditnotes.page';

describe('CreditnotesPage', () => {
  let component: CreditnotesPage;
  let fixture: ComponentFixture<CreditnotesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditnotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
