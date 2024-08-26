import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxSlideTranslateComponent } from './box-slide-translate.component';

describe('BoxSlideTranslateComponent', () => {
  let component: BoxSlideTranslateComponent;
  let fixture: ComponentFixture<BoxSlideTranslateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxSlideTranslateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxSlideTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
