import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientdashboardPage } from './clientdashboard.page';

describe('ClientdashboardPage', () => {
  let component: ClientdashboardPage;
  let fixture: ComponentFixture<ClientdashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientdashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
