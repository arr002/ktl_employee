import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsetclientPage } from './newsetclient.page';

describe('NewsetclientPage', () => {
  let component: NewsetclientPage;
  let fixture: ComponentFixture<NewsetclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsetclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
