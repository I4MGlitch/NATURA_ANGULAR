import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalActivityDetailPageComponent } from './goal-activity-detail-page.component';

describe('GoalActivityDetailPageComponent', () => {
  let component: GoalActivityDetailPageComponent;
  let fixture: ComponentFixture<GoalActivityDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoalActivityDetailPageComponent]
    });
    fixture = TestBed.createComponent(GoalActivityDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
