import { Component } from '@angular/core';
import { DataService } from '../data.service';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-box-ai',
  templateUrl: './box-ai.component.html',
  styleUrl: './box-ai.component.css'
})
export class BoxAiComponent {
  constructor(private dataService: DataService) { }
  private animation: any;

  average_score: string = "";
  quantityFound: number = 0;

  requestIdentification() {
    this.resetAnimationTopObjects();
    this.startAnimationGradient();

    this.dataService.requestIdentification();

    // operation identification complete
    this.dataService.operationIdentificationComplete$.subscribe((data) => {
      const primeirosDoisDigitos = data.average_score.toString().slice(0, 2);
      this.average_score = primeirosDoisDigitos;

      this.quantityFound = data.totalIdentified;

      this.stopAnimationGradient();
      this.startAnimationTopObjects();
    })
  }

  // animation top objects
  startAnimationTopObjects() {
    anime({
      targets: '#infos_Identification',
      top: ['10px', '0px'],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
  };

  resetAnimationTopObjects() {
    anime({
      targets: '#infos_Identification',
      top: '10px',
      opacity: 0,
      duration: 300,
      easing: 'easeInOutQuad'
    });
  }

  // animation gradient
  startAnimationGradient() {
    this.animation = anime({
      targets: '#buttonIdentification',
      easing: 'easeInOutQuad',
      loop: true,
      update: (anim) => {
        const progress = anim.progress / 100;
        const newGradientPosition = 50 + 50 * Math.sin(progress * Math.PI * 2); // Multiplied by 2 for a full wave
        (document.querySelector('#buttonIdentification') as HTMLElement).style.backgroundImage =
          `linear-gradient(to right, #292929, #393939 ${newGradientPosition}%, #292929)`;
      }
    });
  }

  stopAnimationGradient() {
    if (this.animation) {
      this.animation.pause();
      (document.querySelector('#buttonIdentification') as HTMLElement).style.backgroundImage =
        `linear-gradient(to right, #292929, #393939 50%, #292929)`;
    }
  }
}
