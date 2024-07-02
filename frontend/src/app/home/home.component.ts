import { Component, Output, Input, EventEmitter, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
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
  @Output() sendOpenFileFirst = new EventEmitter<File>();
  @Output() sendOpenProject = new EventEmitter<number>();

  ngAfterViewInit() {
    if (this.projectDisplay.length === 0) {
      this.animateBalls();
    }
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

      this.saveService.arrayFiles.push({
        pathFile: imageUrl,
        nameFile: fileNameWithoutExtension,
        extensionFile: fileExtension,
        select: true
      });

      this.sendOpenFileFirst.emit(file);
    }
  }

  // Animation
  animateBalls() {
    anime({
      targets: '.element-rowBalls-noProjects',
      backgroundColor: [
        { value: '#3D3D3D', duration: 1000 },
        { value: '#262626', duration: 1000 }
      ],
      delay: anime.stagger(500, { start: 500 }), // interval between each ball's animation
      loop: true
    });
  }

  // Box Recent Handlers
  openProject(index: number) {
    this.sendOpenProject.emit(index);
  }

  onDeleteBoxRecent(index: number) {
    this.localStorageService.removeProject(index);
    this.projectDisplay = this.localStorageService.getProjects() as Project[];
  }
}
