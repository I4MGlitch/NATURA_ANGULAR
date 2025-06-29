import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogregPageComponent } from './logreg-page.component';

describe('LogregPageComponent', () => {
  let component: LogregPageComponent;
  let fixture: ComponentFixture<LogregPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogregPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LogregPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should activate sign-up panel', () => {
    component.setActive(true);
    expect(component.isActive).toBeTrue();
  });

  it('should activate sign-in panel', () => {
    component.setActive(false);
    expect(component.isActive).toBeFalse();
  });
});
