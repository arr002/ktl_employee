import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttandencePage } from './attandence.page';

describe('AttandencePage', () => {
  let component: AttandencePage;
  let fixture: ComponentFixture<AttandencePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AttandencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
