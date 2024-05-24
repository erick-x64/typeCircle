import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigFontBoxComponent } from './config-font-box.component';

describe('ConfigFontBoxComponent', () => {
  let component: ConfigFontBoxComponent;
  let fixture: ComponentFixture<ConfigFontBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigFontBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigFontBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
