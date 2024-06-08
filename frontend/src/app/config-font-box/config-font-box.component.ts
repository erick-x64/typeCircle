import { Component, Input, HostListener } from '@angular/core';
import { DataService } from '../data.service';

interface FontData {
  postscriptName: string;
  fullName: string;
  family: string;
  style: string;
}

@Component({
  selector: 'app-config-font-box',
  templateUrl: './config-font-box.component.html',
  styleUrl: './config-font-box.component.css'
})
export class ConfigFontBoxComponent {
  @Input() selectEntry: number = 0;

  familyFont: string = "Arial";
  styleFont: "" | "normal" | "italic" | "oblique" = "";
  fontWeight: string = "normal";
  sizeFont: number = 14;
  colorFont: string = "#000000";
  lineHeightFont: number = 1.4;
  positionText: number = 0;

  showButtonChoiceFont: boolean = true;
  availableFonts: any = [];
  selectedFamily: string = "";
  selectedStyle: any;
  fontFamilies: string[] = [];
  fontMap: { [key: string]: any[] } = {};

  private debouncedSendVarsToCanva: () => void;

  constructor(private dataService: DataService) {
    this.debouncedSendVarsToCanva = this.debounce(this.sendVarsToCanva.bind(this), 300);
  }

  changeSizeFont() {
    this.sendVarsToCanva();
  }

  onColorChange(color: string) {
    this.colorFont = color;
    this.debouncedSendVarsToCanva();
  }

  changeColorFont() {
    const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (!hexRegex.test(this.colorFont)) {
      this.colorFont = "#000000";
    }
    this.sendVarsToCanva();
  }

  changeLineHeightFont() {
    this.sendVarsToCanva();
  }

  sendVarsToCanva() {
    if (this.selectEntry !== -1) {
      this.dataService.boxFontChange(
        this.selectEntry,
        this.familyFont,
        this.styleFont,
        this.fontWeight,
        this.sizeFont,
        this.colorFont,
        this.lineHeightFont,
        this.positionText
      );
    } else {
      this.dataService.boxFontDefaultChange(
        this.selectEntry,
        this.familyFont,
        this.styleFont,
        this.fontWeight,
        this.sizeFont,
        this.colorFont,
        this.lineHeightFont,
        this.positionText
      );
    }
  }

  selectAling(selectAling: number) {
    this.positionText = selectAling;
    this.sendVarsToCanva();
  }

  debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: number | undefined;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  async listFonts() {
    if (this.availableFonts.length === 0) {
      try {
        this.availableFonts = await this.queryLocalFonts();
        this.organizeFontsByFamily();
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

  organizeFontsByFamily() {
    this.fontMap = this.availableFonts.reduce((acc: any, font: any) => {
      if (!acc[font.family]) {
        acc[font.family] = [];
      }
      acc[font.family].push(font);
      return acc;
    }, {});

    this.fontFamilies = Object.keys(this.fontMap);
    this.showButtonChoiceFont = false;
  }

  handleSelectionChanged(event: { selectedFamily: string, selectedOption: any }) {
    const { fontStyle, fontWeight } = this.mapFontStyle(event.selectedOption.fullName);
    this.familyFont = event.selectedFamily;
    this.styleFont = fontStyle;
    this.fontWeight = fontWeight;
    this.sendVarsToCanva();
  }

  mapFontStyle(styleFont: string): { fontStyle: "" | "normal" | "italic" | "oblique", fontWeight: string } {
    const lowerCaseStyle = styleFont.toLowerCase();

    const styleMap: { [key: string]: "" | "normal" | "italic" | "oblique" } = {
      "italic": "italic",
      "itálico": "italic",
      "oblique": "oblique"
    };

    const weightMap: { [key: string]: string } = {
      "negrito": "bold",
      "bold": "bold",
      "extrabold": "800",
      "extra bold": "800",
      "extralight": "200",
      "extra light": "200",
      "light": "300",
      "regular": "400",
      "medium": "500",
      "semibold": "600",
      "semi bold": "600"
    };

    let fontStyle: "" | "normal" | "italic" | "oblique" = "normal";
    let fontWeight: string = "normal";

    for (const key in styleMap) {
      if (lowerCaseStyle.includes(key)) {
        fontStyle = styleMap[key];
        break;
      }
    }

    for (const key in weightMap) {
      if (lowerCaseStyle.includes(key)) {
        fontWeight = weightMap[key];
        break;
      }
    }

    return { fontStyle, fontWeight };
  }
}