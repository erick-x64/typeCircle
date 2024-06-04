import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  twoClick: number = 0;

  // values default
  familyFont: string = "Arial";
  sizeFont: number = 14;
  colorFont: string = "#000000";
  lineHeightFont: number = 1.4;
  positionText: number = 0;

  boxes_list: [number, number, number, number][] = [];
  textboxes: fabric.Textbox[] = [];
  rects: fabric.Rect[] = [];
  files: Files = {
    selectFile: 0,
    canvas: [],
  };

  constructor(private dataService: DataService, private http: HttpClient) { }

  // canva
  ngAfterViewInit() {
    this.initializeCanvas();
    // this.setupImage("/assets/teste/teste.png");
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

    this.canvas.on('mouse:down', (opt: any) => {
      const img = this.canvas.getObjects()[0];
      const pointer = this.canvas.getPointer(opt.e);
      const activeObject = this.canvas.getActiveObject();

      if (!activeObject) {
        if (this.textboxes.length == 0) {
          this.twoClick = 0
        } else {
          this.twoClick++
        }

        if (this.twoClick == 2) {
          this.twoClick = 0
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

          if (!overlappingTextbox && !activeObject && this.twoClick == 0) {
            isDrawing = true;
            startPoint = new fabric.Point(pointer.x, pointer.y);

            // Criar uma nova caixa de texto
            currentTextbox = new fabric.Textbox('Type here...', {
              left: pointer.x,
              top: pointer.y,
              fontFamily: this.familyFont,
              fontSize: this.sizeFont,
              lineHeight: this.lineHeightFont,
              fill: this.colorFont,
              textAlign: this.positionText === 0 ? 'center' : (this.positionText === 1 ? 'left' : 'right')
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
            this.setupEventInTextBox(currentTextbox);
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

  setupEventInTextBox(obj: fabric.Textbox) {
    obj.on('changed', (event) => {
      const index = this.textboxes.indexOf(obj as fabric.Textbox);
      const texto_sendBoxChange = obj.text ?? '';
      this.sendBoxChange(index, texto_sendBoxChange.replace(/\n/g, ' '));

      // save textbox
      const canvasJson = this.canvas.toDatalessJSON();
      this.files.canvas[this.files.selectFile] = canvasJson;
    });

    obj.on('selected', (event) => {
      this.twoClick = 0;
      const index = this.textboxes.indexOf(obj as fabric.Textbox);
      this.sendBoxSelect(index, true);
    });

    obj.on('deselected', (event) => {
      const index = this.textboxes.indexOf(obj as fabric.Textbox);
      this.sendBoxSelect(index, false);
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

    this.dataService.requestIdentification$.subscribe(data => {
      const firstImage = this.canvas.getObjects().find((obj: any) => obj instanceof fabric.Image) as fabric.Image;
      // if exist image
      if (firstImage) {
        const dataURL = this.canvas.toDataURL({
          format: 'png',
          quality: 1
        });

        this.boxes_list = [];

        this.http.post<any>('http://localhost:5000/api/process-image', { data_url: dataURL }).subscribe({
          next: (response) => {
            this.boxes_list = response.boxes_list;

            response.boxes_list.forEach((box: any) => {
              // Extrai as coordenadas da caixa
              const [x, y, w, h] = box;

              // Calcula a posição do centro da caixa
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
                rx: rx,
                ry: ry,
                fill: 'rgba(108, 165, 250, 0.2)',
                stroke: 'rgba(108, 165, 250, 0.8)',
                strokeWidth: 1.5
              });

              this.canvas.add(rect);
              this.rects.push(rect);
              this.setupEventInRect(rect, offset);
            })
            this.dataService.operationIdentificationComplete(response.average_score, response.boxes_list.length);
          },
          error: (error) => {
            console.error('Erro ao enviar imagem para o servidor:', error);
          }
        });
      } else {
        setTimeout(() => {
          this.dataService.operationIdentificationComplete(0, 0);
        }, 500);
      }
    });

    this.dataService.requestRemoveText$.subscribe(data => {
      this.canvas.discardActiveObject().renderAll();

      this.rects.forEach(react => {
        // remove style ellipse
        react.set('fill', "transparent");
        react.set('stroke', "transparent");
        react.set('strokeWidth', 0);
        react.set('selectable', false);
      });

      this.canvas.renderAll();

      const context = this.canvas.getContext('2d', { willReadFrequently: true });

      this.rects.forEach(react => {
        // Obtenha as coordenadas e dimensões do elipse
        const left = react.left;
        const top = react.top;
        const width = react.rx! * 2;
        const height = react.ry! * 2;

        // Extraia os dados de pixel da área do elipse
        const imageData = context.getImageData(left, top, width, height);

        // Calcule a cor predominante
        const dominantColor = this.getDominantColor(imageData);

        // Defina a cor do preenchimento do elipse
        react.set('fill', dominantColor);

        this.canvas.renderAll();
      });

      this.rects = [];
    });

    this.dataService.requestAddBoxText$.subscribe(data => {
      if (this.boxes_list.length > 0 && this.rects.length == 0) {
        this.boxes_list.forEach((box: any) => {
          // Extrai as coordenadas da caixa
          const [x, y, w, h] = box;

          // Calcula a posição do centro da caixa
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

          const offsetX = textbox.width! / 2;
          const offsetY = textbox.height! / 2;

          const textboxLeft = center_x - offsetX;
          const textboxTop = center_y - offsetY;

          textbox.set('left', textboxLeft);
          textbox.set('top', textboxTop);

          // Adiciona o textbox ao canvas
          this.canvas.add(textbox);
          const texto = textbox.text ?? '';
          this.textboxes.push(textbox);
          this.sendBoxCreate(this.textboxes.length - 1, texto);
          this.setupEventInTextBox(textbox);
        });

        this.boxes_list = [];
      }
    });

    this.dataService.requestChangeValuesCircle$.subscribe(data => {
      if (this.rects.length > 0) {
        this.rects.forEach(react => {
          this.canvas.remove(react);
        });

        this.rects = [];

        this.boxes_list.forEach((box: any) => {
          // Extrai as coordenadas da caixa
          const [x, y, w, h] = box;

          // Calcula a posição do centro da caixa
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
        })

        this.canvas.renderAll();
      }
    });
  }

  getDominantColor(imageData: ImageData): string {
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
  
  setupEventInRect(obj: fabric.Rect, offset: number) {
    obj.on('moving', (event) => {
      const index = this.rects.indexOf(obj);

      const w = this.boxes_list[index][2];
      const h = this.boxes_list[index][2];

      const center_x = obj.left! + (w / 2) - offset;
      const center_y = obj.top! + (h / 2) - offset;

      const x = center_x - w / 2;
      const y = center_y - h / 2;

      this.boxes_list[index][0] = x;
      this.boxes_list[index][1] = y;
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
