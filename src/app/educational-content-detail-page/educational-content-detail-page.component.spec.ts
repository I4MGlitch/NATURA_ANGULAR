import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationalContentDetailPageComponent } from './educational-content-detail-page.component';

describe('EducationalContentDetailPageComponent', () => {
  let component: EducationalContentDetailPageComponent;
  let fixture: ComponentFixture<EducationalContentDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EducationalContentDetailPageComponent]
    });
    fixture = TestBed.createComponent(EducationalContentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
