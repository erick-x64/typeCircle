import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontDropdownComponent } from './font-dropdown.component';

describe('FontDropdownComponent', () => {
  let component: FontDropdownComponent;
  let fixture: ComponentFixture<FontDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FontDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FontDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
