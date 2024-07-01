import { Component, Input } from '@angular/core';

interface CanvaFile {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
}

@Component({
  selector: 'app-box-recent',
  templateUrl: './box-recent.component.html',
  styleUrl: './box-recent.component.css'
})

export class BoxRecentComponent {
  @Input() canvaFile?: CanvaFile;
  @Input() nameProject?: string;
  @Input() creationDate?: string;
  @Input() modificationDate?: string;

  imageSrc: string = "";
  totalImage: number = 1;

  ngOnInit() {
    if (this.canvaFile && Array.isArray(this.canvaFile.canvas)) {
      const imageUrl = this.canvaFile.base64Image[this.canvaFile.selectFile];
      this.imageSrc = imageUrl;
      this.totalImage = this.canvaFile.canvas.length;      
    }
  }
}
