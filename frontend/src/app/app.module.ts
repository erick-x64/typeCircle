import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoxEntryTextComponent } from './box-entry-text/box-entry-text.component';
import { ConfigFontBoxComponent } from './config-font-box/config-font-box.component';
import { CanvaElementComponent } from './canva-element/canva-element.component';
import { FileBoxComponent } from './file-box/file-box.component';
import { ElementFileBoxComponent } from './element-file-box/element-file-box.component';
import { BoxAiComponent } from './box-ai/box-ai.component';
import { HomeComponent } from './home/home.component';
import { FontDropdownComponent } from './font-dropdown/font-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    BoxEntryTextComponent,
    ConfigFontBoxComponent,
    CanvaElementComponent,
    FileBoxComponent,
    ElementFileBoxComponent,
    BoxAiComponent,
    HomeComponent,
    FontDropdownComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ColorPickerModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Adicione o CUSTOM_ELEMENTS_SCHEMA aqui
})
export class AppModule { }
