import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementFileBoxComponent } from './element-file-box.component';

describe('ElementFileBoxComponent', () => {
  let component: ElementFileBoxComponent;
  let fixture: ComponentFixture<ElementFileBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElementFileBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ElementFileBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
