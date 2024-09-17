import { Component, Input, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { take } from 'rxjs/operators';
import anime from 'animejs';

@Component({
  selector: 'app-table-translate-and-ocr',
  templateUrl: './table-translate-and-ocr.component.html',
  styleUrl: './table-translate-and-ocr.component.css'
})
export class TableTranslateAndOcrComponent {

  constructor(private el: ElementRef,
    private dataService: DataService,
  ) { }

  @Input() indexRect: number = 0;
  @Input() langInput: string | undefined;
  @Input() langOutput: string | undefined;

  ngOnInit() {
    this.observeDOMChanges();

    this.dataService['subjects'].canvas.translation.subscribe(data => {
      if (data.dataTranslations[this.indexRect] != undefined) {
        this.isSelectOptionOcr = true;
        this.isSelectOptionTranslateAi = true;

        this.inputOcr = data.dataTranslations[this.indexRect].text;
        this.outputTranslate = data.dataTranslations[this.indexRect].textTranslate;
      } else {
        this.isSelectOptionOcr = false;
        this.isSelectOptionTranslateAi = false;

        this.inputOcr = "";
        this.outputTranslate = "";
      }
    });
  }

  observeDOMChanges(): void {
    const observer = new MutationObserver(() => {
      this.animateBalls();
    });

    observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
    });
  }

  inputOcr: string = "";
  outputTranslate: string = "";

  isSelectOptionOcr: boolean = false;
  loadingOptionOcr: boolean = false;
  isSelectOptionTranslateAi: boolean = false;
  loadingOptionTranslateAi: boolean = false;

  sendOCR() {
    this.loadingOptionOcr = true;
    this.dataService.requestOcrRect(this.indexRect, this.langInput!);

    this.dataService['subjects'].ocr.requestOcrRectComplete.pipe(take(1)).subscribe(data => {
      this.inputOcr = data.ocrString;
      this.loadingOptionOcr = false;
      this.isSelectOptionOcr = true;
    });
  }

  sendReplacement() {
    this.dataService.requestReplacement(this.indexRect, this.inputOcr, this.outputTranslate);
  }

  onInputFocus() {
    this.dataService.inputFocusTableTraslate(this.indexRect);
  }

  backOcrManual() {
    this.isSelectOptionOcr = false;
  }

  backTranslateManual() {
    this.isSelectOptionTranslateAi = false;
    this.dataService.returnToPreviousState(this.indexRect);
  }

  selectManual1() {
    this.isSelectOptionOcr = true;
  }

  selectManual2() {
    this.isSelectOptionTranslateAi = true;
  }

  animateBalls(): void {
    const loadings = this.el.nativeElement.querySelectorAll('.loading');
    loadings.forEach((loading: HTMLElement) => {
      const balls = loading.querySelectorAll('.ball-loading');
      anime({
        targets: balls,
        backgroundColor: [
          { value: '#434343', duration: 300, delay: anime.stagger(100, { start: 0 }) },
          { value: '#2D2D2D', duration: 300, delay: anime.stagger(100, { start: 300 }) },
        ],
        loop: true,
        easing: 'linear'
      });
    });
  }

}
