import { Injectable } from '@angular/core';

interface Project {
  canvaFile: {};
  nameProject: string;
  creationDate: string;
  modificationDate: string;
}

interface Files {
  selectFile: number;
  canvas: any[];
}

@Injectable({
  providedIn: 'root'
})

export class LocalStorageService {

  private selectedProjectIndex: number = 0;

  constructor() { }

  public setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public addProject(project: Project): void {
    let projects = this.getItem('projects') as Project[];
    if (!projects) {
      projects = [];
    }

    projects.push(project);
    this.setItem('projects', projects);
  }

  public getProjects(): Project[] {
    return this.getItem('projects') as Project[];
  }

  public clearProjects(): void {
    this.removeItem('projects');
  }

  public addCanvasToProject(index: number, file: Files): void {
    const projects = this.getProjects();
    if (index >= 0 && index < projects.length) {
      projects[index].canvaFile = file;
      const { date, time } = this.getFormattedDateTime();
      projects[index].modificationDate = date + ' ' + time;
      this.setItem('projects', projects);
    }
  }

  public changeNameProject(projectIndex: number, nameProject: string): void {
    const projects = this.getProjects();
    if (projectIndex >= 0 && projectIndex < projects.length) {
      projects[projectIndex].nameProject = nameProject;
      this.setItem('projects', projects);
    }
  }

  public updateModificationDate(index: number): void {
    const projects = this.getProjects();
    if (index >= 0 && index < projects.length) {
      const { date, time } = this.getFormattedDateTime();
      projects[index].modificationDate = date + ' ' + time;
      this.setItem('projects', projects);
    }
  }

  public removeProject(projectIndex: number): void {
    const projects = this.getProjects();
    if (projectIndex >= 0 && projectIndex < projects.length) {
      projects.splice(projectIndex, 1);
      this.setItem('projects', projects);
    }
  }

  public setSelectedProject(index: number): void {
    this.selectedProjectIndex = index;
  }

  public getSelectedProjectIndex(): number {
    return this.selectedProjectIndex;
  }

  // auxiliary function
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
}
