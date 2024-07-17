import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxTranslateComponent } from './box-translate.component';

describe('BoxTranslateComponent', () => {
  let component: BoxTranslateComponent;
  let fixture: ComponentFixture<BoxTranslateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxTranslateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
