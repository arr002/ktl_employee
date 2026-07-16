import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetclientPage } from './setclient.page';

describe('SetclientPage', () => {
  let component: SetclientPage;
  let fixture: ComponentFixture<SetclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SetclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
