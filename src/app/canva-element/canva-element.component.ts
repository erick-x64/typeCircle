import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { fabric } from "fabric";

interface Files {
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


  canvas: any;

  // values default
  familyFont: string = "Arial";
  sizeFont: number = 14;
  colorFont: string = "#000000";
  lineHeightFont: number = 1.4;
  positionText: number = 0;

  textboxes: fabric.Textbox[] = [];
  files: Files = {
    selectFile: 0,
    canvas: [],
  };

  constructor(private dataService: DataService) { }

  // canva
  ngAfterViewInit() {
    this.initializeCanvas();
    // this.setupImage("../../assets/teste/teste.png");
  }

  initializeCanvas() {
    this.canvas = new fabric.Canvas('myCanvas', {});
  }

  setupImage(pathImage: string) {
    fabric.Image.fromURL(pathImage, (img: any) => {
      const newHeight = 745;
      const scaleFactor = newHeight / img.height;
      const newWidth = img.width * scaleFactor;
      img.scale(scaleFactor);

      // Verifique se já existe uma imagem no canvas
      const existingImage = this.canvas.getObjects('image');
      if (existingImage.length > 0) {
        // Se uma imagem já existe, substitua-a
        const existingImg = existingImage[0];
        existingImg.setElement(img.getElement());
        existingImg.scale(scaleFactor);
        this.canvas.renderAll();
      } else {
        // Se não houver uma imagem, adicione-a
        this.canvas.setWidth(newWidth);
        this.canvas.setHeight(newHeight);
        this.canvas.add(img);
      }

      this.setupImageControls(img);

      const canvasJson = this.canvas.toDatalessJSON();
      this.files.canvas.push(canvasJson);
      this.files.selectFile = this.files.canvas.length - 1;
    });
  }

  setupImageControls(img: fabric.Image) {
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

    fabric.Object.prototype.set({
      transparentCorners: false,
      borderColor: 'rgba(108, 165, 250)',
      cornerColor: 'rgba(108, 165, 250)',
      cornerStrokeColor: '#FCFCFC',
      cornerStyle: 'rect',
      cornerSize: 9,
      strokeWidth: 0,
      padding: 8,
    });
  }

  setupZoom() {
    let lastZoomPoint: { x: number, y: number } | null = null;

    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();

      if (!lastZoomPoint) {
        lastZoomPoint = { x: opt.e.offsetX, y: opt.e.offsetY };
      }

      zoom = zoom + delta / 200;

      if (zoom > 10) zoom = 0.5;
      if (zoom < 1) zoom = 1;

      if (zoom === 1) {
        this.canvas.zoomToPoint(lastZoomPoint, zoom);
        lastZoomPoint = null;

        const img = this.canvas.getObjects()[0];
        img.center();

      } else {
        this.canvas.zoomToPoint(lastZoomPoint, zoom);
      }

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  setupDrawing() {
    let isDrawing = false;
    let startPoint: fabric.Point | null = null;
    let currentTextbox: fabric.Textbox | null = null;
    let twoClick = 0;

    this.canvas.on('mouse:down', (opt: any) => {
      const img = this.canvas.getObjects()[0];
      const pointer = this.canvas.getPointer(opt.e);
      const activeObject = this.canvas.getActiveObject();

      if (!activeObject) {
        if (this.textboxes.length == 0) {
          twoClick = 0
        } else {
          twoClick++
        }

        if (twoClick == 2) {
          twoClick = 0
        }
      }

      // Verificar se há uma imagem no canvas
      if (img instanceof fabric.Image) {
        // Verificar se o ponto do mouse está dentro dos limites da imagem
        if (img.left !== undefined && img.top !== undefined && img.width !== undefined && img.height !== undefined &&
          pointer.x >= img.left && pointer.x <= img.left + img.width &&
          pointer.y >= img.top && pointer.y <= img.top + img.height) {

          const reajustApproximation = 10;

          const overlappingTextbox = this.textboxes.find(textbox => {
            const textboxRect = textbox.getBoundingRect();

            textboxRect.left -= reajustApproximation;
            textboxRect.top -= reajustApproximation;
            textboxRect.width += reajustApproximation * 2;
            textboxRect.height += reajustApproximation * 2;

            return textboxRect.left <= pointer.x && textboxRect.top <= pointer.y &&
              textboxRect.left + textboxRect.width >= pointer.x && textboxRect.top + textboxRect.height >= pointer.y;
          });

          if (!overlappingTextbox && !activeObject && twoClick == 0) {
            isDrawing = true;
            startPoint = new fabric.Point(pointer.x, pointer.y);

            // Criar uma nova caixa de texto
            currentTextbox = new fabric.Textbox('Digite aqui...', {
              left: pointer.x,
              top: pointer.y,
              fontFamily: this.familyFont,
              fontSize: this.sizeFont,
              lineHeight: this.lineHeightFont,
              fill: this.colorFont
            });

            currentTextbox.setControlsVisibility({
              mt: false,
              mb: false,
              mtr: false
            });

            // Adicionar a caixa de texto ao canvas
            this.textboxes.push(currentTextbox);
            this.canvas.add(currentTextbox);
            this.canvas.bringToFront(currentTextbox);
            this.canvas.renderAll();

            // save textbox
            const canvasJson = this.canvas.toDatalessJSON();
            this.files.canvas[this.files.selectFile] = canvasJson;

            // sendBoxCreate
            const texto = currentTextbox.text ?? '';
            this.sendBoxCreate(this.textboxes.length - 1, texto);

            // sendBoxCreate
            let obj = currentTextbox;
            if (obj !== null) {
              obj.on('changed', (event) => {
                const index = this.textboxes.indexOf(obj as fabric.Textbox);
                const texto_sendBoxChange = obj.text ?? '';
                this.sendBoxChange(index, texto_sendBoxChange.replace(/\n/g, ' '));

                // save textbox
                const canvasJson = this.canvas.toDatalessJSON();
                this.files.canvas[this.files.selectFile] = canvasJson;
              });

              obj.on('selected', (event) => {
                const index = this.textboxes.indexOf(obj as fabric.Textbox);
                this.sendBoxSelect(index, true);
              });

              obj.on('deselected', (event) => {
                const index = this.textboxes.indexOf(obj as fabric.Textbox);
                this.sendBoxSelect(index, false);
              });
            }
          }
        }
      }
    });

    this.canvas.on('mouse:move', (opt: any) => {
      if (!isDrawing || !startPoint || !currentTextbox) {
        return;
      }


      const pointer = this.canvas.getPointer(opt.e);
      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);

      currentTextbox.set({
        left: Math.min(startPoint.x, pointer.x),
        top: Math.min(startPoint.y, pointer.y),
        width: width,
        height: height
      });

      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', (event: any) => {
      isDrawing = false;
      startPoint = null;

      if (event.target instanceof fabric.Textbox) {
        // save textbox
        const canvasJson = this.canvas.toDatalessJSON();
        this.files.canvas[this.files.selectFile] = canvasJson;
      }

      if (currentTextbox) {

        currentTextbox.set({
          backgroundColor: undefined,
        });
      }

      currentTextbox = null;
    });
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Delete') {
        const activeObject = this.canvas.getActiveObject();

        if (activeObject instanceof fabric.Textbox) {
          // Remover o círculo do canvas
          this.canvas.remove(activeObject);

          // Remover o círculo do array
          const index = this.textboxes.indexOf(activeObject);
          if (index !== -1) {
            this.textboxes.splice(index, 1);
          }

          this.sendBoxDelete(index);
        }
      }
    });
  }

  // dataService
  ngOnInit() {
    this.dataService.boxCanvaChange$.subscribe(data => {
      this.textboxes[data.idBox].text = data.text;
      this.canvas.renderAll();
    });

    this.dataService.boxFontChange$.subscribe(data => {
      // set default values
      this.familyFont = data.familyFont;
      this.sizeFont = data.sizeFont;
      this.colorFont = data.colorFont;
      this.lineHeightFont = data.lineHeightFont;
      this.positionText = data.positionText;

      // set current values in box
      this.textboxes[data.idBox].fontFamily = data.familyFont;
      this.textboxes[data.idBox].fontSize = data.sizeFont;
      this.textboxes[data.idBox].fill = data.colorFont;
      this.textboxes[data.idBox].lineHeight = data.lineHeightFont;

      if (data.positionText == 0) {
        this.textboxes[data.idBox].textAlign = "center";
      } else if (data.positionText == 1) {
        this.textboxes[data.idBox].textAlign = "left";
      } else {
        this.textboxes[data.idBox].textAlign = "right";
      }

      this.canvas.renderAll();
    });

    this.dataService.boxFontDefaultChange$.subscribe(data => {
      // set default values
      this.familyFont = data.familyFont;
      this.sizeFont = data.sizeFont;
      this.colorFont = data.colorFont;
      this.lineHeightFont = data.lineHeightFont;
      this.positionText = data.positionText;
      this.canvas.renderAll();
    });

    this.dataService.addImageCanva$.subscribe(data => {
      this.canvas.dispose();
      this.canvas = new fabric.Canvas('myCanvas', {});
      this.setupImage(data.urlImage);
      this.setupZoom();
      this.setupDrawing();
      this.setupEventListeners();

      this.canvas.renderAll();
    });

    this.dataService.selectFileCanva$.subscribe(data => {
      // save
      const canvasJson = this.canvas.toDatalessJSON();
      this.files.canvas[this.files.selectFile] = canvasJson;

      this.files.selectFile = data.index;

      // send remove textboxes in app
      this.sendBoxAllDelete();
      this.textboxes = [];

      this.canvas.dispose();
      this.canvas = new fabric.Canvas('myCanvas', {});
      this.canvas.loadFromJSON(this.files.canvas[data.index], () => {
        // setupImageControls
        this.canvas.getObjects().forEach((obj: any) => {
          if (obj instanceof fabric.Image) {
            this.setupImageControls(obj);
          };

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

      this.canvas.renderAll();
    });

    this.dataService.removeFileCanva$.subscribe(data => {
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
        // send remove textboxes in app
        this.sendBoxAllDelete();
        this.textboxes = [];

        this.canvas.dispose();
        this.canvas = new fabric.Canvas('myCanvas', {});
        this.canvas.loadFromJSON(canvasElement, () => {
          // setupImageControls
          this.canvas.getObjects().forEach((obj: any) => {
            if (obj instanceof fabric.Image) {
              this.setupImageControls(obj);
            };

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
      }

      this.canvas.renderAll();

      this.files.canvas.splice(data.index, 1);
    });

    this.dataService.downloadFileCanva$.subscribe(data => {
      let canvas = new fabric.Canvas('baseDownload', {});

      canvas.loadFromJSON(this.files.canvas[data.index], () => {
        const firstImage = canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;

        if (firstImage && firstImage.width && firstImage.height) {
          const originalImage = firstImage.getElement();

          // revert size original image
          firstImage.scale(1);
          canvas.setWidth(originalImage.width);
          canvas.setHeight(originalImage.height);

          // revert fascaleFactor in Textbox
          const scaleFactor = 745 / originalImage.height;
          const scaleX = 1 / scaleFactor;
          const scaleY = 1 / scaleFactor;

          canvas.getObjects().forEach((obj: any) => {
            if (obj instanceof fabric.Textbox) {  
              if (obj.left && obj.top && obj.scaleY && obj.scaleX) {
                obj.scaleX *= scaleX;
                obj.scaleY *= scaleY;

                obj.left *= scaleX;
                obj.top *= scaleY;
              }
            }
          });

          // save
          const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
          });

          this.downloadLink!.nativeElement.href = dataURL;
          this.downloadLink!.nativeElement.download = "canvas-image.png";
          this.downloadLink!.nativeElement.click();
        }
      });

    });
  }


  // send app
  sendBoxCreate(idBox: number, text: string) {
    this.dataService.sendBoxCreate(idBox, text);
  }

  sendBoxChange(idBox: number, text: string) {
    this.dataService.sendBoxChange(idBox, text);
  }

  sendBoxSelect(idBox: number, isSelect: boolean) {
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

  sendBoxDelete(idBox: number) {
    this.dataService.sendBoxDelete(idBox);
  }

  sendBoxAllDelete() {
    this.dataService.sendBoxAllDelete();
  }
}
