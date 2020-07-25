import { TestBed } from '@angular/core/testing';

import { UnirsePartidaService } from './unirsePartida.service';

describe('HeroesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(UnirsePartidaService);
    expect(service).toBeTruthy();
  });
});
