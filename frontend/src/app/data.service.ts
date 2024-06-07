import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    // Entry changes
    private boxCreateSubject = new Subject<{ idBox: number, text: string }>();
    boxCreate$ = this.boxCreateSubject.asObservable();

    private boxChangeSubject = new Subject<{ idBox: number, text: string }>();
    boxChange$ = this.boxChangeSubject.asObservable();

    private boxDeleteSubject = new Subject<{ idBox: number }>();
    boxDelete$ = this.boxDeleteSubject.asObservable();

    private boxSelectSubject = new Subject<{ idBox: number, isSelect: boolean }>();
    boxSelect$ = this.boxSelectSubject.asObservable();

    private boxDeleteAllSubject = new Subject<{}>();
    boxAllDelete$ = this.boxDeleteAllSubject.asObservable();

    // Canvas object changes
    private boxCanvaChangeSubject = new Subject<{ idBox: number, text: string }>();
    boxCanvaChange$ = this.boxCanvaChangeSubject.asObservable();

    // vou ver ainda
    // private boxCanvaSelectSubject = new Subject<{ idBox: number, text: string }>();
    // boxCanvaSelect$ = this.boxCanvaSelectSubject.asObservable();

    // config font changes
    private boxFontChangeSubject = new Subject<{ idBox: number, familyFont: string, styleFont: string, fontWeight: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number }>();
    boxFontChange$ = this.boxFontChangeSubject.asObservable();

    private boxFontDefaultChangeSubject = new Subject<{ idBox: number, familyFont: string, styleFont: string, fontWeight: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number }>();
    boxFontDefaultChange$ = this.boxFontDefaultChangeSubject.asObservable();

    private sendConfigBoxSelectSubject = new Subject<{ idBox: number, familyFont: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number }>();
    sendConfigBoxSelect$ = this.sendConfigBoxSelectSubject.asObservable();

    // file box
    private addImageCanvaSubject = new Subject<{ urlImage: string }>();
    addImageCanva$ = this.addImageCanvaSubject.asObservable();

    private selectFileCanvaSubject = new Subject<{ index: number }>();
    selectFileCanva$ = this.selectFileCanvaSubject.asObservable();

    private removeFileCanvaSubject = new Subject<{ index: number }>();
    removeFileCanva$ = this.removeFileCanvaSubject.asObservable();

    private downloadFileCanvaSubject = new Subject<{ index: number }>();
    downloadFileCanva$ = this.downloadFileCanvaSubject.asObservable();

    private saveAllFilesSubject = new Subject<{ }>();
    saveAllFiles$ = this.saveAllFilesSubject.asObservable();

    // box ai
    private requestIdentificationSubject = new Subject<{}>();
    requestIdentification$ = this.requestIdentificationSubject.asObservable();

    private requestRemoveTextSubject = new Subject<{}>();
    requestRemoveText$ = this.requestRemoveTextSubject.asObservable();

    private requestAddBoxTextSubject = new Subject<{}>();
    requestAddBoxText$ = this.requestAddBoxTextSubject.asObservable();

    private requestChangeValuesCircleSubject = new Subject<{ offsetCircle: number, radiusCircle: number }>();
    requestChangeValuesCircle$ = this.requestChangeValuesCircleSubject.asObservable();

    private operationIdentificationCompleteSubject = new Subject<{ average_score: number, totalIdentified: number }>();
    operationIdentificationComplete$ = this.operationIdentificationCompleteSubject.asObservable();

    constructor() { }

    // Entry changes
    sendBoxCreate(idBox: number, text: string) {
        this.boxCreateSubject.next({ idBox, text });
    }

    sendBoxChange(idBox: number, text: string) {
        this.boxChangeSubject.next({ idBox, text });
    }

    sendBoxDelete(idBox: number) {
        this.boxDeleteSubject.next({ idBox });
    }

    sendBoxSelect(idBox: number, isSelect: boolean) {
        this.boxSelectSubject.next({ idBox, isSelect });
    }

    sendBoxAllDelete() {
        this.boxDeleteAllSubject.next({});
    }

    // config font changes
    sendConfigBoxSelect(idBox: number, familyFont: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number) {
        this.sendConfigBoxSelectSubject.next({ idBox, familyFont, sizeFont, colorFont, lineHeightFont, positionText });
    }

    boxFontChange(idBox: number, familyFont: string, styleFont: string, fontWeight: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number) {
        this.boxFontChangeSubject.next({ idBox, familyFont, styleFont, fontWeight, sizeFont, colorFont, lineHeightFont, positionText });
    }

    boxFontDefaultChange(idBox: number, familyFont: string, styleFont: string, fontWeight: string, sizeFont: number, colorFont: string, lineHeightFont: number, positionText: number) {
        this.boxFontDefaultChangeSubject.next({ idBox, familyFont, styleFont, fontWeight, sizeFont, colorFont, lineHeightFont, positionText });
    }

    // Canvas object changes
    sendBoxCanvaChange(idBox: number, text: string) {
        this.boxCanvaChangeSubject.next({ idBox, text });
    }

    // file box
    addImageCanva(urlImage: string) {
        this.addImageCanvaSubject.next({ urlImage });
    }

    selectFileCanva(index: number) {
        this.selectFileCanvaSubject.next({ index });
    }

    removeFileCanva(index: number) {
        this.removeFileCanvaSubject.next({ index });
    }

    downloadFileCanva(index: number) {
        this.downloadFileCanvaSubject.next({ index });
    }

    saveAllFiles() {
        this.saveAllFilesSubject.next({ });
    }

    // box ai
    requestIdentification() {
        this.requestIdentificationSubject.next({});
    }

    requestRemoveText() {
        this.requestRemoveTextSubject.next({});
    }

    requestAddBoxText() {
        this.requestAddBoxTextSubject.next({});
    }

    requestChangeValuesCircle(offsetCircle: number, radiusCircle: number) {
        this.requestChangeValuesCircleSubject.next({ offsetCircle, radiusCircle });
    }

    operationIdentificationComplete(average_score: number, totalIdentified: number) {
        this.operationIdentificationCompleteSubject.next({ average_score, totalIdentified });
    }
}
