import { Component, Input } from '@angular/core';
import { DataService } from '../data.service';

interface BoxConfig {
  idBox: number;
  familyFont: string;
  styleFont: string;
  fontWeight: string;
  sizeFont: number;
  colorFont: string;
  lineHeightFont: number;
  positionText: number;
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

  ngOnInit() {
    this.listFonts();
    this.dataService['subjects'].fontConfig.select.subscribe(data => {
      this.familyFont = data.familyFont;
      this.sizeFont = data.sizeFont;
      this.colorFont = data.colorFont;
      this.lineHeightFont = data.lineHeightFont;
      this.positionText = data.positionText;

      this.selectedFamily = data.familyFont;
    });
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
    const boxConfig: BoxConfig = {
      idBox: this.selectEntry,
      familyFont: this.familyFont,
      styleFont: this.styleFont,
      fontWeight: this.fontWeight,
      sizeFont: this.sizeFont,
      colorFont: this.colorFont,
      lineHeightFont: this.lineHeightFont,
      positionText: this.positionText
    };

    if (this.selectEntry !== -1) {
      this.dataService.boxFontChange(boxConfig);
    } else {
      this.dataService.boxFontDefaultChange(boxConfig);
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
        if (typeof (window as any).queryLocalFonts === 'function') {
          this.availableFonts = await (window as any).queryLocalFonts();
          this.organizeFontsByFamily();
        } else {
          console.warn("queryLocalFonts is not supported in this browser.");
          this.availableFonts = this.getFallbackFonts();
          this.organizeFontsByFamily();
        }
      } catch (err: any) {
        console.error(err.name, err.message);
      }
    }
  }

  getFallbackFonts() {
    return [
      { family: 'Arial', fullName: 'Arial' },
      { family: 'Arial', fullName: 'Arial Black' },
      { family: 'Arial', fullName: 'Arial Bold' },
      { family: 'Arial', fullName: 'Arial Italic' },
      { family: 'Arial', fullName: 'Arial Bold Italic' },
      { family: 'Helvetica', fullName: 'Helvetica' },
      { family: 'Helvetica', fullName: 'Helvetica Bold' },
      { family: 'Helvetica', fullName: 'Helvetica Italic' },
      { family: 'Helvetica', fullName: 'Helvetica Bold Italic' },
      { family: 'Times New Roman', fullName: 'Times New Roman' },
      { family: 'Times New Roman', fullName: 'Times New Roman Bold' },
      { family: 'Times New Roman', fullName: 'Times New Roman Italic' },
      { family: 'Times New Roman', fullName: 'Times New Roman Bold Italic' },
      { family: 'Courier New', fullName: 'Courier New' },
      { family: 'Courier New', fullName: 'Courier New Bold' },
      { family: 'Courier New', fullName: 'Courier New Italic' },
      { family: 'Courier New', fullName: 'Courier New Bold Italic' },
      { family: 'Georgia', fullName: 'Georgia' },
      { family: 'Georgia', fullName: 'Georgia Bold' },
      { family: 'Georgia', fullName: 'Georgia Italic' },
      { family: 'Georgia', fullName: 'Georgia Bold Italic' },
      { family: 'Verdana', fullName: 'Verdana' },
      { family: 'Verdana', fullName: 'Verdana Bold' },
      { family: 'Verdana', fullName: 'Verdana Italic' },
      { family: 'Verdana', fullName: 'Verdana Bold Italic' },
      { family: 'Trebuchet MS', fullName: 'Trebuchet MS' },
      { family: 'Trebuchet MS', fullName: 'Trebuchet MS Bold' },
      { family: 'Trebuchet MS', fullName: 'Trebuchet MS Italic' },
      { family: 'Trebuchet MS', fullName: 'Trebuchet MS Bold Italic' }
    ];
  }

  queryLocalFonts() {
    return new Promise((resolve, reject) => {
      // @ts-ignore
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