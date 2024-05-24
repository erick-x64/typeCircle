import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxAiComponent } from './box-ai.component';

describe('BoxAiComponent', () => {
  let component: BoxAiComponent;
  let fixture: ComponentFixture<BoxAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxAiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
