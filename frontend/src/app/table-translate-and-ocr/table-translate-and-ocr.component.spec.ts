import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableTranslateAndOcrComponent } from './table-translate-and-ocr.component';

describe('TableTranslateAndOcrComponent', () => {
  let component: TableTranslateAndOcrComponent;
  let fixture: ComponentFixture<TableTranslateAndOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableTranslateAndOcrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableTranslateAndOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
