import { TestBed } from '@angular/core/testing';

import { IndexService } from './desarrollador.service';

describe('DesarrolladorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexService = TestBed.get(DesarrolladorService);
    expect(service).toBeTruthy();
  });
});
