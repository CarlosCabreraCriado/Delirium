
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import { AppService } from '../../app.service';
import { InMapService } from './inmap.service';
import { Subscription } from "rxjs";
import { SocketService } from '../socket/socket.service';
import { EventosService} from '../../eventos.service'

@Component({
  selector: 'app-inmap',
  templateUrl: './inmap.component.html',
  styleUrls: ['./inmap.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class InMapComponent implements OnInit {

    public pantalla: string = "Inmap";
    private idCuenta: string;
    private cuenta: any = null;
    public sesion: any;
    public estadoApp: any;

    //Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription = null;

    //Declara Suscripcion InmapService:
    private subscripcionInMapService: Subscription = null;

    //Declara Suscripcion AppService:
    private appServiceSuscripcion: Subscription = null;

    //Declara Suscripcion Evento EventosService:
    private eventosSuscripcion: Subscription = null;

    constructor(private eventosService: EventosService, private cdr: ChangeDetectorRef, private dialog: MatDialog, public appService: AppService, public inmapService: InMapService, private socketService:SocketService) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
        this.appService.estadoApp$.subscribe(estadoApp => {
            this.estadoApp = estadoApp;
        });
    }

    async ngOnInit(){

       console.warn("INICIANDO INMAP")
       this.cuenta = await this.appService.getCuenta();

        //Observar Eventos AppService:
        this.appServiceSuscripcion = this.appService.observarAppService$.subscribe(
            (val) => {
                switch(val){
                    case "actualizarHeroeSeleccionado":
                        //this.inmapService.importarHeroeSeleccionado();
                        //this.inmapService.iniciarInMap();
                        break;
                    case "triggerChangeDetection":
                        //console.error("TRIGGER CHANGE DETECTION")
                        //this.cdr.detectChanges();
                        break;

                    case "reloadInMapService":
                        this.inmapService.iniciarInMap();
                        break;

                    case "triggerChangeDetection":
                        this.cdr.detectChanges();
                        console.error("TRIGGER CHANGE DETECTION")
                        break;
                }
            this.cdr.detectChanges();
        });

        //Suscripcion Socket:
        this.socketSubscripcion = this.socketService.eventoSocket.subscribe(async(data) => {

            if(data.emisor== this.cuenta.usuario){return;}

            switch(data.peticion){

            case "checkSinc":
                if(this.sesion.estadoSesion == "inmap"){
                    this.inmapService.setHashRecibido(data.contenido);
                }
            break;

            case "iniciarPartida":
                this.inmapService.iniciarPartida(data.contenido);
                this.cdr.detectChanges();
                break;

            case "comandoPartida":
                console.warn("Peticion: "+data.peticion);
                console.warn("Comando: "+data.comando);
                if(data.emisor == this.appService.getCuenta().then((result) => {return result.nombre})){break;}
                //Activar Bloqueo de comando Socket:
                this.inmapService.activarComandoSocket();
                switch(data.comando){

                    case "pasarTurno":
                        await this.inmapService.pasarTurno();
                    break;

                    case "realizarMovimientoInMap":
                        if(data.valor["coordX"]==this.sesion.render.inmap.posicion_x && data.valor["coordY"]==this.sesion.render.inmap.posicion_y){
                            console.warn("Movimiento OK")
                            await this.inmapService.realizarMovimientoInMap(data.valor["direccion"]);
                        }else{
                            console.error("Movimiento DESINC");
                            var nuevaCoordenadaX = data.valor["coordX"]
                            var nuevaCoordenadaY = data.valor["coordY"]
                            switch(data.valor["direccion"]){
                                case "NorEste":
                                    nuevaCoordenadaX--;
                                    break;
                                case "SurEste":
                                    nuevaCoordenadaY++;
                                    break;
                                case "SurOeste":
                                    nuevaCoordenadaX++;
                                    break;
                                case "NorOeste":
                                    nuevaCoordenadaY--;
                                    break;
                            }
                            this.inmapService.desplazarCoordenada(nuevaCoordenadaX,nuevaCoordenadaY);
                        }
                    break;

                }
                //Desactivar Bloqueo de comando Socket:
                this.inmapService.desactivarComandoSocket();
            break;

            }
        }); //FIN SOCKET SUSCRIPTION:

        //suscripcion Eventos:
        this.eventosSuscripcion = this.eventosService.eventoInMapEmitter.subscribe((val) => {
            switch(val.comando){
                case "finalizarTutorial":
                    this.inmapService.finalizarTutorial(); 
                    break;
            }
        }); //FIN EVENTO SUSCRIPTION:

        //suscripcion InmapService:
        this.subscripcionInMapService = this.inmapService.subscripcionInMapService.subscribe((val) => {
            switch(val){
                /*
                case "triggerChangeDetection":
                    this.cdr.detectChanges();
                    console.error("TRIGGER CHANGE DETECTION",this.sesion)
                    break;
                    */
            }
        }); //FIN EVENTO SUSCRIPTION:

        //Comprueba el Logueo carga el perfil en Servicio InMap:
        this.inmapService.cargarPerfil().then(() => {

            //Get id Cuenta;
            console.log("Cargando Cuenta");
            this.idCuenta = this.inmapService.getIDCuenta();

        }).then(() => {
            //Importar Datos Generales al servicio Inmap:
            this.inmapService.importarDatosGenerales();

        }).then(() => {
            //Cargar Grupo:
            console.log("Iniciando Inmap: ");
            this.inmapService.iniciarInMap();
        });

        this.cdr.detectChanges();

    }

    ngOnDestroy(){
        console.warn("Destruyendo INMAP");
        this.appServiceSuscripcion.unsubscribe();
        this.socketSubscripcion.unsubscribe();
        this.eventosSuscripcion.unsubscribe();
        this.subscripcionInMapService.unsubscribe();
    }

    reloadDatos(){
        this.appService.reloadDatos();
    }

    abrirConfiguracion(){
        this.appService.mostrarConfiguracion("", {})
        return;
    }

    abrirSocial(){
        this.appService.mostrarSocial("", {})
        return;
    }

    comandoPanelGeneral(pantalla:string){
        this.cambiarPantalla(pantalla);
    }

    comandoPanelControl(comando:any){
        //Si se pulsa el centro accede a mazmorra:
        if(comando=="centro"){
            this.appService.iniciarMazmorra("Bastion");
        }
    }

    cambiarPantalla(nombrePantalla:string):void{
        //Realiza el cambio de pantalla:
        if(this.pantalla == nombrePantalla){
            this.pantalla = 'Inmap';
        }else{
            this.pantalla=nombrePantalla;
        }
        return;
    }

    camelize(texto: string){
        return texto.toLowerCase().charAt(0).toUpperCase() + texto.toLowerCase().slice(1);
    }


}





