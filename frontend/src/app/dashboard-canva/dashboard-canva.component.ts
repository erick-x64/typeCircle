import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

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
    this.dataService.boxCreate$.subscribe(data => this.addNewBoxEntry(data));
    this.dataService.boxChange$.subscribe(data => this.changeBoxEntry(data));
    this.dataService.boxSelect$.subscribe(data => this.selectBoxEntry(data));
    this.dataService.boxDelete$.subscribe(data => this.deleteBoxEntry(data));
    this.dataService.boxAllDelete$.subscribe(() => this.deleteAllBoxEntry());
  }

  // Box Entry Handlers
  selectTopHeader: number = 0;
  selectBottomHeader: number = 0;

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
    this.selectTopHeader = selectTopHeader;
  }

  changeBottomHeader(selectBottomHeader: number) {
    this.selectBottomHeader = selectBottomHeader;
  }
}
