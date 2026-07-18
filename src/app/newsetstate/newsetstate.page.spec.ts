import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsetstatePage } from './newsetstate.page';

describe('NewsetstatePage', () => {
  let component: NewsetstatePage;
  let fixture: ComponentFixture<NewsetstatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsetstatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
