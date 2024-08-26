import { Component, Output, Input, EventEmitter, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from '../local-storage.service';
import { SaveService } from '../save.service';
import anime from 'animejs';

interface CanvaFile {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
}

interface Project {
  canvaFile: CanvaFile;
  nameProject: string;
  creationDate: string;
  modificationDate: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements AfterViewInit {
  @ViewChild('openFileImage') fileInput: ElementRef | undefined;

  constructor(
    private localStorageService: LocalStorageService,
    private saveService: SaveService
  ) { }

  @Input() projectDisplay: Project[] = [];
  projectDisplaySubject: BehaviorSubject<any[]> = new BehaviorSubject(this.projectDisplay);
  @Output() sendOpenFileFirst = new EventEmitter<File>();
  @Output() sendOpenProject = new EventEmitter<number>();

  ngAfterViewInit() {
    this.projectDisplaySubject.subscribe((projects) => {
      if (projects.length === 0) {
        this.animationNoImage();
      }
    });
  }

  animationNoImage(): void {
    setTimeout(() => {
      anime({
        targets: "#noImages",
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 500,
        easing: 'easeOutQuart'
      });
    }, 0);
  }

  // File Handling
  openImage() {
    this.fileInput?.nativeElement.click();
  }

  handleFileInput(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      const [fileNameWithoutExtension, fileExtension] = file.name.split('.');

      let arrayFile = {
        pathFile: imageUrl,
        nameFile: fileNameWithoutExtension,
        extensionFile: fileExtension,
        select: true
      };

      this.saveService.addFile(arrayFile);

      this.sendOpenFileFirst.emit(file);
    }
  }

  // Box Recent Handlers
  openProject(index: number) {
    this.sendOpenProject.emit(index);
  }

  async onDeleteBoxRecent(index: number) {
    if (index > -1 && index < this.projectDisplay.length) {
      this.projectDisplay.splice(index, 1);
      this.projectDisplaySubject.next(this.projectDisplay);
      this.localStorageService.removeProject(index);
    }
  }
}
