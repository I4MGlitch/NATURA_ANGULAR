import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsPageComponent } from './actions-page.component';

describe('ActionsPageComponent', () => {
  let component: ActionsPageComponent;
  let fixture: ComponentFixture<ActionsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionsPageComponent]
    });
    fixture = TestBed.createComponent(ActionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
