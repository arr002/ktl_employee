import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TownPage } from './town.page';

describe('TownPage', () => {
  let component: TownPage;
  let fixture: ComponentFixture<TownPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TownPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
