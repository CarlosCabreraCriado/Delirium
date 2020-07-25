import { TestBed } from '@angular/core/testing';

import { HeroesCrearService } from './heroesCrear.service';

describe('HeroesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(HeroesCrearService);
    expect(service).toBeTruthy();
  });
});
