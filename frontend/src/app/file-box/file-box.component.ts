import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { SaveService } from '../save.service';

@Component({
  selector: 'app-file-box',
  templateUrl: './file-box.component.html',
  styleUrl: './file-box.component.css'
})
export class FileBoxComponent {

  arrayFiles: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[] = this.saveService.arrayFiles;
  currentSelect: number = -1;

  @ViewChild('openFileImage') fileInput: ElementRef | undefined;

  constructor(private dataService: DataService, private saveService: SaveService) { }

  openFileInput() {
    this.fileInput?.nativeElement.click();

    // test
    // this.dataService.addImageCanva("/assets/teste/teste2.jpg");
    // this.arrayFiles.push({ pathFile: "/assets/teste/teste2.jpg", nameFile: "test", extensionFile: "png", select: true });
    // this.dataService.addImageCanva("/assets/teste/image.png");
    // this.arrayFiles.push({ pathFile: "/assets/teste/image.png", nameFile: "test3", extensionFile: "png", select: true });
  }

  handleFileInput(event: any) {
    // remove select from other element
    if (this.saveService.arrayFiles.length >= 0) {
      this.saveService.arrayFiles.forEach((element, index) => {
        this.saveService.arrayFiles[index] = { pathFile: element.pathFile, nameFile: element.nameFile, extensionFile: element.extensionFile, select: false };
      });
    }

    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);

    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.'));

    this.dataService.addImageCanva(file);
    this.saveService.arrayFiles.push({ pathFile: imageUrl, nameFile: fileNameWithoutExtension, extensionFile: fileExtension, select: true });
  }

  selectFile(index: number) {    
    if (this.saveService.arrayFiles.length > 0 && index != this.currentSelect) {
      // remove before
      for (let index = 0; index < this.saveService.arrayFiles.length; index++) {
        this.saveService.arrayFiles[index] = { pathFile: this.saveService.arrayFiles[index].pathFile, nameFile: this.saveService.arrayFiles[index].nameFile, extensionFile: this.saveService.arrayFiles[index].extensionFile, select: false };
      }

      // add
      this.saveService.arrayFiles[index] = { pathFile: this.saveService.arrayFiles[index].pathFile, nameFile: this.saveService.arrayFiles[index].nameFile, extensionFile: this.saveService.arrayFiles[index].extensionFile, select: true };
      this.dataService.selectFileCanva(index);

      this.currentSelect = index;
    }
  }

  removeFile(index: number) {
    if (this.currentSelect === 0) {
      if ((this.saveService.arrayFiles.length - 2) > 0) {
        this.currentSelect = 1;
      } else {
        this.currentSelect = 0;
      }
    } else {
      this.currentSelect = this.saveService.arrayFiles.length - 2;
    }

    if ((this.saveService.arrayFiles.length - 2) > 0) {
      this.saveService.arrayFiles[this.currentSelect] = { pathFile: this.saveService.arrayFiles[this.currentSelect].pathFile, nameFile: this.saveService.arrayFiles[this.currentSelect].nameFile, extensionFile: this.saveService.arrayFiles[this.currentSelect].extensionFile, select: true };
    }

    this.dataService.removeFileCanva(index);
    this.saveService.arrayFiles.splice(index, 1);
  }

  downloadFile(index: number) {
    this.dataService.downloadFileCanva(index);
  }

  saveAllFiles() {
    this.dataService.saveAllFiles();
  }
}
