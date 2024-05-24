import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvaElementComponent } from './canva-element.component';

describe('CanvaElementComponent', () => {
  let component: CanvaElementComponent;
  let fixture: ComponentFixture<CanvaElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvaElementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CanvaElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
