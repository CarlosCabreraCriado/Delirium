
import { Component, OnInit} from '@angular/core';
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

  constructor(public appService: AppService,private socketService:SocketService, private location: Location){ }

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
      this.appService.setHeroeSeleccionado(0)

      //ABRIR APP DEVELOPER:
      if(this.location.path()=="/desarrollador"){
        this.appService.setEstadoApp("desarrollador");

       //ABRIR APP NORMAL:
      }else{

          //RECONECTAR EL SOCKET:
          if(this.cuenta != null && this.token != null){
            this.socketService.conectarSocket(this.token);
          }else{
            console.log("Cargando INDEX...")
            this.desconectarSocket()
            this.appService.logout();
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
            break;

            case "socketDesconectado":
                console.log("Error en sincronización de socket: ");
                //this.desconectarSocket();
                //this.appService.logout();
                //this.appService.mostrarDialogoReconectar(false);
                this.appService.mostrarDialogoReconectar(true);
            break;

            case "conectado":
                console.warn("Socket Conectado")

                this.cuenta = await this.appService.getCuenta()
                this.token = await this.appService.getToken()

                this.estadoSocket = "Conectado";
                //RECONECTAR EL SOCKET:
                if(this.cuenta != null && this.token != null){
                    console.log("RECONECTANDO SOCKET")
                    this.socketService.enviarSocket('validacion', this.cuenta);
                    this.appService.mostrarDialogoReconectar(false);
                //Determinación de estado APP:
                }else{
                    console.log("Cargando INDEX...")
                    this.desconectarSocket()
                    this.appService.logout();
                }
            break;
          }
       })

       //Suscripcion Socket (SERVER):
       this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
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

                case "solicitudReclutarServer":
                    this.appService.procesarSolicitudReclutar(data);
                break
            }//FIN SWITCH
        });
  } //FIN ONINIT:


    desconectarSocket(){
        this.socketService.desconectar();
    }

} // FIN CLASS












