import { Component, Input, EventEmitter, Output } from '@angular/core';

interface FontData {
  postscriptName: string;
  fullName: string;
  family: string;
  style: string;
}

@Component({
  selector: 'app-font-dropdown',
  templateUrl: './font-dropdown.component.html',
  styleUrl: './font-dropdown.component.css'
})
export class FontDropdownComponent {
  @Input() fontFamilies: string[] = [];
  @Input() fontMap: { [key: string]: any[] } = {};
  @Output() selectionChanged = new EventEmitter<{ selectedFamily: string, selectedOption: FontData }>();

  filterText: string = '';
  selectedFamily: string | null = null;
  selectedOption: any | null = null;
  dropdownOpen: boolean = false;
  filteredFontFamilies: string[] = [];

  ngOnInit() {
    this.dropdownOpen = true;
    this.filteredFontFamilies = [...this.fontFamilies];
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectFamily(family: string) {
    this.selectedFamily = family;
  }

  selectFont(font: any) {
    this.selectedOption = font;
    this.dropdownOpen = false;
    this.filterText = this.selectedOption.fullName;
    this.sendFontSelect();
  }

  filterFonts() {
    this.dropdownOpen = true;
    const filter = this.filterText.toLowerCase();
    this.filteredFontFamilies = this.fontFamilies.filter(family => family.toLowerCase().includes(filter));
  }

  sendFontSelect() {
    this.selectionChanged.emit({ selectedFamily: this.selectedFamily!, selectedOption: this.selectedOption! });
  };
}
