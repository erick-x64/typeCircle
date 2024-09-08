import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import anime from 'animejs';

@Component({
  selector: 'app-dashboard-canva',
  templateUrl: './dashboard-canva.component.html',
  styleUrl: './dashboard-canva.component.css'
})
export class DashboardCanvaComponent implements OnInit {
  ngOnInit() {
    this.subscribeToDataService();
  }

  constructor(
    private dataService: DataService
  ) { }

  // Data Service Subscriptions
  selectEntry: number = -1;
  arrayEntry: { idEntry?: number, text?: string, select?: boolean }[] = [];

  private subscribeToDataService() {
    this.dataService['subjects'].entry.create.subscribe(data => this.addNewBoxEntry(data));
    this.dataService['subjects'].entry.change.subscribe(data => this.changeBoxEntry(data));
    this.dataService['subjects'].entry.select.subscribe(data => this.selectBoxEntry(data));
    this.dataService['subjects'].entry.delete.subscribe(data => this.deleteBoxEntry(data));
    this.dataService['subjects'].entry.deleteAll.subscribe(() => this.deleteAllBoxEntry());
  }

  // Box Entry Handlers
  selectTopHeader: number = 0;

  private addNewBoxEntry({ idBox, text }: { idBox: number; text: string }) {
    this.selectEntry = idBox;
    this.arrayEntry.push({ idEntry: idBox, text, select: false });
  }

  private changeBoxEntry({ idBox, text }: { idBox: number; text: string }) {
    this.selectEntry = idBox;
    const entry = this.arrayEntry[idBox];
    if (entry) {
      entry.text = text;
    }
  }

  private selectBoxEntry({ idBox, isSelect }: { idBox: number; isSelect: boolean }) {
    this.selectEntry = idBox;
    this.arrayEntry[idBox] = { ...this.arrayEntry[idBox], select: isSelect };
  }

  private deleteBoxEntry({ idBox }: { idBox: number }) {
    if (idBox >= 0 && idBox < this.arrayEntry.length) {
      this.arrayEntry.splice(idBox, 1);
    }
  }

  private deleteAllBoxEntry() {
    this.arrayEntry = [];
  }

  // dashboard-canva Handlers
  changeTopHeader(selectTopHeader: number) {
    this.animateVisibleContent(selectTopHeader);
  }

  // animations
  animateVisibleContent(selectTopHeader: number) {
    if (selectTopHeader != this.selectTopHeader) {
      const topElement = document.getElementById('topElement');

      let translateXDirection: [number, number];
      if (selectTopHeader > this.selectTopHeader) {
        translateXDirection = [0, -30];
      } else {
        translateXDirection = [0, 30]; 
      }

      const hiddenElements = topElement?.querySelectorAll('.pass.hidden, .bottom-pass.hidden');
      if (hiddenElements) {
        hiddenElements.forEach(element => {
          anime.remove(element);
          (element as HTMLElement).style.opacity = '0';
          (element as HTMLElement).style.transform = '';
        });
      }

      // animation button top content
      const visibleButtonTop = topElement?.querySelectorAll('.button_header_element_boxFunctions.select');
      anime({
        targets: visibleButtonTop,
        backgroundColor: ['#222', 'rgba(255, 0, 0, 0)'],
        easing: 'easeOutQuart',
        duration: 100
      });

      // animation content
      const visibleElements = topElement?.querySelectorAll('.pass:not(.hidden), .bottom-pass:not(.hidden)');

      if (visibleElements) {
        anime({
          targets: visibleElements,
          opacity: [1, 0],
          translateX: translateXDirection,
          duration: 100,
          easing: 'easeOutQuart',
          complete: () => {
            this.selectTopHeader = selectTopHeader;
            setTimeout(() => {       
              // animation content
              const visibleElements = topElement?.querySelectorAll('.pass:not(.hidden), .bottom-pass:not(.hidden)');
              anime({
                targets: visibleElements,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 100,
                easing: 'easeOutQuart'
              });
            }, 0);
          }
        });
      }
    }
  }
}
