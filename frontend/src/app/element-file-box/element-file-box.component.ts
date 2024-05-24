import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-element-file-box',
  templateUrl: './element-file-box.component.html',
  styleUrl: './element-file-box.component.css'
})
export class ElementFileBoxComponent {
  @Input() data: { pathFile: string, nameFile: string, extensionFile: string, select: boolean } = { pathFile: "", nameFile: "", extensionFile: "", select: false };
  @Output() sendRemoveFile = new EventEmitter<void>();
  @Output() sendDownloadFile = new EventEmitter<void>();

  imageFile: string = "";
  nameFile: string = "";
  extensionFile: string = "";
  selectFile: boolean = false;

  ngOnInit() {
    this.imageFile = this.data.pathFile;
    this.nameFile = this.data.nameFile;
    this.extensionFile = this.data.extensionFile;
    this.selectFile = this.data.select;
  }

  removeFile() {
    this.sendRemoveFile.emit();
  }

  downloadFile() {
    this.sendDownloadFile.emit();
  }
}
