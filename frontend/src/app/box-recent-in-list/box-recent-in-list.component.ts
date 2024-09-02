import { Component, Input, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import anime from 'animejs';

interface CanvaFile {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
}

@Component({
  selector: 'app-box-recent-in-list',
  templateUrl: './box-recent-in-list.component.html',
  styleUrl: './box-recent-in-list.component.css'
})
export class BoxRecentInListComponent {
  constructor(private localStorageService: LocalStorageService) { }
  @ViewChild('boxRecentList') boxRecentList!: ElementRef;

  @Output() deleteBoxRecent = new EventEmitter<number>();
  @Output() openProject = new EventEmitter<number>();
  @Output() changeName = new EventEmitter<{ index: number, input: string }>();

  @Input() canvaFile?: CanvaFile;
  @Input() nameProject?: string;
  @Input() creationDate?: string;
  @Input() modificationDate?: string;
  @Input() index?: number;

  imageSrc: string = "";
  totalImage: number = 1;

  creationOnlyDate: string = "";
  creationOnlyHour: string = "";

  modificationOnlyDate: string = "";
  modificationOnlyHour: string = "";

  ngOnInit() {
    // get total and src
    if (this.canvaFile && Array.isArray(this.canvaFile.canvas)) {
      const imageUrl = this.canvaFile.base64Image[this.canvaFile.selectFile];
      this.imageSrc = imageUrl;
      this.totalImage = this.canvaFile.canvas.length;
    }

    // get date
    const contentCreationDate = this.creationDate?.split(" ");
    const contentModificationDate = this.modificationDate?.split(" ");

    this.creationOnlyDate = contentCreationDate![0];
    this.creationOnlyHour = contentCreationDate![1];

    this.modificationOnlyDate = contentModificationDate![0];
    this.modificationOnlyHour = contentModificationDate![1];
  }

  // focus in input
  isFocusedInput: boolean = false;
  onFocusInput() {
    this.isFocusedInput = true;
  }

  onBlurInput() {
    this.isFocusedInput = false;
  }

  // event click
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

  // event change
  changeInput(event: Event) {
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
      targets: this.boxRecentList.nativeElement,
      opacity: [1, 0],
      translateY: -10,
      duration: 150,
      easing: 'easeOutQuart',
      delay: 50,
      complete: () => {
        this.deleteBoxRecent.emit(this.index!);
      }
    });
  }
}
