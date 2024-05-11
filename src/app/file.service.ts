// file.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    arrayFiles: { pathFile: string, nameFile: string, extensionFile: string, select: boolean }[] = [];

    constructor() { }
}