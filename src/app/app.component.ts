
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { HostListener } from '@angular/core';
import { AppService } from './app.service';
import { EventosService } from './eventos.service';
import { TriggerService } from './trigger.service';
import { SocketService } from './comun/socket/socket.service';
import { Subscription } from "rxjs";
import { Location } from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent implements OnInit{

  title = 'Delirium 2.0';
  prueba= false;
  cursor= 1;
  DEV= true;

    //Declara Suscripcion Evento Socket:
  private socketSubscripcion: Subscription
  private appServiceSuscripcion: Subscription
  private cuenta: any = null;
  private token: string = null;
  private estadoSocket: string = "Desconectado";
  public estadoApp: any;

  constructor(private cdr: ChangeDetectorRef, public appService: AppService,private socketService:SocketService, private location: Location){
        this.appService.estadoApp$.subscribe(estadoApp => {
            this.estadoApp = estadoApp;
            console.warn("Cambio -->",this.estadoApp.pantalla)
        });
  }

  @HostListener('document:keydown', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent) {
        this.appService.teclaPulsada(event.key);
    }

  async ngOnInit(){

      console.log("Path: ")
      console.log(this.location.path())

      console.log("Mostrando Carga")
      this.appService.mostrarPantallacarga(true);

      //await this.appService.inicializarStorage();

      this.cuenta = await this.appService.getCuenta()
      this.token = await this.appService.getToken()

      //Inicializando Heroe Seleccionado:
      this.estadoApp.heroePropioPerfilIndex = 0;

      //ABRIR APP DEVELOPER:
      if(this.location.path()=="/desarrollador"){
        this.appService.setPantallaApp("desarrollador");

       //ABRIR APP NORMAL:
      }else{

          //RECONECTAR EL SOCKET:
          if(this.cuenta != null && this.cuenta["idCuenta"] != undefined && this.token != null){
            this.socketService.conectarSocket(this.token);
          }else{
            console.log("Cargando INDEX...")
            this.desconectarSocket()
            this.appService.logout();
            this.appService.mostrarDialogoReconectar(false);
          }
      }

       //Suscripcion AppService:
       this.appServiceSuscripcion = this.appService.eventoAppService.subscribe(async (comando) =>{

          switch(comando){
              case "conectarSocket":
                  var token = await this.appService.getToken();
                  console.log("Autentificando Socket: ")
                  console.log("Token: "+token)
                  this.socketService.conectarSocket(token);
                  break;
              case "desconectarSocket":
                  console.log("Desconectando Socket: ")
                  this.desconectarSocket();
                  break;
            }

        });

       //Suscripcion Socket (INTERNO):
       this.socketSubscripcion = this.socketService.emisorSocketInterno.subscribe(async (data) =>{
          switch(data.peticion){

            case "authError":
                console.warn("Error AUTH")
                this.desconectarSocket();
                this.appService.logout();
                this.appService.mostrarDialogoReconectar(false);
                    this.cdr.detectChanges();
            break;

            case "socketDesconectado":
                console.log("Error en sincronización de socket: ");
                //this.desconectarSocket();
                //this.appService.logout();
                //this.appService.mostrarDialogoReconectar(false);
                this.token = await this.appService.getToken()
                if(this.token != null){
                    this.appService.mostrarDialogoReconectar(true);
                }
            break;

            case "conectado":
                console.warn("Socket Conectado")

                this.cuenta = await this.appService.getCuenta()
                this.token = await this.appService.getToken()

                console.warn(this.cuenta,this.token);

                this.estadoSocket = "Conectado";
                //RECONECTAR EL SOCKET:
                if(this.cuenta != null && this.cuenta["idCuenta"] != undefined && this.token != null){
                    console.log("RECONECTANDO SOCKET")
                    this.socketService.enviarSocket('validacion', this.cuenta);
                    this.appService.mostrarDialogoReconectar(false);
                    this.cdr.detectChanges();

                //Determinación de estado APP:
                }else{
                    console.log("Cargando INDEX...")
                    this.desconectarSocket()
                    this.appService.logout();
                    this.appService.mostrarDialogoReconectar(false);
                }
            break;
          }
       })

       //Suscripcion Socket (SERVER):
       this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{

            if(data.emisor==this.cuenta.usuario){
                console.warn("Evitando Rebote Comando Socket...")
                return;
            }

            this.appService.activarComandoSocket();
            console.warn("RECIBIENDO EN APP COMP: ",data);
            switch(data.peticion){
                case "socketDesconectado":
                    console.log("Error en sincronización de socket: ");
                    this.desconectarSocket();
                    this.appService.logout();
                    this.appService.mostrarDialogo("Informativo",{contenido:"Se ha producido un error en la sincronización del socket."});
                break;
                case "conectado":
                    this.socketService.enviarSocket('validacion', this.cuenta);
                break

                case "entrarMundoServer":
                    this.appService.entrarMundo();
                    break

                case "serverEnviaSesion":
                    this.appService.iniciaSesion(data.contenido, data.forzarReload)
                break

                case "serverEnviaJugador":
                    this.appService.actualizarJugador(data.contenido, data.indexJugadorSesion, data.indexHeroeSesion)
                break

                case "solicitudReclutarServer":
                    this.appService.procesarSolicitudReclutar(data);
                break

                case "actualizarHechizosEquipados":
                    this.appService.setHechizosEquipados(data.personajeIndex,data.hechizosEquipadosIDs);
                    break;



            }//FIN SWITCH
            this.appService.desactivarComandoSocket();
        });

        this.cdr.detectChanges();

  } //FIN ONINIT:


    desconectarSocket(){
        this.socketService.desconectar();
    }

} // FIN CLASS












