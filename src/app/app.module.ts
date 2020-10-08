
//Módulo principal de la aplicación:

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { NgJsonEditorModule } from 'ang-jsoneditor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http"

//Angular material:
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';    

//Declaración de componentes: 
import { IndexComponent } from './comun/index/index.component';
import { SalaComponent } from './comun/sala/sala.component';
import { DeveloperComponent } from './comun/developer/developer.component';
import { DeveloperCombateComponent } from './comun/developer-combate/developerCombate.component';
import { CargaComponent } from './comun/carga/carga.component';
import { PausaComponent } from './comun/pausa/pausa.component';
import { AnimacionNumeroComponent } from './comun/animacion-numero/animacion-numero.component';
import { AnimacionEfectoComponent } from './comun/animacion-efecto/animacion-efecto.component';
import { MarcoClaseComponent } from './comun/marco-clase/marco-clase.component';
import { LoggerComponent } from './comun/logger/logger.component';
import { RngComponent } from './comun/rng/rng.component';
import { InterfazComponent } from './comun/interfaz/interfaz.component';
import { EventosComponent } from './comun/eventos/eventos.component';
import { CargarPartidaComponent } from './comun/cargarPartida/cargarPartida.component';
import { HeroesComponent } from './comun/heroes/heroes.component';
import { UnirsePartidaComponent } from './comun/unirsePartida/unirsePartida.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BugLogComponent } from './comun/bug-log/bug-log.component';
import { AjustesComponent } from './comun/ajustes/ajustes.component';
import { HeroesInfoComponent } from './comun/heroesInfo/heroesInfo.component';
import { HeroesCrearComponent } from './comun/heroesCrear/heroesCrear.component';
import { DesarrolladorComponent } from './comun/desarrollador/desarrollador.component';
import { DialogoComponent } from './comun/dialogos/dialogos.component';

const config: SocketIoConfig = { url: 'http://127.0.0.1:8000', options: {} };
//const config: SocketIoConfig = { url: 'http://www.carloscabreracriado.com', options: {} };

//Declaración del módulo:
@NgModule({
  declarations: [
    AppComponent,
    DeveloperComponent,
    DeveloperCombateComponent,
    IndexComponent,
    SalaComponent,
    CargaComponent,
    PausaComponent,
    AnimacionNumeroComponent,
    AnimacionEfectoComponent,
    MarcoClaseComponent,
    LoggerComponent,
    RngComponent,
    InterfazComponent,
    EventosComponent,
    CargarPartidaComponent,
    HeroesComponent,
    UnirsePartidaComponent,
    BugLogComponent,
    AjustesComponent,
    HeroesInfoComponent,
    HeroesCrearComponent,
    DesarrolladorComponent,
    DialogoComponent
  ],
  entryComponents:[
    DialogoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxElectronModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgJsonEditorModule,
    SocketIoModule.forRoot(config),
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
