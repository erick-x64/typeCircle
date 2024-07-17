import { Component, Input } from '@angular/core';
import anime from 'animejs';

@Component({
  selector: 'app-box-translate',
  templateUrl: './box-translate.component.html',
  styleUrl: './box-translate.component.css'
})
export class BoxTranslateComponent {
  @Input() index: number = 0;

  ngOnInit(): void {
    anime({
      targets: ".box-translate",
      opacity: [0, 1],
      translateY: [-30, 0],
      duration: 150,
      easing: 'easeInOutQuad'
    });
  }

  initTranslate() {
    console.log(this.index);
  }
}
