// save.service.ts
import { Injectable } from '@angular/core';

interface Files {
    selectFile: number;
    canvas: any[];
}

@Injectable({
    providedIn: 'root',
})

export class SaveService {
    // file-box
    arrayFiles: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[] = [];

    constructor() { }
}