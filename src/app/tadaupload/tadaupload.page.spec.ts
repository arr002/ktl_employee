import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TadauploadPage } from './tadaupload.page';

describe('TadauploadPage', () => {
  let component: TadauploadPage;
  let fixture: ComponentFixture<TadauploadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TadauploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
