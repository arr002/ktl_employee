import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TadaPage } from './tada.page';

describe('TadaPage', () => {
  let component: TadaPage;
  let fixture: ComponentFixture<TadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
