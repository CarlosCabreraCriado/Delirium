
import { Component, OnInit} from '@angular/core';
import { HostListener } from '@angular/core';
import { AppService } from './app.service';
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
            console.log("RECONECTANDO SOCKET")
            this.socketService.enviarSocket('validacion', this.cuenta);
            this.socketService.conectarSocket(this.token);

          //Determinación de estado APP:
          }else{ 
            console.log("Cargando INDEX...")
            this.desconectarSocket()
            this.appService.logout();
          }
      }

       //Suscripcion AppService:
       this.appServiceSuscripcion = this.appService.eventoAppService.subscribe((comando) =>{

          switch(comando){
              case "login":
                  var token = this.appService.token
                  console.log("Autentificando Socket: ")
                  console.log("Token: "+token)
                  this.socketService.conectarSocket(token);
                  break;
              case "logout":
                  console.log("Desconectando Socket: ")
                  this.desconectarSocket();
                  break;
            }
          
        });

       //Suscripcion Socket (INTERNO):
       this.socketSubscripcion = this.socketService.emisorEventoSocket.subscribe((data) =>{
          switch(data.peticion){
            case "socketDesconectado":
                console.log("Error en sincronización de socket: ");
                this.desconectarSocket();
                this.appService.logout();
                this.appService.mostrarDialogo("Informativo",{contenido:"Se ha producido un error en la sincronización del socket."});
            break;
          }
       })

       //Suscripcion Socket (SERVER):
       this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
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
                case "serverEnviaSesion":
                    console.log("INICIANDO SESION:")
                    console.log(data.contenido)
                    this.iniciaSesion(data.contenido)
                break
            }//FIN SWITCH
        });
  } //FIN ONINIT:

    iniciaSesion(sesion: any){
        this.appService.setSesion(sesion);

        //Carga el INMAP:
        if(sesion.estadoSesion=="inmap"){
            console.log("Cargando INMAP...")
            this.appService.setEstadoApp("inmap");
        }
             //this.appService.iniciarMazmorra("MazmorraSnack");

    }

    desconectarSocket(){
        this.socketService.desconectar();
    }

} // FIN CLASS












