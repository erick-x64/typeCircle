import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxRecentComponent } from './box-recent.component';

describe('BoxRecentComponent', () => {
  let component: BoxRecentComponent;
  let fixture: ComponentFixture<BoxRecentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxRecentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxRecentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
