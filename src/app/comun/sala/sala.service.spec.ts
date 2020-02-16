import { TestBed } from '@angular/core/testing';

import { SalaService } from './sala.service';

describe('SalaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(SalaService);
    expect(service).toBeTruthy();
  });
});
