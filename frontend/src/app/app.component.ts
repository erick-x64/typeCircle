import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from './data.service';
import anime from 'animejs';
import { LocalStorageService } from './local-storage.service';
import { SaveService } from './save.service';

interface Project {
  canvaFile: {};
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
  projectDisplay: any[] = [];

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService,
    private saveService: SaveService
  ) { }

  ngOnInit() {
    this.projectDisplay = this.getProjectsFromLocalStorage();
    // this.clearProjectsFromLocalStorage();
    // this.debugMode();
  }

  // Header Handlers
  changeDashBoard(imageURL: File) {
    this.showHome = false;
    setTimeout(() => {
      this.dataService.addImageCanva(imageURL);
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
    const home = this.home.nativeElement;
    const headerHomeElement = this.headerHome.nativeElement;
    const homeGap = getComputedStyle(home).gap;
    const headerHomePadding = getComputedStyle(headerHomeElement).padding;
    const headerHomeHeight = headerHomeElement.offsetHeight;

    this.animateOpenImage(home, homeGap, headerHomeElement, headerHomePadding, headerHomeHeight);
  }

  private animateOpenImage(home: HTMLElement, homeGap: string, headerHomeElement: HTMLElement, headerHomePadding: string, headerHomeHeight: number) {
    anime({
      targets: home,
      gap: [homeGap, "0px"],
      duration: 200,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: "#contentHome",
      opacity: [1, 0],
      duration: 150,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: "#isHome",
      opacity: [1, 0],
      duration: 150,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: headerHomeElement,
      top: ['0px', `-${headerHomeHeight}px`],
      height: [`${headerHomeHeight}px`, "0px"],
      paddingBottom: [headerHomePadding, "0px"],
      // paddingTop: [headerHomePadding, "0px"],
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInExpo',
      complete: () => this.onOpenImageComplete()
    });
  }

  private onOpenImageComplete() {
    this.selectMenu = 1;
    this.showShortenedHeader = true;

    setTimeout(() => {
      this.showHome = false;

      if (this.file) {
        this.dataService.addImageCanva(this.file);
      } else {
        this.dataService.sendOpenProject();
      }

      anime({
        targets: "#shortenedHeader",
        opacity: [0, 1],
        top: ["-65px", "-35px"],
        duration: 250,
        easing: 'easeOutElastic'
      });

      anime({
        targets: "#main",
        opacity: [0, 1],
        duration: 200,
        easing: 'easeInOutQuad'
      });

      this.isAnimationOpenEdit = true;
    }, 0);
  }

  closeImage() {
    if (this.isAnimationOpenEdit) {
      this.projectDisplay = this.getProjectsFromLocalStorage();
      this.animateCloseImage();
    }
  }

  private animateCloseImage() {
    anime({
      targets: "#shortenedHeader",
      opacity: [1, 0],
      top: ["-35px", "-65px"],
      duration: 250,
      easing: 'easeInOutElastic'
    });

    anime({
      targets: "#main",
      opacity: [1, 0],
      duration: 150,
      easing: 'easeInOutQuad',
      complete: () => this.onCloseImageComplete()
    });
  }

  private onCloseImageComplete() {
    this.showShortenedHeader = false;
    this.showHome = true;

    const home = this.home.nativeElement;
    const headerHomeElement = this.headerHome.nativeElement;
    const headerHomeHeight = headerHomeElement.scrollHeight;

    anime({
      targets: home,
      gap: ["0px", "24px"],
      duration: 300,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: headerHomeElement,
      top: ['-91px', '0px'],
      height: ['0px', `${headerHomeHeight + 20}px`],
      paddingBottom: ["0px", "10px"],
      paddingTop: ["0px", "10px"],
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInOutExpo',
      complete: () => this.onResetHeaderComplete()
    });
  }

  private onResetHeaderComplete() {
    anime({
      targets: "#contentHome",
      opacity: [0, 1],
      duration: 150,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: "#isHome",
      opacity: [0, 1],
      duration: 150,
      easing: 'easeInOutQuad',
      complete: () => {
        this.isAnimationOpenEdit = false;
        this.isInAnimation = false;
      }
    });
  }

  // Home Handlers
  openProject(index: number) {
    if (!this.isInAnimation) {
      this.isInAnimation = true;
      this.saveService.arrayFiles = [];
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
      canvaFile: [],
      nameProject: 'Project ' + (this.projectDisplay.length + 1),
      creationDate: `${date} ${time}`,
      modificationDate: `${date} ${time}`
    };

    this.localStorageService.addProject(newProject);
    const projectIndex = this.projectDisplay ? this.projectDisplay.length : 0;
    this.localStorageService.setSelectedProject(projectIndex);
  }

  private getProjectsFromLocalStorage() {
    if (this.localStorageService.getProjects() != null) {
      return this.localStorageService.getProjects();
    } else {
      return [];
    }
  }

  private clearProjectsFromLocalStorage() {
    this.localStorageService.clearProjects();
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
      this.headerHome.nativeElement.style.display = "none";

      const file = await this.fetchImageAsFile("/assets/testImages/read-sensei-wa-koi.png", "read-sensei-wa-koi.png");
      this.dataService.addImageCanva(file);
    });
  }
}