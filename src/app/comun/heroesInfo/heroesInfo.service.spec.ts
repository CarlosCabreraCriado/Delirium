import { TestBed } from '@angular/core/testing';

import { HeroesInfoService } from './heroesInfo.service';

describe('HeroesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(HeroesInfoService);
    expect(service).toBeTruthy();
  });
});
