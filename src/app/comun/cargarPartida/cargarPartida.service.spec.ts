import { TestBed } from '@angular/core/testing';

import { CargarPartidaService } from './cargarPartida.service';

describe('SalaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(CargarPartidaService);
    expect(service).toBeTruthy();
  });
});
