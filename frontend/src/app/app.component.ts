import { Component } from '@angular/core';
import { DataService } from './data.service';


declare global {
  interface Window {
    queryLocalFonts(): Promise<any[]>; // Ajuste o tipo de retorno conforme necessário
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  constructor(private dataService: DataService) { }

  title = 'typeCircle';
  selectEntry: number = -1;

  arrayEntry: { idEntry?: number, text?: string, select?: boolean }[] = [];
  availableFonts: any = [];

  ngOnInit() {
    this.dataService.boxCreate$.subscribe(data => {
      this.addNewBoxEntry(data);
    });

    this.dataService.boxChange$.subscribe(data => {
      this.changeBoxEntry(data);
    });

    this.dataService.boxSelect$.subscribe(data => {
      this.selectBoxEntry(data);
    });

    this.dataService.boxDelete$.subscribe(data => {
      this.deleteBoxEntry(data);
    });

    this.dataService.boxAllDelete$.subscribe(() => {
      this.deleteAllBoxEntry();
    });

    // test only
    setTimeout(() => {
      this.dataService.addImageCanva("/assets/teste/teste3.jpg");
    });
  }

  // canva
  addNewBoxEntry(data: { idBox: number, text: string }) {
    this.selectEntry = data.idBox;
    this.arrayEntry.push({ idEntry: data.idBox, text: data.text, select: false });
  }

  changeBoxEntry(data: { idBox: number, text: string }) {
    this.selectEntry = data.idBox;
    this.arrayEntry[data.idBox] = { idEntry: data.idBox, text: data.text };
  }

  selectBoxEntry(data: { idBox: number, isSelect: boolean }) {
    this.selectEntry = data.idBox;
    this.arrayEntry[data.idBox] = { idEntry: data.idBox, text: this.arrayEntry[data.idBox].text, select: data.isSelect };
  }

  deleteBoxEntry(data: { idBox: number }) {
    if (data.idBox >= 0 && data.idBox < this.arrayEntry.length) {
      this.arrayEntry.splice(data.idBox, 1);
    }
  }

  deleteAllBoxEntry() {
    this.arrayEntry = [];
  }

  // html
  selectTopHeader: number = 1;
  selectBottomHeader: number = 0;

  changeTopHeader(selectTopHeader: number) {
    this.selectTopHeader = selectTopHeader;
  }

  changeBottomHeader(selectTopHeader: number) {
    this.selectBottomHeader = selectTopHeader;
  }

  showHome: boolean = false;
  changeDashBoard(imageURl: string) {
    this.showHome = false;
    setTimeout(() => {
      this.dataService.addImageCanva(imageURl);
    });
  }
}
