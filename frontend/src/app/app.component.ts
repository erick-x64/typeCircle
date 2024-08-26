import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from './data.service';
import anime from 'animejs';
import { LocalStorageService } from './local-storage.service';
import { SaveService } from './save.service';

interface TranslationFile {
  text: string;
  textTranslate: string;
}

interface CanvaFile {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
  translationOfFiles: TranslationFile[][];
}

interface Project {
  canvaFile: CanvaFile;
  nameProject: string;
  creationDate: string;
  modificationDate: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @Output() signChangeMenu = new EventEmitter<string>();

  @ViewChild('headerHome') headerHome!: ElementRef;
  @ViewChild('home') home!: ElementRef;

  title = 'typeCircle';
  selectMenu: number = 0;
  showHome: boolean = true;
  showShortenedHeader: boolean = false;
  isInAnimation: boolean = false;
  isAnimationOpenEdit: boolean = false;
  file?: File;
  public projectDisplay: Project[] = [];

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService,
    private saveService: SaveService
  ) { }

  async ngOnInit() {
    this.projectDisplay = await this.localStorageService.getProjects();
    // this.debugMode();
  }

  // Header Handlers
  changeDashBoard(imageURL: File) {
    this.showHome = false;
    setTimeout(() => {
      this.dataService.addImageCanva(imageURL, false);
    });
  }

  changeMenu(numberChange: number) {
    this.selectMenu = numberChange;
    if (numberChange === 0) {
      this.closeImage();
    }
  }

  // Animation
  private initAnimateOpenImage() {
    this.animateOpenImage();
  }

  private animateOpenImage() {
    anime({
      targets: "#contentHome",
      opacity: [1, 0],
      translateY: [0, -10],
      duration: 100,
      easing: 'easeOutQuart',
      complete: () => this.onOpenImageComplete()
    });
  }

  private onOpenImageComplete() {
    this.selectMenu = 1;
    this.showShortenedHeader = true;

    setTimeout(() => {
      this.showHome = false;

      if (this.file) {
        this.dataService.addImageCanva(this.file, false);
      } else {
        this.dataService.sendOpenProject();
      }

      anime({
        targets: "#main",
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 100,
        easing: 'easeOutQuart'
      });

      this.isAnimationOpenEdit = true;
    }, 0);
  }

  async closeImage() {
    if (this.isAnimationOpenEdit) {
      this.projectDisplay = await this.localStorageService.getProjects();
      this.animateCloseImage();
    }
  }

  private animateCloseImage() {
    anime({
      targets: "#main",
      opacity: [1, 0],
      translateY: [0, -10],
      duration: 100,
      easing: 'easeOutQuart',
      complete: () => {
        this.showHome = true;

        setTimeout(() => {
          anime({
            targets: "#contentHome",
            opacity: [0, 1],
            translateY: [-10, 0],
            duration: 100,
            easing: 'easeOutQuart',
            complete: () => {
              this.isAnimationOpenEdit = false;
              this.isInAnimation = false;
            }
          });
        }, 0);
      }
    });
  }

  // Home Handlers
  openProject(index: number) {
    if (!this.isInAnimation) {
      this.isInAnimation = true;
      this.saveService.clearArrayFiles();
      this.localStorageService.setSelectedProject(index);
      this.file = undefined;
      this.initAnimateOpenImage();
    }
  }

  openFileFirst(file: File) {
    this.addProjectToLocalStorage();
    this.initAnimateOpenImage();
    this.file = file;
  }

  // Local Storage Handlers
  private addProjectToLocalStorage() {
    const { date, time } = this.getFormattedDateTime();

    const newProject: Project = {
      canvaFile: {
        base64Image: [],
        selectFile: -1,
        canvas: [],
        translationOfFiles: [[]]
      },
      nameProject: 'Project ' + (this.projectDisplay.length + 1),
      creationDate: `${date} ${time}`,
      modificationDate: `${date} ${time}`
    };

    this.localStorageService.addProject(newProject);
    const projectIndex = this.projectDisplay ? this.projectDisplay.length : 0;
    this.localStorageService.setSelectedProject(projectIndex);
  }

  // Utility Functions
  private getFormattedDateTime() {
    const userLocale = navigator.language || 'en-US';

    const currentDate = new Date();

    const formattedDate = new Intl.DateTimeFormat(userLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(currentDate);

    const formattedTime = new Intl.DateTimeFormat(userLocale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(currentDate);

    return {
      date: formattedDate,
      time: formattedTime
    };
  }

  // Debug Mode
  async fetchImageAsFile(imagePath: string, fileName: string): Promise<File> {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }

  async debugMode() {
    this.showHome = false;
    setTimeout(async () => {
      const file = await this.fetchImageAsFile("/assets/testImages/read-sensei-wa-koi.png", "read-sensei-wa-koi.png");
      this.dataService.addImageCanva(file, true);

      let arrayFile = {
        pathFile: "/assets/testImages/read-sensei-wa-koi.png",
        nameFile: "debug",
        extensionFile: ".png",
        select: true
      };

      this.saveService.addFile(arrayFile);

    });
  }
}