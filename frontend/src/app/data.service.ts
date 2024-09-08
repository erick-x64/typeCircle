import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';

interface TranslationFile {
    text: string;
    textTranslate: string;
}

interface BoxConfig {
    idBox: number;
    familyFont: string;
    styleFont: string;
    fontWeight: string;
    sizeFont: number;
    colorFont: string;
    lineHeightFont: number;
    positionText: number;
}


@Injectable({
    providedIn: 'root'
})
export class DataService {
    // Subjects grouped by functionality
    private subjects = {
        // box-entry-text
        entry: {
            create: new Subject<{ idBox: number, text: string }>(),
            change: new Subject<{ idBox: number, text: string }>(),
            delete: new Subject<{ idBox: number }>(),
            select: new Subject<{ idBox: number, isSelect: boolean }>(),
            deleteAll: new Subject<{}>()
        },

        // canva-element
        canvas: {
            change: new Subject<{ idBox: number, text: string }>(),
            translation: new ReplaySubject<{ dataTranslations: TranslationFile[] }>(),
        },

        fontConfig: {
            change: new Subject<BoxConfig>(),
            defaultChange: new Subject<BoxConfig>(),
            select: new Subject<{ idBox: number, familyFont: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number }>()
        },

        // file-box
        fileBox: {
            addImage: new Subject<{ urlImage: File, debugMode: boolean }>(),
            selectFile: new Subject<{ index: number }>(),
            removeFile: new Subject<{ index: number }>(),
            downloadFile: new Subject<{ index: number }>(),
            saveAllFiles: new Subject<{}>()
        },

        // other-tools
        tools: {
            enableDrawingRect: new Subject<{ isEnable: boolean, colorReplace: string }>(),
            removeAreaSelect: new Subject<{}>(),
            backAreaSelect: new Subject<{}>()
        },

        // box-ai
        ai: {
            requestIdentification: new Subject<{}>(),
            enableOcrBox: new Subject<{ enableOcrBox: boolean }>(),
            removeText: new Subject<{}>(),
            addBoxText: new Subject<{}>(),
            changeValuesCircle: new Subject<{ offsetCircle: number, radiusCircle: number }>(),
            identificationRecognition: new Subject<{}>(),
            identificationRecognitionComplete: new Subject<{ recognizedText: string[] }>(),
            identificationComplete: new Subject<{ average_score: number, totalIdentified: number }>()
        },

        project: {
            open: new Subject<{}>()
        },

        // table-translate
        ocr: {
            requestOcrRect: new Subject<{ indexRect: number, langInput: string }>(),
            requestOcrRectComplete: new Subject<{ ocrString: string }>(),
            requestReplacement: new Subject<{ indexRect: number, inputOcr: string, outputTranslate: string }>()
        }
    };

    constructor() { }

    // General event sending functions
    private next(subject: Subject<any>, data: any) {
        subject.next(data);
    }

    // Methods grouped by functionality:

    // Entry changes
    sendBoxCreate(idBox: number, text: string) {
        this.next(this.subjects.entry.create, { idBox, text });
    }

    sendBoxChange(idBox: number, text: string) {
        this.next(this.subjects.entry.change, { idBox, text });
    }

    sendBoxDelete(idBox: number) {
        this.next(this.subjects.entry.delete, { idBox });
    }

    sendBoxSelect(idBox: number, isSelect: boolean) {
        this.next(this.subjects.entry.select, { idBox, isSelect });
    }

    sendBoxAllDelete() {
        this.next(this.subjects.entry.deleteAll, {});
    }

    // Canvas object changes
    sendBoxCanvaChange(idBox: number, text: string) {
        this.next(this.subjects.canvas.change, { idBox, text });
    }

    // FileBox object changes
    addImageCanva(urlImage: File, debugMode: boolean) {
        this.next(this.subjects.fileBox.addImage, { urlImage, debugMode });
    }

    selectFileCanva(index: number) {
        this.next(this.subjects.fileBox.selectFile, { index });
    }

    removeFileCanva(index: number) {
        this.next(this.subjects.fileBox.removeFile, { index });
    }

    downloadFileCanva(index: number) {
        this.next(this.subjects.fileBox.downloadFile, { index });
    }

    saveAllFiles() {
        this.next(this.subjects.fileBox.saveAllFiles, {});
    }

    // Font config
    sendConfigBoxSelect(idBox: number, familyFont: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number) {
        this.next(this.subjects.fontConfig.select, { idBox, familyFont, sizeFont, colorFont, lineHeightFont, positionText });
    }

    boxFontChange(config: BoxConfig) {
        this.next(this.subjects.fontConfig.change, config);
    }

    boxFontDefaultChange(config: BoxConfig) {
        this.next(this.subjects.fontConfig.defaultChange, config);
    }

    // Other tools
    enableDrawingRect(isEnable: boolean, colorReplace: string) {
        this.next(this.subjects.tools.enableDrawingRect, { isEnable, colorReplace });
    }

    sendRemoveAreaSelect() {
        this.next(this.subjects.tools.removeAreaSelect, {});
    }

    sendBackAreaSelect() {
        this.next(this.subjects.tools.backAreaSelect, {});
    }

    // AI related methods
    requestIdentification() {
        this.next(this.subjects.ai.requestIdentification, {});
    }

    requestEnableOcrBox(enableOcrBox: boolean) {
        this.next(this.subjects.ai.enableOcrBox, { enableOcrBox });
    }

    requestRemoveText() {
        this.next(this.subjects.ai.removeText, {});
    }

    requestAddBoxText() {
        this.next(this.subjects.ai.addBoxText, {});
    }

    requestChangeValuesCircle(offsetCircle: number, radiusCircle: number) {
        this.next(this.subjects.ai.changeValuesCircle, { offsetCircle, radiusCircle });
    }

    requestIdentificationRecognition() {
        this.next(this.subjects.ai.identificationRecognition, {});
    }

    operationIdentificationComplete(average_score: number, totalIdentified: number) {
        this.next(this.subjects.ai.identificationComplete, { average_score, totalIdentified });
    }

    operationIdentificationRecognitionComplete(recognizedText: string[]) {
        this.next(this.subjects.ai.identificationRecognitionComplete, { recognizedText });
    }

    // Project
    sendOpenProject() {
        this.next(this.subjects.project.open, {});
    }

    // Translation
    sendTranslationsData(dataTranslations: TranslationFile[]) {
        this.next(this.subjects.canvas.translation, dataTranslations );
    }

    // OCR requests
    requestOcrRect(indexRect: number, langInput: string) {
        this.next(this.subjects.ocr.requestOcrRect, { indexRect, langInput });
    }

    requestOcrRectComplete(ocrString: string) {
        this.next(this.subjects.ocr.requestOcrRectComplete, { ocrString });
    }

    requestReplacement(indexRect: number, inputOcr: string, outputTranslate: string) {
        this.next(this.subjects.ocr.requestReplacement, { indexRect, inputOcr, outputTranslate });
    }
}
