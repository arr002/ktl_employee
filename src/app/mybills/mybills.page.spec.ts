import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MybillsPage } from './mybills.page';

describe('MybillsPage', () => {
  let component: MybillsPage;
  let fixture: ComponentFixture<MybillsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MybillsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
