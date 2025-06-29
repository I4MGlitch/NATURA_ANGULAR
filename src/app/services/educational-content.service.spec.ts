import { TestBed } from '@angular/core/testing';

import { EducationalContentService } from './educational-content.service';

describe('EducationalContentService', () => {
  let service: EducationalContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EducationalContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
