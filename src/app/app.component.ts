
import { Component, OnInit} from '@angular/core';
import { HostListener } from '@angular/core';
import { AppService } from './app.service';
import { SocketService } from './comun/socket/socket.service';
import { Subscription } from "rxjs";

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
  private validacion: any;

  constructor(private appService: AppService,private socketService:SocketService){ }
  

  @HostListener('document:keydown', ['$event'])
  		handleKeyboardEvent(event: KeyboardEvent) { 
  		this.appService.teclaPulsada(event.key);
	}

  async ngOnInit(){

	  this.validacion = await this.appService.getValidacion()

	  //Check reconeccion Socket:
	  if(this.validacion!={} && this.validacion!= undefined){
		this.socketService.enviarSocket('validacion', this.validacion);
	  }

  //Suscripcion Socket:
       this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
         
          switch(data.peticion){
            case "socketDesconectado":
                console.log("Error en sincronización de socket: ");
                this.appService.setValidacion({});
                this.appService.setControl("");
                this.appService.cambiarUrl("index");
                this.appService.mostrarDialogo("Informativo",{contenido:"Se ha producido un error en la sincronización del socket."});
            break;
          }
        });
  }

}
