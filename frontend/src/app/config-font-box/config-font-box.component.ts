import { Component, Input, HostListener } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-config-font-box',
  templateUrl: './config-font-box.component.html',
  styleUrl: './config-font-box.component.css'
})
export class ConfigFontBoxComponent {
  availableFonts: any = [];

  constructor(private dataService: DataService) { }

  @Input() selectEntry: number = 0;

  // boxFontChange(idBox: number, familyFont: string, sizeFont: string, colorFont: string, lineHeightFont: string, positionText: number) {

  familyFont: string = "Arial";
  sizeFont: number = 14;
  colorFont: string = "#000000";
  lineHeightFont: number = 1.4;
  positionText: number = 0;

  ngOnInit() {
    // this.dataService.sendConfigBoxSelect$.subscribe(data => {
    //   this.familyFont = data.familyFont;
    //   this.sizeFont = data.sizeFont;
    //   this.colorFont = data.colorFont;
    //   this.lineHeightFont = data.lineHeightFont;
    //   this.positionText = data.positionText;
    // });
  }

  changeFamilyFont() {
    this.sendVarsToCanva();
  }

  changeSizeFont() {
    this.sendVarsToCanva();
  }

  onColorChange(color: string) {
    this.colorFont = color;
    this.sendVarsToCanva();
  }

  changeColorFont() {
    let hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

    if (!hexRegex.test(this.colorFont)) {
      this.colorFont = "#000000";
    };

    this.sendVarsToCanva();
  }

  changeLineHeightFont() {
    this.sendVarsToCanva();
  }

  sendVarsToCanva() {
    if (this.selectEntry != -1) {
      this.dataService.boxFontChange(this.selectEntry, this.familyFont, this.sizeFont, this.colorFont, this.lineHeightFont, this.positionText);
    } else {
      this.dataService.boxFontDefaultChange(this.selectEntry, this.familyFont, this.sizeFont, this.colorFont, this.lineHeightFont, this.positionText);
    }
  }

  selectAling(selectAling: number) {
    this.positionText = selectAling;
    this.sendVarsToCanva();
  }

  // font
  showButtonChoiceFont: boolean = true;

  async listFonts() {
    this.showButtonChoiceFont = false;
    if (this.availableFonts.length === 0) {
      try {
        this.availableFonts = await this.queryLocalFonts();
      } catch (err: any) {
        console.error(err.name, err.message);
      }
    }
  }

  queryLocalFonts() {
    return new Promise((resolve, reject) => {
      window.queryLocalFonts().then((fonts: any[]) => {
        resolve(fonts);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

}
