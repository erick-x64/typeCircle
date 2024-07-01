import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxRecentInListComponent } from './box-recent-in-list.component';

describe('BoxRecentInListComponent', () => {
  let component: BoxRecentInListComponent;
  let fixture: ComponentFixture<BoxRecentInListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoxRecentInListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoxRecentInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
