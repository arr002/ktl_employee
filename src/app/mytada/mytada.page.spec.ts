import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MytadaPage } from './mytada.page';

describe('MytadaPage', () => {
  let component: MytadaPage;
  let fixture: ComponentFixture<MytadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MytadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
