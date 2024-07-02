import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCanvaComponent } from './dashboard-canva.component';

describe('DashboardCanvaComponent', () => {
  let component: DashboardCanvaComponent;
  let fixture: ComponentFixture<DashboardCanvaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardCanvaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardCanvaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
