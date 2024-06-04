import { Component, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { FileService } from '../file.service';

@Component({
  selector: 'app-file-box',
  templateUrl: './file-box.component.html',
  styleUrl: './file-box.component.css'
})
export class FileBoxComponent {

  arrayFiles: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[] = [];
  currentSelect: number = -1;

  @ViewChild('openFileImage') fileInput: ElementRef | undefined;

  constructor(private dataService: DataService, private fileService: FileService) { }

  ngOnInit() {
    this.arrayFiles = this.fileService.arrayFiles;
  }

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
    if (this.fileService.arrayFiles.length >= 0) {
      this.fileService.arrayFiles.forEach((element, index) => {
        this.fileService.arrayFiles[index] = { pathFile: element.pathFile, nameFile: element.nameFile, extensionFile: element.extensionFile, select: false };
      });
    }

    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);

    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.'));

    this.dataService.addImageCanva(imageUrl);
    this.fileService.arrayFiles.push({ pathFile: imageUrl, nameFile: fileNameWithoutExtension, extensionFile: fileExtension, select: true });
  }

  selectFile(index: number) {    
    if (this.fileService.arrayFiles.length > 0 && index != this.currentSelect) {
      // remove before
      for (let index = 0; index < this.fileService.arrayFiles.length; index++) {
        this.fileService.arrayFiles[index] = { pathFile: this.fileService.arrayFiles[index].pathFile, nameFile: this.fileService.arrayFiles[index].nameFile, extensionFile: this.fileService.arrayFiles[index].extensionFile, select: false };
      }

      // add
      this.fileService.arrayFiles[index] = { pathFile: this.fileService.arrayFiles[index].pathFile, nameFile: this.fileService.arrayFiles[index].nameFile, extensionFile: this.fileService.arrayFiles[index].extensionFile, select: true };
      this.dataService.selectFileCanva(index);

      this.currentSelect = index;
    }
  }

  removeFile(index: number) {
    if (this.currentSelect === 0) {
      if ((this.fileService.arrayFiles.length - 2) > 0) {
        this.currentSelect = 1;
      } else {
        this.currentSelect = 0;
      }
    } else {
      this.currentSelect = this.fileService.arrayFiles.length - 2;
    }

    if ((this.fileService.arrayFiles.length - 2) > 0) {
      this.fileService.arrayFiles[this.currentSelect] = { pathFile: this.fileService.arrayFiles[this.currentSelect].pathFile, nameFile: this.fileService.arrayFiles[this.currentSelect].nameFile, extensionFile: this.fileService.arrayFiles[this.currentSelect].extensionFile, select: true };
    }

    this.dataService.removeFileCanva(index);
    this.fileService.arrayFiles.splice(index, 1);
  }

  downloadFile(index: number) {
    this.dataService.downloadFileCanva(index);
  }
}
