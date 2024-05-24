import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxEntryTextComponent } from './box-entry-text.component';

describe('BoxEntryTextComponent', () => {
  let component: BoxEntryTextComponent;
  let fixture: ComponentFixture<BoxEntryTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxEntryTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxEntryTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
