import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import anime from 'animejs';

interface CanvaFile {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
}

@Component({
  selector: 'app-box-recent',
  templateUrl: './box-recent.component.html',
  styleUrl: './box-recent.component.css'
})

export class BoxRecentComponent {
  @ViewChild('boxRecent') boxRecent!: ElementRef;

  constructor(private localStorageService: LocalStorageService) { }

  @Output() deleteBoxRecent = new EventEmitter<number>();
  @Output() openProject = new EventEmitter<number>();
  @Output() changeName = new EventEmitter<{ index: number, input: string }>();

  @Input() canvaFile?: CanvaFile;
  @Input() index?: number;
  @Input() nameProject?: string;
  @Input() creationDate?: string;
  @Input() modificationDate?: string;

  imageSrc: string = "";
  totalImage: number = 1;

  ngOnInit() {
    if (this.canvaFile && Array.isArray(this.canvaFile.canvas)) {
      const imageUrl = this.canvaFile.base64Image[this.canvaFile.selectFile];
      this.imageSrc = imageUrl;
      this.totalImage = this.canvaFile.canvas.length;
    }
  }

  onBoxClick() {
    this.openProject.emit(this.index!);
  }

  onTitleClick(event: Event) {
    event.stopPropagation();
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.initAnimationDelete();
  }

  onChangeInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const currentValue = inputElement.value;
    this.nameProject = currentValue;
    this.changeName.emit({ index: this.index!, input: currentValue });

    // save
    this.localStorageService.changeNameProject(this.index!, currentValue);
  }

  // animation
  initAnimationDelete() {
    anime({
      targets: this.boxRecent.nativeElement,
      opacity: [1, 0],
      scale: [1, 0.8],
      duration: 100,
      easing: 'easeOutQuart',
      complete: () => {
        this.deleteBoxRecent.emit(this.index!);
      }
    });
  }
}
