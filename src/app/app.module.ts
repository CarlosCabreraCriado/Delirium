
//Módulo principal de la aplicación:
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from "@angular/common/http"

//Angular material:
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule} from '@angular/material/dialog';    

//Extras
//import { NgxElectronModule } from 'ngx-electron';
import { NgJsonEditorModule } from 'ang-jsoneditor';

//Declaración de componentes: 
import { IndexComponent } from './comun/index/index.component';
import { MazmorraComponent } from './comun/mazmorra/mazmorra.component';
import { CargaComponent } from './comun/carga/carga.component';
import { PausaComponent } from './comun/pausa/pausa.component';
import { AnimacionNumeroComponent } from './comun/animacion-numero/animacion-numero.component';
import { AnimacionEfectoComponent } from './comun/animacion-efecto/animacion-efecto.component';
import { MarcoClaseComponent } from './comun/marco-clase/marco-clase.component';
import { LoggerComponent } from './comun/logger/logger.component';
import { RngComponent } from './comun/rng/rng.component';
import { InterfazComponent } from './comun/interfaz/interfaz.component';
import { EventosComponent } from './comun/eventos/eventos.component';
import { EnemigoComponent } from './comun/enemigo/enemigo.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BugLogComponent } from './comun/bug-log/bug-log.component';
import { AjustesComponent } from './comun/ajustes/ajustes.component';
import { HeroesInfoComponent } from './comun/heroesInfo/heroesInfo.component';
import { HeroesCrearComponent } from './comun/heroesCrear/heroesCrear.component';
import { DialogoComponent } from './comun/dialogos/dialogos.component';
import { ConfiguracionComponent } from './comun/configuracion/configuracion.component';
import { SocialComponent } from './comun/social/social.component';
import { CrearHeroeComponent } from './comun/crear-heroe/crear-heroe.component';
import { BotonComponent } from './comun/boton/boton.component';
import { CheckboxComponent } from './comun/checkbox/checkbox.component';
import { FrameComponent } from './comun/frame/frame.component';
import { InMapComponent } from './comun/inmap/inmap.component';
import { MapaGeneralComponent } from './comun/mapa-general/mapaGeneral.component';
import { CreditoComponent } from './comun/credito/credito.component';
import { HeroeComponent } from './comun/heroe/heroe.component';
import { BarraComponent } from './comun/barra/barra.component';
import { PanelPersonaje } from './comun/panel-personaje/panel-personaje.component';
import { IndicadorPantallaComponent } from './comun/indicador-pantalla/indicador-pantalla.component';
import { EstadisticasGeneralComponent } from './comun/estadisticas-general/estadisticas-general.component';
import { PanelGeneralComponent } from './comun/panel-general/panel-general.component';
import { PanelEquipoComponent } from './comun/panel-equipo/panel-equipo.component';
import { PanelMazmorraComponent } from './comun/panel-mazmorra/panel-mazmorra.component';
import { PanelDiarioComponent } from './comun/panel-diario/panel-diario.component';
import { PanelTiendaComponent } from './comun/panel-tienda/panel-tienda.component';
import { ExperienciaComponent } from './comun/experiencia/experiencia.component';
import { PanelControlComponent } from './comun/panel-control/panel-control.component';
import { PinchZoomComponent } from './comun/pinch-zoom/pinch-zoom.component';

//Componentes de Desarrollo:
import { DesarrolladorComponent } from './comun/desarrollador/desarrollador.component';
import { FormAnimacionesComponent } from './comun/desarrollador/formAnimacionesComponent/formAnimaciones.component';
import { FormBuffComponent } from './comun/desarrollador/formBuffComponent/formBuff.component';
import { FormClasesComponent } from './comun/desarrollador/formClasesComponent/formClases.component';
import { FormEnemigosComponent } from './comun/desarrollador/formEnemigosComponent/formEnemigos.component';
import { FormEventosComponent } from './comun/desarrollador/formEventosComponent/formEventos.component';
import { FormHechizosComponent } from './comun/desarrollador/formHechizosComponent/formHechizos.component';
import { FormMisionesComponent } from './comun/desarrollador/formMisionesComponent/formMisiones.component';
import { FormObjetosComponent } from './comun/desarrollador/formObjetosComponent/formObjetos.component';
import { FormPerksComponent } from './comun/desarrollador/formPerksComponent/formPerks.component';
import { SelectorImagenesComponent } from './comun/desarrollador/selectorImagenerComponent/selectorImagenes.component';
import { PanelSelectorComponent } from './comun/desarrollador/panelSelectorComponent/panelSelector.component';

//Componentes Backend:
import { ElectronService } from './comun/electronService/public_api';

const config: SocketIoConfig = { url: 'http://127.0.0.1:8000', options: {autoConnect: false} };
//const config: SocketIoConfig = { url: 'http://www.carloscabreracriado.com', options: {autoConnect: false} };

//Declaración del módulo:
@NgModule({
    declarations: [
        AppComponent,
        MazmorraComponent,
        IndexComponent,
        CargaComponent,
        PausaComponent,
        AnimacionNumeroComponent,
        AnimacionEfectoComponent,
        MarcoClaseComponent,
        LoggerComponent,
        RngComponent,
        InterfazComponent,
        EventosComponent,
        EnemigoComponent,
        BugLogComponent,
        AjustesComponent,
        HeroesInfoComponent,
        HeroesCrearComponent,
        DesarrolladorComponent,
        DialogoComponent,
        ConfiguracionComponent,
        SocialComponent,
        CrearHeroeComponent,
        BotonComponent,
        FrameComponent,
        CheckboxComponent,
        InMapComponent,
        MapaGeneralComponent,
        CreditoComponent,
        HeroeComponent,
        BarraComponent,
        PanelPersonaje,
        IndicadorPantallaComponent,
        EstadisticasGeneralComponent,
        PanelGeneralComponent,
        PanelEquipoComponent,
        PanelMazmorraComponent,
        PanelDiarioComponent,
        PanelTiendaComponent,
        ExperienciaComponent,
        PanelControlComponent,
        PinchZoomComponent,
        FormAnimacionesComponent,
        FormBuffComponent,
        FormClasesComponent,
        FormEnemigosComponent,
        FormEventosComponent,
        FormHechizosComponent,
        FormMisionesComponent,
        FormObjetosComponent,
        FormPerksComponent,
        SelectorImagenesComponent,
        PanelSelectorComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        //NgxElectronModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgJsonEditorModule,
        SocketIoModule.forRoot(config),
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule
    ],
    providers: [ElectronService],
    bootstrap: [AppComponent]
})
export class AppModule { }
