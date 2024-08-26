import { Component } from '@angular/core';
import { SaveService } from '../save.service';
import anime from 'animejs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-box-slide-translate',
  templateUrl: './box-slide-translate.component.html',
  styleUrl: './box-slide-translate.component.css'
})
export class BoxSlideTranslateComponent {

  langInput: string = "eng";
  langOutput: string = "jpn_vert";
  
  isOpen: boolean = false;
  animationComplete: boolean = true;
  keepOpen: boolean = false;
  rects: fabric.Rect[] = [];

  private subscription!: Subscription;

  constructor(private saveService: SaveService) { }

  ngOnInit() {
    this.subscription = this.saveService.rects$.subscribe((rects: fabric.Rect[]) => {
      this.rects = rects;
    });    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openBox() {
    if (this.animationComplete) {
      this.animationComplete = false;
      if (this.isOpen) {
        this.isOpen = false;
        this.animateOpacity(true);
        this.animateRotation(true);
        this.animateHeight(true);
      } else {
        this.isOpen = true;
        this.animateOpacity(false);
        this.animateRotation(false);
        this.animateHeight(false);
      }
    }
  }

  // auxiliary functions
  animateHeight(reverse: boolean) {
    anime({
      targets: '#boxSlideTranslate',
      height: reverse ? ['172.2px', '40px'] : ['40px', '172.2px'],
      duration: 300,
      easing: 'easeOutQuart',
      complete: () => {
        this.animationComplete = true;
      },
    });
  }

  animateRotation(reverse: boolean) {
    anime({
      targets: '#imgArrow',
      rotate: reverse ? ['0.5turn', '0turn'] : ['0turn', '0.5turn'],
      duration: 100,
      easing: 'easeOutQuart',
    });
  }

  animateOpacity(reverse: boolean) {
    anime({
      targets: '#choiceLanguage',
      opacity: reverse ? ['1', '0'] : ['0', '1'],
      duration: 100,
      easing: 'easeOutQuart',
    });
  }
}
