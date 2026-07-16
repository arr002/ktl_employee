import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchmanagersPage } from './branchmanagers.page';

describe('BranchmanagersPage', () => {
  let component: BranchmanagersPage;
  let fixture: ComponentFixture<BranchmanagersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchmanagersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
