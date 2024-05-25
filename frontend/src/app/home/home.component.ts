import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import { FileService } from '../file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @Output() signChangeMenu = new EventEmitter<string>();

  constructor(private dataService: DataService, private fileService: FileService) { }

  @ViewChild('openFileImage') fileInput: ElementRef | undefined;

  openFileInput() {
    this.fileInput?.nativeElement.click();
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);

    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.'));

    this.fileService.arrayFiles.push({ pathFile: imageUrl, nameFile: fileNameWithoutExtension, extensionFile: fileExtension, select: true });

    this.signChangeMenu.emit(imageUrl);
  }
}
