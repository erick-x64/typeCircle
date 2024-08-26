import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../data.service';
import { SaveService } from '../save.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-box',
  templateUrl: './file-box.component.html',
  styleUrls: ['./file-box.component.css']
})
export class FileBoxComponent implements OnInit, OnDestroy {

  arrayFiles: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[] = [];
  currentSelect: number = -1;
  private arrayFilesSubscription: Subscription | undefined;

  @ViewChild('openFileImage') fileInput: ElementRef | undefined;

  constructor(private dataService: DataService, private saveService: SaveService) { }

  ngOnInit(): void {
    this.arrayFilesSubscription = this.saveService.arrayFiles$.subscribe(files => {
      this.arrayFiles = files;
    });
  }

  ngOnDestroy(): void {
    if (this.arrayFilesSubscription) {
      this.arrayFilesSubscription.unsubscribe();
    }
  }

  openFileInput() {
    this.fileInput?.nativeElement.click();
  }

  // add file
  handleFileInput(event: any) {
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.'));

    this.dataService.addImageCanva(file, false);
    this.saveService.addFile({ pathFile: imageUrl, nameFile: fileNameWithoutExtension, extensionFile: fileExtension, select: true });
  }

  selectFile(index: number) {
    if (this.arrayFiles.length > 0 && index !== this.currentSelect) {
      this.arrayFiles = this.arrayFiles.map((file, i) => ({
        ...file,
        select: i === index
      }));

      this.dataService.selectFileCanva(index);
      this.currentSelect = index;
    }
  }

  removeFile(index: number) {
    if (this.currentSelect === index) {
      if (this.arrayFiles.length > 1) {
        this.currentSelect = index > 0 ? index - 1 : 0;
      } else {
        this.currentSelect = -1;
      }
    }

    console.log(this.currentSelect);
    

    this.arrayFiles.splice(index, 1);
    this.saveService.updateArrayFiles(this.arrayFiles);

    this.dataService.removeFileCanva(index);
  }

  downloadFile(index: number) {
    this.dataService.downloadFileCanva(index);
  }

  saveAllFiles() {
    this.dataService.saveAllFiles();
  }
}
