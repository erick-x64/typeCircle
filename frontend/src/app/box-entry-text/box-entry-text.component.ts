import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-box-entry-text',
  templateUrl: './box-entry-text.component.html',
  styleUrl: './box-entry-text.component.css'
})
export class BoxEntryTextComponent {
  constructor(private dataService: DataService) { }

  @Input() data: { idEntry?: number; text?: string; select?: boolean } = { idEntry: undefined, text: undefined, select: false };

  textEntry: string = "";
  selectEntry: boolean = false;

  ngOnInit() {
    if (this.data.text != undefined) {
      this.textEntry = this.data.text;
    }
    if (this.data.select != undefined) {      
      this.selectEntry = this.data.select;
    }
  };

  changeText(event: any) {
    let text = event.target.value;

    if (this.data.idEntry != undefined) {
      this.dataService.sendBoxCanvaChange(this.data.idEntry, text);
    }
  }
}
