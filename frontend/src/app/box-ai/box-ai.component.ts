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
  recognizedText: string[] = [];

  isChangeToolEnabled = true;
  showOptionsRemoveText = true;
  inProcessRequest = false;
  offsetCircle?: number;
  radiusCircle?: number;

  changeTo = 0;

  constructor(private dataService: DataService) { }

  changeTool(number: number): void {
    if (!this.isChangeToolEnabled) {
      return;
    }
    this.changeTo = number;
  }

  requestIdentification(): void {
    if (!this.inProcessRequest) {
      this.inProcessRequest = true;
      this.showOptionsRemoveText = true;
      this.resetAnimationTopObjects();
      this.startAnimationGradient();

      this.dataService.requestIdentification();

      this.dataService.operationIdentificationComplete$.subscribe((data) => {
        this.inProcessRequest = false;
        const primeirosDoisDigitos = data.average_score.toString().slice(0, 2);
        this.average_score = primeirosDoisDigitos;

        this.quantityFound = data.totalIdentified;

        this.stopAnimationGradient();
        this.startAnimationTopObjects();
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

  requestIdentificationRecognition(): void {
    this.startAnimationGradient();
    this.resetAnimationTopObjects();

    this.dataService.requestIdentificationRecognition();

    this.dataService.operationIdentificationCompleteRecognition$.subscribe((data) => {
      this.recognizedText = data.recognizedText.map(text => text.trim() === '' ? '[empty]' : text.trim());

      this.startAnimationTopObjects();
      this.stopAnimationGradient();
    });
  }

  private startAnimationTopObjects(): void {
    const targetSelector = this.changeTo === 0 ? '#infos_Identification' : '#info_recognition';

    this.animateTarget(targetSelector, ['10px', '0px'], [0, 1]);
  }

  private resetAnimationTopObjects(): void {
    const targetSelector = this.changeTo === 0 ? '#infos_Identification' : '#info_recognition';

    this.animateTarget(targetSelector, '10px', 0);
  }

  private startAnimationGradient(): void {
    this.isChangeToolEnabled = false;
    const targetSelector = this.changeTo === 0 ? '#buttonIdentification' : '#buttonRecognition';

    this.animation = anime({
      targets: targetSelector,
      easing: 'easeInOutQuad',
      loop: true,
      update: (anim) => {
        const progress = anim.progress / 100;
        const newGradientPosition = 50 + 50 * Math.sin(progress * Math.PI * 2);
        this.setGradientBackground(targetSelector, newGradientPosition);
      }
    });
  }

  private stopAnimationGradient(): void {
    const targetSelector = this.changeTo === 0 ? '#buttonIdentification' : '#buttonRecognition';

    if (this.animation) {
      this.animation.pause();
      this.setGradientBackground(targetSelector, 50);
    }

    this.isChangeToolEnabled = true;
  }

  private animateTarget(target: string, property: string | string[], value: any): void {
    anime({
      targets: target,
      top: property,
      opacity: value,
      duration: 300,
      easing: 'easeInOutQuad'
    });
  }

  private setGradientBackground(target: string, position: number): void {
    (document.querySelector(target) as HTMLElement).style.backgroundImage =
      `linear-gradient(to right, #292929, #393939 ${position}%, #292929)`;
  }
}
