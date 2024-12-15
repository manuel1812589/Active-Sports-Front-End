import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalzadoPresentacionComponent } from './calzado-presentacion.component';

describe('CalzadoPresentacionComponent', () => {
  let component: CalzadoPresentacionComponent;
  let fixture: ComponentFixture<CalzadoPresentacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalzadoPresentacionComponent]
    });
    fixture = TestBed.createComponent(CalzadoPresentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
