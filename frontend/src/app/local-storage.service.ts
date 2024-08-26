import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
  id?: number;
  canvaFile: CanvaFile;
  nameProject: string;
  creationDate: string;
  modificationDate: string;
}

interface MyDB extends DBSchema {
  projects: {
    value: Project;
    key: number;
    indexes: { 'by-nameProject': string };
  };
}

@Injectable({
  providedIn: 'root'
})

export class LocalStorageService {

  private dbPromise: Promise<IDBPDatabase<MyDB>>;
  private selectedProjectIndex: number = 0;

  constructor() {
    this.dbPromise = openDB<MyDB>('my-database', 1, {
      upgrade(db) {
        const store = db.createObjectStore('projects', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-nameProject', 'nameProject');
      },
    });
  }

  public async addProject(project: Project): Promise<void> {
    const db = await this.dbPromise;
    await db.add('projects', project);
  }

  public async getProjects(): Promise<Project[]> {
    const db = await this.dbPromise;
    return await db.getAll('projects');
  }

  public async clearProjects(): Promise<void> {
    const db = await this.dbPromise;
    const keys = await db.getAllKeys('projects');
    keys.forEach(async (key) => {
      await db.delete('projects', key);
    });
  }

  public async addCanvasToProject(index: number, file: CanvaFile): Promise<void> {
    const db = await this.dbPromise;
    const projects = await this.getProjects();
    if (index >= 0 && index < projects.length) {
      projects[index].canvaFile = file;
      const { date, time } = this.getFormattedDateTime();
      projects[index].modificationDate = date + ' ' + time;
      await db.put('projects', projects[index]);
    }
  }

  public async changeNameProject(projectIndex: number, nameProject: string): Promise<void> {
    const db = await this.dbPromise;
    const projects = await this.getProjects();
    if (projectIndex >= 0 && projectIndex < projects.length) {
      projects[projectIndex].nameProject = nameProject;
      await db.put('projects', projects[projectIndex]);
    }
  }

  public async updateModificationDate(index: number): Promise<void> {
    const db = await this.dbPromise;
    const projects = await this.getProjects();
    if (index >= 0 && index < projects.length) {
      const { date, time } = this.getFormattedDateTime();
      projects[index].modificationDate = date + ' ' + time;
      await db.put('projects', projects[index]);
    }
  }

  public async removeProject(projectIndex: number): Promise<void> {
    const db = await this.dbPromise;
    const projects = await this.getProjects();
    if (projectIndex >= 0 && projectIndex < projects.length) {
      const project = projects[projectIndex];
      projects.splice(projectIndex, 1);
      await db.delete('projects', project.id!);
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
