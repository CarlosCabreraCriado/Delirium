import { TestBed } from '@angular/core/testing';

import { DesarrolladorService } from './desarrollador.service';

describe('DesarrolladorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DesarrolladorService = TestBed.get(DesarrolladorService);
    expect(service).toBeTruthy();
  });
});
