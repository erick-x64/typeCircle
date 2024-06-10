import { Component } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-other-tools',
  templateUrl: './other-tools.component.html',
  styleUrl: './other-tools.component.css'
})
export class OtherToolsComponent {
  private debouncedSendColorToCanva: (isEnable: boolean, colorReplace: string) => void;

  constructor(private dataService: DataService) {
    this.debouncedSendColorToCanva = this.debounce((isEnable: boolean, colorReplace: string) => {
      this.sendToCanvaEnableOrDisableDrawing(isEnable, colorReplace);
    }, 300);
  }

  colorReplace: string = "";
  enableDrawing: boolean = false;
  private count: number = 0

  enableDrawingRect() {
    this.count++;

    if (this.count == 1) {
      this.enableDrawing = true;
    } else if (this.count == 2) {
      this.count = 0;
      this.enableDrawing = false;
    }

    this.sendToCanvaEnableOrDisableDrawing(this.enableDrawing, this.colorReplace);
  }

  sendRemoveAreaSelect() {
    this.dataService.sendRemoveAreaSelect();
  }

  sendBackAreaSelect() {
    this.dataService.sendBackAreaSelect();
  }

  onColorChange(color: string) {
    this.colorReplace = color;
    this.debouncedSendColorToCanva(this.enableDrawing, this.colorReplace);
  }

  changeColorFont() {
    const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (!hexRegex.test(this.colorReplace)) {
      this.colorReplace = "";
    }
    this.sendToCanvaEnableOrDisableDrawing(this.enableDrawing, this.colorReplace);
  }

  private debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: number | undefined;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  private sendToCanvaEnableOrDisableDrawing(isEnable: boolean, colorReplace: string) {    
    this.dataService.enableDrawingRect(isEnable, colorReplace);
  }
}
