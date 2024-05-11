import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileBoxComponent } from './file-box.component';

describe('FileBoxComponent', () => {
  let component: FileBoxComponent;
  let fixture: ComponentFixture<FileBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
