
//Módulo principal de la aplicación:

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { NgJsonEditorModule } from 'ang-jsoneditor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http"

//Declaración de componentes: 
import { IndexComponent } from './comun/index/index.component';
import { SalaComponent } from './comun/sala/sala.component';
import { DeveloperComponent } from './comun/developer/developer.component';
import { DeveloperCombateComponent } from './comun/developer-combate/developerCombate.component';
import { CargaComponent } from './comun/carga/carga.component';
import { MensajesComponent } from './comun/mensajes/mensajes.component';
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
import { DeveloperToolComponent } from './comun/developer-tool/developer-tool.component';
import { HeroesInfoComponent } from './comun/heroesInfo/heroesInfo.component';
import { DesarrolladorComponent } from './comun/desarrollador/desarrollador.component';

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
    MensajesComponent,
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
    DeveloperToolComponent,
    HeroesInfoComponent,
    DesarrolladorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxElectronModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgJsonEditorModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
