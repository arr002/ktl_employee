import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BanneruploadPage } from './bannerupload.page';

describe('BanneruploadPage', () => {
  let component: BanneruploadPage;
  let fixture: ComponentFixture<BanneruploadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BanneruploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
