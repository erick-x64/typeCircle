import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class SaveService {
    // arrayFiles
    private arrayFilesSubject = new BehaviorSubject<{ pathFile: string, nameFile: string, extensionFile: string, select: boolean }[]>([]);
    arrayFiles$ = this.arrayFilesSubject.asObservable();

    constructor() { }

    updateArrayFiles(files: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[]): void {
        this.arrayFilesSubject.next(files);
    }

    addFile(file: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }): void {
        this.setAllFilesSelectFalse();
        const currentFiles = this.arrayFilesSubject.value;
        this.updateArrayFiles([...currentFiles, file]);
    }

    clearArrayFiles(): void {
        this.updateArrayFiles([]);
    }

    setFileSelectTrue(index: number): void {
        const updatedFiles = this.arrayFilesSubject.value.map((file, i) => ({
            ...file,
            select: i === index 
        }));
        
        this.arrayFilesSubject.next(updatedFiles);
    }
    
    setAllFilesSelectFalse(): void {
        const updatedFiles = this.arrayFilesSubject.value.map(file => ({
            ...file,
            select: false
        }));
    
        this.arrayFilesSubject.next(updatedFiles);
    }

    // rects
    private rectsSubject = new BehaviorSubject<fabric.Rect[]>([]);
    rects$ = this.rectsSubject.asObservable();
  
    updateRects(rects: fabric.Rect[]) {
      this.rectsSubject.next(rects);
    }
  
    getRects() {
      return this.rectsSubject.getValue();
    }
}
