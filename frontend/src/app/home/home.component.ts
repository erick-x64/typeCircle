import { Component, Output, Input, EventEmitter, ElementRef, AfterViewInit, ViewChild, input } from '@angular/core';
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

  private _allProjects: Project[] = [];

  @Input()
  set allProjects(value: Project[]) {
    this._allProjects = value;
    this.onAllProjectsReceived();
  }

  get allProjects(): Project[] {
    return this._allProjects;
  }

  projectDisplay: Project[] = [];
  allProjectsSubject: BehaviorSubject<any[]> = new BehaviorSubject(this.allProjects);
  @Output() sendOpenFileFirst = new EventEmitter<File>();
  @Output() sendOpenProject = new EventEmitter<number>();

  onAllProjectsReceived(): void {
    this.projectDisplay = [...this.allProjects];
  }

  ngAfterViewInit() {
    this.allProjectsSubject.subscribe((projects) => {      
      if (projects.length === 0) {
        this.animationNoImage();
        this.projectDisplay = [...this.allProjects];
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

  displayFormat: number = 0;
  // Change displayFormat
  changeDisplayFormat(changeNumber: number) {
    if (changeNumber != this.displayFormat) {
      // animation
      anime({
        targets: ".contentProject",
        opacity: [1, 0],
        duration: 150,
        easing: 'easeOutQuart',
        complete: () => {
          this.displayFormat = changeNumber;
          setTimeout(() => {
            anime({
              targets: ".contentProject",
              opacity: [0, 1],
              duration: 150,
              easing: 'easeOutQuart'
            });
          }, 0);
        }
      });
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

  // Search
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    this.projectDisplay = this.allProjects.filter(project =>
      project.nameProject.toLowerCase().includes(searchTerm)
    );
  }

  // Box Recent Handlers
  openProject(index: number) {
    this.sendOpenProject.emit(index);
  }

  async onDeleteBoxRecent(index: number) {
    if (index > -1 && index < this.projectDisplay.length) {
      this.projectDisplay.splice(index, 1);
      this.allProjects.splice(index, 1);
      this.allProjectsSubject.next(this.projectDisplay);
      this.localStorageService.removeProject(index);
      this.saveService.clearArrayFiles();
    }
  }

  changeName(event: { index: number, input: string }) {
    this.allProjects[event.index].nameProject = event.input;
    this.projectDisplay = [...this.allProjects];
  }
}
