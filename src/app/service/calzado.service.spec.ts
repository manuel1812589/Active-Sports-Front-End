import { TestBed } from '@angular/core/testing';

import { CalzadoService } from './calzado.service';

describe('CalzadoService', () => {
  let service: CalzadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalzadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
