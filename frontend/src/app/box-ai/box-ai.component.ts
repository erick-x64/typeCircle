import { Component } from '@angular/core';
import { DataService } from '../data.service';
import anime from 'animejs';

@Component({
  selector: 'app-box-ai',
  templateUrl: './box-ai.component.html',
  styleUrls: ['./box-ai.component.css']
})
export class BoxAiComponent {
  private animation: any;

  average_score = "";
  quantityFound = 0;

  showOptionsRemoveText = true;
  inProcessRequest = false;
  offsetCircle?: number;
  radiusCircle?: number;
  private count: number = 0
  enableOcrBox: boolean = false;

  constructor(private dataService: DataService) { }

  requestIdentification(): void {
    if (!this.inProcessRequest) {
      this.inProcessRequest = true;
      this.showOptionsRemoveText = true;
      this.startAnimationGradient();

      this.dataService.requestIdentification();

      this.dataService.operationIdentificationComplete$.subscribe((data) => {
        this.inProcessRequest = false;
        const primeirosDoisDigitos = data.average_score.toString().slice(0, 2);
        this.average_score = primeirosDoisDigitos;
        this.quantityFound = data.totalIdentified;

        // this.stopAnimationGradient();
      });
    }
  }

  requestRemoveText(): void {
    this.showOptionsRemoveText = false;
    this.offsetCircle = undefined;
    this.radiusCircle = undefined;
    this.dataService.requestRemoveText();
  }

  requestAddBoxText(): void {
    this.dataService.requestAddBoxText();
  }

  requestChangeValuesCircle(): void {
    const offsetCircle = this.offsetCircle ?? 10;
    const radiusCircle = this.radiusCircle ?? 999;

    this.dataService.requestChangeValuesCircle(offsetCircle, radiusCircle);
  }

  enableOcrBoxs() {
    this.count++;

    if (this.count == 1) {
      this.enableOcrBox = true;
    } else if (this.count == 2) {
      this.count = 0;
      this.enableOcrBox = false;
    }

    this.dataService.requestEnableOcrBox(this.enableOcrBox);
  }

  private startAnimationGradient(): void {  
    this.animation = anime({
      targets: "#buttonIdentification",
      easing: 'easeInOutQuad',
      loop: true,
      update: (anim) => {
        if (anim.progress == 100 && !this.inProcessRequest) {
          this.animation.pause();
        }

        const progress = anim.progress / 100;
        const newGradientPosition = 50 + 50 * Math.sin(progress * Math.PI * 2);
        this.setGradientBackground("#buttonIdentification", newGradientPosition);
      }
    });
  }

  private setGradientBackground(target: string, position: number): void {
    (document.querySelector(target) as HTMLElement).style.backgroundImage =
      `linear-gradient(to left, #161616, #202020, ${position}%, #202020, #161616)`;
  }
}
