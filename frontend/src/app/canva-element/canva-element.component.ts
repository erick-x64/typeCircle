import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data.service';
import { fabric } from "fabric";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { API_BASE_URL } from '../../config';
import { LocalStorageService } from '../local-storage.service';
import { SaveService } from '../save.service';

interface Files {
  base64Image: string[];
  selectFile: number;
  canvas: any[];
}

@Component({
  selector: 'app-canva-element',
  templateUrl: './canva-element.component.html',
  styleUrl: './canva-element.component.css'
})
export class CanvaElementComponent {
  @ViewChild('downloadLink') downloadLink: ElementRef | undefined;
  @ViewChild('myCanvas') myCanvas: ElementRef | undefined;

  // config.ts
  apiUrl_imageProcessing: string = `${API_BASE_URL}/api/process-image`;
  apiUrl_textRecognition: string = `${API_BASE_URL}/api/recognize-text`;

  // modified image scale
  scaleFactor: number = 0;

  // Canvas and state management
  canvas: fabric.Canvas | any = new fabric.Canvas('myCanvas', {});
  twoClick: number = 0;
  enableDrawingRect: boolean = false;
  colorReplace: string = "";

  // Default font values
  familyFont: string = "Arial";
  styleFont: "" | "normal" | "italic" | "oblique" = "";
  fontWeight: string = "normal";
  sizeFont: number = 14;
  colorFont: string = "#000000";
  lineHeightFont: number = 1.4;
  positionText: number = 0;

  // Canvas objects
  boxesList: [number, number, number, number][] = [];
  listDataUrlToText: string[] = [];
  textboxes: fabric.Textbox[] = [];
  rects: fabric.Rect[] = [];
  originalViewportTransform: any;

  // File management
  files: Files = {
    base64Image: [],
    selectFile: 0,
    canvas: [],
  };

  constructor(private dataService: DataService, private http: HttpClient, private saveService: SaveService, private localStorageService: LocalStorageService) { }

  // key controls
  private manageKeyListeners(add: boolean): void {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey) {
        fabric.Object.prototype.set({
          hoverCursor: 'move',
        });
      }
    }

    const onKeyUp = (event: KeyboardEvent): void => {
      fabric.Object.prototype.set({
        hoverCursor: 'crosshair',
      });
    }

    if (add) {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    } else {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  }

  // Image setup and controls
  private setupImage(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const base64Image = reader.result as string;
      this.files.base64Image.push(base64Image);

      const dataUrl = e.target.result;

      fabric.Image.fromURL(dataUrl, (img: any) => {
        let newHeight = this.myCanvas?.nativeElement.parentElement.parentElement.offsetHeight;
        let maxWidth = this.myCanvas?.nativeElement.parentElement.parentElement.offsetWidth;
        let scaleFactor = newHeight / img.height;
        let newWidth = img.width * scaleFactor;

        if (newWidth > maxWidth) {
          newWidth = maxWidth - 50;
          scaleFactor = newWidth / img.width;
          newHeight = img.height * scaleFactor;
        };

        this.scaleFactor = scaleFactor;

        img.scale(scaleFactor);

        const existingImage = this.canvas.getObjects('image');
        if (existingImage.length > 0) {
          const existingImg = existingImage[0];
          existingImg.setElement(img.getElement());
          existingImg.scale(scaleFactor);
          this.canvas.renderAll();
        } else {
          this.canvas.setWidth(newWidth);
          this.canvas.setHeight(newHeight);
          this.canvas.add(img);
        }

        this.setupImageControls(img);

        const canvasJson = this.canvas.toDatalessJSON();
        this.files.canvas.push(canvasJson);
        this.files.selectFile = this.files.canvas.length - 1;
      });
    };

    reader.readAsDataURL(file);
  }

  private setupImageControls(img: fabric.Image) {
    img.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
      bl: false,
      br: false,
      tl: false,
      tr: false,
      mtr: false,
    });
    img.selectable = false;

    fabric.Object.prototype.setControlsVisibility({
      mtr: false
    });

    fabric.Textbox.prototype.set({
      hoverCursor: 'crosshair',
      transparentCorners: false,
      borderColor: 'rgba(108, 165, 250)',
      cornerColor: 'rgba(108, 165, 250)',
      cornerStrokeColor: '#FCFCFC',
      cornerStyle: 'rect',
      cornerSize: 9,
      strokeWidth: 0,
      padding: 8,
    });

    fabric.Rect.prototype.set({
      hoverCursor: 'crosshair',
      transparentCorners: false,
      borderColor: 'rgba(108, 165, 250)',
      cornerColor: 'rgba(108, 165, 250)',
      cornerStrokeColor: '#FCFCFC',
      cornerStyle: 'rect',
      cornerSize: 9,
      strokeWidth: 0,
      padding: 0,
    });

    this.canvas.hoverCursor = 'crosshair';
  }

  // Zoom functionality
  private setupZoom() {
    let lastZoomPoint: { x: number, y: number } | null = null;
    let originalViewportTransform: number[] | null = null;
    let originalZoom: number = 1;
    let zoom = this.canvas.getZoom();

    if (!originalViewportTransform) {
      originalViewportTransform = this.canvas.viewportTransform.slice(0);
      originalZoom = zoom;
    }

    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      zoom = this.canvas.getZoom();

      if (!lastZoomPoint) {
        lastZoomPoint = { x: opt.e.offsetX, y: opt.e.offsetY };
      }

      zoom += delta / 200;
      zoom = Math.min(Math.max(zoom, 1), 10);

      if (zoom === 1) {
        this.canvas.zoomToPoint(lastZoomPoint, zoom);
        lastZoomPoint = null;

        // Restaurar o estado original do viewportTransform
        if (originalViewportTransform) {
          this.canvas.viewportTransform = originalViewportTransform.slice(0);
          this.canvas.setZoom(originalZoom);
          this.canvas.requestRenderAll();
        }
      } else {
        this.canvas.zoomToPoint(lastZoomPoint, zoom);
      }

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.setupImageDrag();
  }

  // Image drag functionality
  private setupImageDrag() {
    let isDragging = false;
    let lastPosX: number;
    let lastPosY: number;

    this.canvas.on('mouse:down', (opt: any) => {
      if (opt.e.ctrlKey && this.canvas.getZoom() > 1) {
        isDragging = true;
        const pointer = this.canvas.getPointer(opt.e);
        lastPosX = pointer.x;
        lastPosY = pointer.y;
        this.canvas.selection = false;
      }
    });

    this.canvas.on('mouse:move', (opt: any) => {
      if (isDragging && opt.e.ctrlKey && this.canvas.getZoom() > 1) {
        const pointer = this.canvas.getPointer(opt.e);
        const zoom = this.canvas.getZoom();
        const deltaX = (pointer.x - lastPosX) * (2 * (zoom / 2.2));
        const deltaY = (pointer.y - lastPosY) * (2 * (zoom / 2.2));

        if (!this.originalViewportTransform) {
          this.originalViewportTransform = this.canvas.viewportTransform.slice(0);
        }

        let viewportTransform = this.canvas.viewportTransform.slice(0);

        viewportTransform[4] += deltaX;
        viewportTransform[5] += deltaY;

        this.canvas.viewportTransform = viewportTransform;

        lastPosX = pointer.x;
        lastPosY = pointer.y;

        this.canvas.requestRenderAll();
      }
    });


    this.canvas.on('mouse:up', () => {
      this.canvas.hoverCursor = 'crosshair';

      isDragging = false;
      this.canvas.selection = true;
    });
  }

  // Drawing functionality
  private setupDrawing() {
    let isDrawing = false;
    let startPoint: fabric.Point | null = null;
    let currentTextbox: fabric.Textbox | null = null;
    let currentRect: fabric.Rect | null = null;

    this.canvas.on('mouse:down', (opt: any) => {
      if (!opt.e.ctrlKey) {

        const pointer = this.canvas.getPointer(opt.e);
        const activeObject = this.canvas.getActiveObject();

        this.twoClick = activeObject ? this.twoClick + 1 : 0;

        if (this.twoClick === 2) {
          this.twoClick = 0;
        }

        if (!activeObject && this.twoClick === 0) {
          const img = this.canvas.getObjects()[0];
          if (img && this.isPointerInsideImage(pointer, img)) {
            if (!this.isPointerOverlappingTextbox(pointer)) {
              this.canvas.selection = false;
              isDrawing = true;
              startPoint = new fabric.Point(pointer.x, pointer.y);

              if (this.enableDrawingRect) {
                currentRect = new fabric.Rect({
                  left: pointer.x,
                  top: pointer.y,
                  fill: 'rgba(108, 165, 250, 0.2)',
                  stroke: 'rgba(108, 165, 250, 0.8)',
                  strokeWidth: 1.5,
                  width: 0,
                  height: 0,
                  selectable: false,
                });
                this.rects.push(currentRect);
                this.canvas.add(currentRect);
              } else {
                currentTextbox = this.createTextbox(pointer);
                this.textboxes.push(currentTextbox);
                this.canvas.add(currentTextbox);
                this.canvas.bringToFront(currentTextbox);
                this.setupEventInTextBox(currentTextbox);
              }

              this.canvas.renderAll();
              this.saveCanvasState();

              if (currentTextbox) {
                this.sendBoxCreate(this.textboxes.length - 1, currentTextbox.text ?? '');
              }
            }
          }
        }
      }
    });

    this.canvas.on('mouse:move', (opt: any) => {
      if (!isDrawing || !startPoint) return;

      const pointer = this.canvas.getPointer(opt.e);

      if (this.enableDrawingRect && currentRect) {
        this.updateRectDimensions(startPoint, pointer, currentRect);
      } else if (!this.enableDrawingRect && currentTextbox) {
        this.updateTextboxDimensions(startPoint, pointer, currentTextbox);
      }

      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', (event: any) => {
      this.canvas.selection = false;
      isDrawing = false;
      startPoint = null;

      if (event.target instanceof fabric.Textbox) {
        this.saveCanvasState();
      }

      if (currentTextbox) {
        currentTextbox.set({ backgroundColor: undefined });
        currentTextbox = null;
      }

      if (currentRect) {
        currentRect.set({ selectable: true });
        currentRect = null;
        this.saveCanvasState();
      }
    });
  }

  private isPointerInsideImage(pointer: fabric.Point, img: fabric.Image) {
    return img.left !== undefined && img.top !== undefined && img.width !== undefined && img.height !== undefined &&
      pointer.x >= img.left && pointer.x <= img.left + img.width &&
      pointer.y >= img.top && pointer.y <= img.top + img.height;
  }

  private isPointerOverlappingTextbox(pointer: fabric.Point) {
    const reajustApproximation = 10;
    return this.textboxes.some(textbox => {
      const rect = textbox.getBoundingRect();
      rect.left -= reajustApproximation;
      rect.top -= reajustApproximation;
      rect.width += reajustApproximation * 2;
      rect.height += reajustApproximation * 2;

      return rect.left <= pointer.x && rect.top <= pointer.y &&
        rect.left + rect.width >= pointer.x && rect.top + rect.height >= pointer.y;
    });
  }

  private createTextbox(pointer: fabric.Point): fabric.Textbox {
    return new fabric.Textbox('Type here...', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: this.familyFont,
      fontSize: this.sizeFont,
      fontStyle: this.styleFont as "" | "normal" | "italic" | "oblique",
      fontWeight: this.fontWeight,
      lineHeight: this.lineHeightFont,
      fill: this.colorFont,
      textAlign: this.positionText === 0 ? 'center' : (this.positionText === 1 ? 'left' : 'right')
    });
  }

  private updateRectDimensions(startPoint: fabric.Point, pointer: fabric.Point, rect: fabric.Rect) {
    const width = Math.abs(startPoint.x - pointer.x);
    const height = Math.abs(startPoint.y - pointer.y);

    rect.set({
      width,
      height,
      left: Math.min(startPoint.x, pointer.x),
      top: Math.min(startPoint.y, pointer.y),
    });
    rect.setCoords(); // Update coordinates
  }

  private updateTextboxDimensions(startPoint: fabric.Point, pointer: fabric.Point, textbox: fabric.Textbox) {
    const width = Math.abs(pointer.x - startPoint.x);
    const height = Math.abs(pointer.y - startPoint.y);

    textbox.set({
      left: Math.min(startPoint.x, pointer.x),
      top: Math.min(startPoint.y, pointer.y),
      width: width,
      height: height
    });
  }

  // Event Listeners
  private setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete') {
        const activeObjects = this.canvas.getActiveObjects();

        if (activeObjects.length > 0) {
          activeObjects.forEach((obj: fabric.Object) => {
            if (obj instanceof fabric.Textbox) {
              this.deleteTextbox(obj);
            }
            if (obj instanceof fabric.Rect) {
              this.deleteRect(obj);
            }
          });
        }

        setTimeout(() => {
          this.canvas.discardActiveObject().renderAll();
        }, 0);
      }
    });
  }

  private deleteRect(rect: fabric.Rect) {
    this.canvas.remove(rect);
    const index = this.rects.indexOf(rect);
    if (index !== -1) {
      this.rects.splice(index, 1);
      this.boxesList.splice(index, 1);
    }
  }

  private deleteTextbox(textbox: fabric.Textbox) {
    this.canvas.remove(textbox);
    const index = this.textboxes.indexOf(textbox);
    if (index !== -1) {
      this.textboxes.splice(index, 1);
    }
    this.sendBoxDelete(index);
  }

  private setupEventInTextBox(textbox: fabric.Textbox) {
    textbox.on('changed', () => {
      const index = this.textboxes.indexOf(textbox);
      const text = textbox.text ?? '';
      this.sendBoxChange(index, text.replace(/\n/g, ' '));
      this.saveCanvasState();
    });

    textbox.on('selected', () => {
      this.twoClick = 0;
      const index = this.textboxes.indexOf(textbox);
      this.sendBoxSelect(index, true);
    });

    textbox.on('deselected', () => {
      const index = this.textboxes.indexOf(textbox);
      this.sendBoxSelect(index, false);
    });
  }

  // Utility methods
  private saveCanvasState() {
    const canvasJson = this.canvas.toDatalessJSON();
    this.files.canvas[this.files.selectFile] = canvasJson;
  }

  // Receiving from (app) data service
  ngOnInit(): void {
    this.subscribeToBoxCanvaChange();
    this.subscribeToBoxFontChange();
    this.subscribeToBoxFontDefaultChange();
    this.subscribeToAddImageCanva();
    this.subscribeToSelectFileCanva();
    this.subscribeToRemoveFileCanva();
    this.subscribeToDownloadFileCanva();
    this.subscribeToSaveAllFiles();
    this.subscribeToRequestIdentification();
    this.subscribeToRequestRemoveText();
    this.subscribeToRequestAddBoxText();
    this.subscribeToRequestChangeValuesCircle();
    this.subscribeToEnableDrawingRect();
    this.subscribeToRemoveAreaSelect();
    this.subscribeToBackAreaSelect();
    this.subscribeToRequestAddTextFromImage();
    this.subscribeToOpenProject();
    this.manageKeyListeners(true);
  }

  ngOnDestroy(): void {
    this.manageKeyListeners(false);
  }

  // Subscriptions
  private subscribeToBoxCanvaChange() {
    this.dataService.boxCanvaChange$.subscribe(data => {
      this.updateTextboxText(data.idBox, data.text);
    });
  }

  private subscribeToBoxFontChange() {
    this.dataService.boxFontChange$.subscribe(data => {
      this.setFontDefaults(data);
      this.updateTextboxFont(data);
    });
  }

  private subscribeToBoxFontDefaultChange() {
    this.dataService.boxFontDefaultChange$.subscribe(data => {
      this.setFontDefaults(data);
      this.canvas.renderAll();
    });
  }

  private subscribeToAddImageCanva() {
    this.dataService.addImageCanva$.subscribe(data => {
      this.resetCanvas(data.urlImage);
    });
  }

  private subscribeToSelectFileCanva() {
    this.dataService.selectFileCanva$.subscribe(data => {
      this.selectFileCanvas(data);
    });
  }

  private subscribeToRemoveFileCanva() {
    this.dataService.removeFileCanva$.subscribe(data => {
      this.removeFileCanvas(data);
    });
  }

  private subscribeToDownloadFileCanva() {
    this.dataService.downloadFileCanva$.subscribe(data => {
      this.downloadFileCanvas(data);
    });
  }

  private subscribeToSaveAllFiles() {
    this.dataService.saveAllFiles$.subscribe(data => {
      this.saveAllFiles();
    });
  }

  private subscribeToRequestIdentification() {
    this.dataService.requestIdentification$.subscribe(data => {
      this.requestIdentification();
    });
  }

  private subscribeToRequestRemoveText() {
    this.dataService.requestRemoveText$.subscribe(data => {
      this.requestRemoveText();
    });
  }

  private subscribeToRequestAddBoxText() {
    this.dataService.requestAddBoxText$.subscribe(data => {
      this.requestAddBoxText();
    });
  }

  private subscribeToRequestChangeValuesCircle() {
    this.dataService.requestChangeValuesCircle$.subscribe(data => {
      this.requestChangeValuesCircle(data);
    });
  }

  private subscribeToEnableDrawingRect() {
    this.dataService.enableDrawingRect$.subscribe(data => {
      this.setEnableDrawingRect(data);
    });
  }

  private subscribeToRemoveAreaSelect() {
    this.dataService.sendRemoveAreaSelect$.subscribe(data => {
      this.removeAreaSelect();
    });
  }

  private subscribeToBackAreaSelect() {
    this.dataService.sendBackAreaSelect$.subscribe(data => {
      this.backAreaSelect();
    });
  }

  private subscribeToRequestAddTextFromImage() {
    this.dataService.requestrequestIdentificationRecognition$.subscribe(data => {
      this.requestrequestIdentificationRecognition();
    });
  }

  private subscribeToOpenProject() {
    this.dataService.openProject$.subscribe(data => {
      this.openProject();
    });
  }

  // Handlers
  private updateTextboxText(idBox: number, text: string) {
    this.textboxes[idBox].text = text;
    this.canvas.renderAll();
  }

  private setFontDefaults(data: any) {
    this.familyFont = data.familyFont;
    this.styleFont = data.styleFont;
    this.fontWeight = data.fontWeight;
    this.sizeFont = data.sizeFont;
    this.colorFont = data.colorFont;
    this.lineHeightFont = data.lineHeightFont;
    this.positionText = data.positionText;
  }

  private updateTextboxFont(data: any) {
    const activeObjects = this.canvas.getActiveObjects();

    if (activeObjects.length > 0) {
      activeObjects.forEach((obj: fabric.Object) => {
        if (obj.type === 'textbox') {
          const textbox = obj as fabric.Textbox;

          textbox.set({
            fontFamily: data.familyFont,
            fontStyle: data.styleFont as "" | "normal" | "italic" | "oblique",
            fontWeight: data.fontWeight,
            fontSize: data.sizeFont,
            fill: data.colorFont,
            lineHeight: data.lineHeightFont
          });

          switch (data.positionText) {
            case 0:
              textbox.set({ textAlign: 'center' });
              break;
            case 1:
              textbox.set({ textAlign: 'left' });
              break;
            default:
              textbox.set({ textAlign: 'right' });
          }

          textbox.set({ dirty: true });
        }
      });

      this.canvas.renderAll();
    }
  }

  private resetCanvas(urlImage: File) {
    this.sendBoxAllDelete();
    this.textboxes = [];
    this.boxesList = [];
    this.canvas.dispose();
    this.canvas = new fabric.Canvas('myCanvas', {});
    this.canvas.on('object:added', () => this.saveChangesInLocal());
    this.canvas.on('object:modified', () => this.saveChangesInLocal());
    this.canvas.on('object:moved', () => this.saveChangesInLocal());
    this.setupImage(urlImage);
    this.setupZoom();
    this.setupDrawing();
    this.setupEventListeners();
    this.canvas.renderAll();
  }

  private selectFileCanvas(data: any, isOpenProject?: boolean) {
    if (isOpenProject == undefined) {
      const canvasJson = this.canvas.toDatalessJSON();
      this.files.canvas[this.files.selectFile] = canvasJson;
    };

    this.files.selectFile = data.index;
    this.sendBoxAllDelete();
    this.textboxes = [];
    this.boxesList = [];
    this.canvas.dispose();
    this.canvas = new fabric.Canvas('myCanvas', {});
    this.canvas.on('object:added', () => this.saveChangesInLocal());
    this.canvas.on('object:modified', () => this.saveChangesInLocal());
    this.canvas.on('object:moved', () => this.saveChangesInLocal());
    this.canvas.loadFromJSON(this.files.canvas[data.index], () => {
      this.canvas.getObjects().forEach((obj: any) => {
        if (obj instanceof fabric.Image) {
          if (obj.height && obj.width) {
            const parentElement = this.myCanvas?.nativeElement.parentElement?.parentElement;
            let newHeight = parentElement.offsetHeight;
            const maxWidth = parentElement.offsetWidth;

            let scaleFactor = newHeight / obj.height;
            let newWidth = obj.width * scaleFactor;

            if (newWidth > maxWidth) {
              newWidth = maxWidth;
              scaleFactor = newWidth / obj.width;
              newHeight = obj.height * scaleFactor;
            }

            this.scaleFactor = scaleFactor;
            obj.scale(scaleFactor);

            this.canvas.setWidth(newWidth);
            this.canvas.setHeight(newHeight);

            this.setupImageControls(obj);
          }
        }

        if (obj instanceof fabric.Textbox) {
          this.textboxes.push(obj);
          const index = this.textboxes.indexOf(obj as fabric.Textbox);
          const texto_sendBoxChange = obj.text ?? '';
          this.sendBoxCreate(index, texto_sendBoxChange);
          this.setupEventInTextBox(obj);
        }
      });
      this.setupZoom();
      this.setupDrawing();
      this.setupEventListeners();
    });
    this.canvas.renderAll();
  }

  private removeFileCanvas(data: any) {
    let canvasElement;

    if (this.files.selectFile === 0) {
      if ((this.files.canvas.length - 1) > 0) {
        canvasElement = this.files.canvas[1];
        this.files.selectFile = 1;
      } else {
        this.files.selectFile = 0;
        canvasElement = undefined;
      }
    } else {
      canvasElement = this.files.canvas[this.files.selectFile - 1];
      this.files.selectFile = this.files.selectFile - 1;
    }

    if (canvasElement) {
      this.sendBoxAllDelete();
      this.textboxes = [];
      this.canvas.dispose();
      this.canvas = new fabric.Canvas('myCanvas', {});
      this.canvas.on('object:added', () => this.saveChangesInLocal());
      this.canvas.on('object:modified', () => this.saveChangesInLocal());
      this.canvas.on('object:moved', () => this.saveChangesInLocal());
      this.canvas.loadFromJSON(canvasElement, () => {
        this.canvas.getObjects().forEach((obj: any) => {
          if (obj instanceof fabric.Image) {
            this.setupImageControls(obj);
          }

          if (obj instanceof fabric.Textbox) {
            this.textboxes.push(obj);
            const index = this.textboxes.indexOf(obj as fabric.Textbox);
            const texto_sendBoxChange = obj.text ?? '';
            this.sendBoxCreate(index, texto_sendBoxChange);
          }
        });
        this.setupZoom();
        this.setupDrawing();
        this.setupEventListeners();
      });
    } else {
      this.canvas.dispose();
      this.canvas = new fabric.Canvas('myCanvas', {});
      this.canvas.on('object:added', () => this.saveChangesInLocal());
      this.canvas.on('object:modified', () => this.saveChangesInLocal());
      this.canvas.on('object:moved', () => this.saveChangesInLocal());
    }

    this.canvas.renderAll();
    this.files.canvas.splice(data.index, 1);
    this.files.base64Image.splice(data.index, 1);
  }

  private downloadFileCanvas(data: any) {
    let canvas = new fabric.Canvas('baseDownload', {});
    canvas.loadFromJSON(this.files.canvas[data.index], () => {
      const firstImage = canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;
      if (firstImage && firstImage.width && firstImage.height) {
        const originalImage = firstImage.getElement();
        firstImage.scale(1);
        canvas.setWidth(originalImage.width);
        canvas.setHeight(originalImage.height);

        const scaleX = 1 / this.scaleFactor;
        const scaleY = 1 / this.scaleFactor;

        canvas.getObjects().forEach((obj: any) => {
          if (obj instanceof fabric.Textbox || obj instanceof fabric.Rect) {
            if (obj.left && obj.top && obj.scaleY && obj.scaleX) {
              obj.scaleX *= scaleX;
              obj.scaleY *= scaleY;
              obj.left *= scaleX;
              obj.top *= scaleY;
            }
          }
        });
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
        });
        this.downloadLink!.nativeElement.href = dataURL;
        this.downloadLink!.nativeElement.download = "canvas-image.png";
        this.downloadLink!.nativeElement.click();
      }
    });
  }

  private saveAllFiles() {
    const zip = new JSZip();
    if (this.files.canvas.length > 0) {
      const promises = this.files.canvas.map((canvasData, index) => this.addCanvasToZip(zip, canvasData, `image${index + 1}.png`));
      Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, 'your-images.zip');
        });
      });
    }
  }

  private requestIdentification() {
    if (this.boxesList.length == 0) {
      const firstImage = this.canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;
      if (firstImage) {
        const dataURL = this.canvas.toDataURL({
          format: 'png',
          quality: 1
        });
        this.boxesList = [];
        this.http.post<any>(this.apiUrl_imageProcessing, { data_url: dataURL }).subscribe({
          next: (response) => {
            this.boxesList = response.boxes_list;
            response.boxes_list.forEach((box: any) => {
              const [x, y, w, h] = box;

              // add rects
              const center_x = x + w / 2;
              const center_y = y + h / 2;
              const offset = 10;
              const rx = (w / 2) - offset;
              const ry = (h / 2) - offset;
              const width = 2 * rx;
              const height = 2 * ry;
              const rect = new fabric.Rect({
                left: center_x - rx,
                top: center_y - ry,
                width: width,
                height: height,
                fill: 'rgba(108, 165, 250, 0.2)',
                stroke: 'rgba(108, 165, 250, 0.8)',
                strokeWidth: 1.5
              });
              this.canvas.add(rect);
              this.rects.push(rect);
              this.setupEventInRect(rect, offset);
            });
            this.dataService.operationIdentificationComplete(response.average_score, response.boxes_list.length);
          },
          error: (error) => {
            console.error('Erro ao enviar imagem para o servidor:', error);
            setTimeout(() => {
              this.dataService.operationIdentificationComplete(0, 0);
            }, 500);
          }
        });
      } else {
        setTimeout(() => {
          this.dataService.operationIdentificationComplete(0, 0);
        }, 500);
      }
    } else {
      setTimeout(() => {
        this.dataService.operationIdentificationComplete(0, 0);
      }, 500);
    }
  }

  private requestRemoveText() {
    this.canvas.discardActiveObject().renderAll();
    this.rects.forEach(react => {
      react.set('fill', "transparent");
      react.set('stroke', "transparent");
      react.set('strokeWidth', 0);
      react.set('selectable', false);
    });
    this.canvas.renderAll();
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    this.rects.forEach(react => {
      const left = react.left;
      const top = react.top;
      const width = react.width;
      const height = react.height;

      if (this.colorReplace != "") {
        react.set('fill', this.colorReplace);
      } else {
        const imageData = context.getImageData(left, top, width, height);
        const dominantColor = this.getDominantColor(imageData);
        react.set('fill', dominantColor);
      }

      this.canvas.renderAll();
    });
    this.rects = [];
    this.textboxes.forEach(textbox => {
      textbox!.bringToFront();
    });
  }

  private requestAddBoxText() {
    if (this.boxesList.length > 0 && this.rects.length == 0) {
      this.boxesList.forEach((box: any) => {
        const [x, y, w, h] = box;
        const center_x = x + w / 2;
        const center_y = y + h / 2;
        let textbox = new fabric.Textbox('Type here...', {
          left: center_x,
          top: center_y,
          fontFamily: this.familyFont,
          fontSize: this.sizeFont,
          lineHeight: this.lineHeightFont,
          fill: this.colorFont,
          textAlign: this.positionText === 0 ? 'center' : (this.positionText === 1 ? 'left' : 'right')
        });
        textbox.setControlsVisibility({
          mt: false,
          mb: false,
          mtr: false
        });
        const offsetX = textbox.width! / 2;
        const offsetY = textbox.height! / 2;
        const textboxLeft = center_x - offsetX;
        const textboxTop = center_y - offsetY;
        textbox.set('left', textboxLeft);
        textbox.set('top', textboxTop);
        this.canvas.add(textbox);
        const texto = textbox.text ?? '';
        this.textboxes.push(textbox);
        this.sendBoxCreate(this.textboxes.length - 1, texto);
        this.setupEventInTextBox(textbox);
      });
      this.boxesList = [];
    }
  }

  private requestChangeValuesCircle(data: any) {
    if (this.rects.length > 0) {
      this.rects.forEach(react => {
        this.canvas.remove(react);
      });
      this.rects = [];
      this.boxesList.forEach((box: any) => {
        const [x, y, w, h] = box;
        const center_x = x + w / 2;
        const center_y = y + h / 2;
        const offset = data.offsetCircle;
        const radius = data.radiusCircle;
        let rx = (w / 2) - offset;
        let ry = (h / 2) - offset;
        if (rx < 10) rx = (w / 2) - 10;
        if (ry < 10) ry = (h / 2) - 10;
        const width = 2 * rx;
        const height = 2 * ry;
        const rect = new fabric.Rect({
          left: center_x - rx,
          top: center_y - ry,
          width: width,
          height: height,
          rx: radius,
          ry: radius,
          fill: 'rgba(108, 165, 250, 0.2)',
          stroke: 'rgba(108, 165, 250, 0.8)',
          strokeWidth: 1.5
        });
        this.canvas.add(rect);
        this.rects.push(rect);
        this.setupEventInRect(rect, offset);
      });
      this.canvas.renderAll();
    }
  }

  private setEnableDrawingRect(data: any) {
    this.enableDrawingRect = data.isEnable;
    this.colorReplace = data.colorReplace;
  }

  private removeAreaSelect() {
    this.requestRemoveText();
  }

  private backAreaSelect() {
    const activeObjects = this.canvas.getObjects();

    if (activeObjects.length > 0) {
      activeObjects.forEach((obj: fabric.Object) => {
        if (obj instanceof fabric.Rect) {
          obj.set('fill', "rgba(108, 165, 250, 0.2)");
          obj.set('stroke', "rgba(108, 165, 250, 0.8)");
          obj.set('strokeWidth', 1.5);
          obj.set('selectable', true);
          this.rects.push(obj);
        };
      });

      this.canvas.renderAll();
    }
  };

  private requestrequestIdentificationRecognition() {
    const firstImage = this.canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;

    this.boxesList.forEach(box => {
      const [x, y, w, h] = box;

      // transform positions box in images
      const tempCanvas = document.createElement('canvas');

      const adjustedX = x * (1 / this.scaleFactor);
      const adjustedY = y * (1 / this.scaleFactor);
      const adjustedW = w * (1 / this.scaleFactor);
      const adjustedH = h * (1 / this.scaleFactor);

      tempCanvas.width = adjustedW;
      tempCanvas.height = adjustedH;
      const tempContext = tempCanvas.getContext('2d');

      if (tempContext) {
        tempContext.drawImage(
          firstImage.getElement(),
          adjustedX, adjustedY, adjustedW, adjustedH,
          0, 0, adjustedW, adjustedH
        );

        const dataURL = tempCanvas.toDataURL('image/png', 1.0);
        this.listDataUrlToText.push(dataURL);
      }
    });

    if (this.listDataUrlToText.length > 0) {
      this.http.post<any>(this.apiUrl_textRecognition, { data_urls: this.listDataUrlToText }).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.dataService.operationIdentificationRecognitionComplete(response.recognized_text);
          }, 500);
        },
        error: (error) => {
          console.error('Erro ao enviar imagem para o servidor:', error);
          setTimeout(() => {
            this.dataService.operationIdentificationRecognitionComplete([]);
          }, 500);
        }
      });
    } else {
      setTimeout(() => {
        this.dataService.operationIdentificationRecognitionComplete([]);
      }, 500);
    }
  }

  private openProject() {
    const indexProject = this.localStorageService.getSelectedProjectIndex();
    const clonedProject = JSON.parse(JSON.stringify(this.localStorageService.getProjects()[indexProject].canvaFile));
    const getProject = clonedProject as Files;

    this.files = getProject;

    const data = {
      index: this.files.selectFile
    };
    this.selectFileCanvas(data, true);

    // send to file-box
    let count = 0;
    for (let i = 0; i < getProject.base64Image.length; i++) {
      count++;
      const mimeType = getProject.base64Image[i].substring(getProject.base64Image[i].indexOf(":") + 1, getProject.base64Image[i].indexOf(";"));
      const extension = mimeType.split("/")[1];

      const nameFile = "image-" + count;

      if (getProject.selectFile == i) {
        this.saveService.arrayFiles.push({ pathFile: getProject.base64Image[i], nameFile: nameFile, extensionFile: extension, select: true });
      } else {
        this.saveService.arrayFiles.push({ pathFile: getProject.base64Image[i], nameFile: nameFile, extensionFile: extension, select: false });
      }
    }
  }

  // Handlers functions
  private getDominantColor(imageData: ImageData): string {
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    let dominantColor = '';
    let maxCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const color = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      colorCounts[color] = (colorCounts[color] || 0) + 1;

      if (colorCounts[color] > maxCount) {
        maxCount = colorCounts[color];
        dominantColor = color;
      }
    }

    return `rgb(${dominantColor})`;
  }

  private setupEventInRect(obj: fabric.Rect, offset: number) {
    obj.on('moving', (event) => {
      const index = this.rects.indexOf(obj);

      const w = this.boxesList[index][2];
      const h = this.boxesList[index][2];

      const center_x = obj.left! + (w / 2) - offset;
      const center_y = obj.top! + (h / 2) - offset;

      const x = center_x - w / 2;
      const y = center_y - h / 2;

      this.boxesList[index][0] = x;
      this.boxesList[index][1] = y;
    });
  }

  private addCanvasToZip(zip: JSZip, canvasData: any, filename: string) {
    return new Promise<void>((resolve) => {
      const canvasElement = document.createElement('canvas');
      const canvas = new fabric.Canvas(canvasElement);

      canvas.loadFromJSON(canvasData, () => {
        const firstImage = canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;

        if (firstImage && firstImage.width && firstImage.height) {
          const originalImage = firstImage.getElement();

          firstImage.scale(1);
          canvas.setWidth(originalImage.width);
          canvas.setHeight(originalImage.height);

          const scaleX = 1 / this.scaleFactor;
          const scaleY = 1 / this.scaleFactor;

          canvas.getObjects().forEach((obj: any) => {
            if (obj instanceof fabric.Textbox || obj instanceof fabric.Rect) {
              if (obj.left && obj.top && obj.scaleY && obj.scaleX) {
                obj.scaleX *= scaleX;
                obj.scaleY *= scaleY;

                obj.left *= scaleX;
                obj.top *= scaleY;
              }
            }
          });

          const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
          });

          zip.file(filename, dataURL.split(',')[1], { base64: true });
          resolve();
        } else {
          resolve();
        }
      });
    });
  }

  // Sending to (app) data service
  private sendBoxCreate(idBox: number, text: string) {
    this.dataService.sendBoxCreate(idBox, text);
  }

  private sendBoxChange(idBox: number, text: string) {
    this.dataService.sendBoxChange(idBox, text);
  }

  private sendBoxSelect(idBox: number, isSelect: boolean) {
    this.dataService.sendBoxSelect(idBox, isSelect);

    let positionText = 0;

    if (this.textboxes[idBox].textAlign == "center") {
      positionText = 0;
    } else if (this.textboxes[idBox].textAlign == "left") {
      positionText = 1;
    } else {
      positionText = 2;
    }

    this.dataService.sendConfigBoxSelect(
      idBox,
      this.textboxes[idBox].fontFamily ?? "",
      this.textboxes[idBox].fontSize ?? 0,
      this.textboxes[idBox].fill?.toString() ?? "",
      this.textboxes[idBox].lineHeight ?? 0,
      positionText
    );
  }

  private sendBoxDelete(idBox: number) {
    this.dataService.sendBoxDelete(idBox);
  }

  private sendBoxAllDelete() {
    this.dataService.sendBoxAllDelete();
  }

  // localStorage
  saveChangesInLocal() {
    // get files
    let filesLocalStorage: Files = {
      base64Image: this.files.base64Image.slice(),
      selectFile: this.files.selectFile,
      canvas: [...this.files.canvas],
    };

    // update changes in canva select
    const canvasJson = this.canvas.toDatalessJSON();
    filesLocalStorage.canvas[filesLocalStorage.selectFile] = canvasJson;

    this.addFileToProject(this.localStorageService.getSelectedProjectIndex(), filesLocalStorage);
  }

  addFileToProject(index: number, file: any) {
    this.localStorageService.addCanvasToProject(index, file);
  }

  updateProjectModificationDate(index: number) {
    this.localStorageService.updateModificationDate(index);
  }
}
