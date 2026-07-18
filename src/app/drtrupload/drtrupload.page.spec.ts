import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrtruploadPage } from './drtrupload.page';

describe('DrtruploadPage', () => {
  let component: DrtruploadPage;
  let fixture: ComponentFixture<DrtruploadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DrtruploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
