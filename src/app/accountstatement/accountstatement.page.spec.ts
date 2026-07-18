import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountstatementPage } from './accountstatement.page';

describe('AccountstatementPage', () => {
  let component: AccountstatementPage;
  let fixture: ComponentFixture<AccountstatementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountstatementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
