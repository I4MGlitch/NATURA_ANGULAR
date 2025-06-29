import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonDashboardPageComponent } from './carbon-dashboard-page.component';

describe('CarbonDashboardPageComponent', () => {
  let component: CarbonDashboardPageComponent;
  let fixture: ComponentFixture<CarbonDashboardPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CarbonDashboardPageComponent]
    });
    fixture = TestBed.createComponent(CarbonDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
