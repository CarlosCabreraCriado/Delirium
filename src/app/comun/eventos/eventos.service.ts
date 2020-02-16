
import { Injectable, Input, Output, EventEmitter } from '@angular/core';
import { DeveloperCombateService } from '../developer-combate/developerCombate.service';
import { AppService} from '../../app.service'
import { Eventos } from './eventos.class';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class EventosService {

	public eventos: any;
	public eventoActivo: any;
	public dialogo: any= [];
	public codigo: number = 1;
	public personaje1: string = "narrador";
	public personaje2: string = "ingeniera";
	private mostrarEvento:boolean= false;
	private estado:string="default";

	// Observable string sources
    private observarEventos = new Subject<string>();

    // Observable string streams
    observarEventos$ = this.observarEventos.asObservable();

  constructor(private appService: AppService) { }

  	routerEventos(tecla):void{
  		if(this.appService.control!="evento"){return;}
  		console.log("Tecla de evento : "+tecla);
  		console.log(this.eventoActivo);
  		switch(tecla){
  			case "Enter":
  				
  			break;
  		}
  	}

  	toggleEvento():void{
 		this.mostrarEvento = !this.mostrarEvento;
 	}

 	inicializarEventos(mazmorra){
 		this.eventos = {
 			localizacion: "mazmorra",
			evento:[],
			dialogos: []
 		}

 		for (var i = 0; i < mazmorra.eventos.length; i++) {
 			this.eventos.evento[i]= mazmorra.eventos[i];
 			this.eventos.dialogos[i]= mazmorra.dialogos[i];
 		}

 		console.log("Eventos Inicializados: ");
 		console.log(this.eventos);
 	}

 	activarEvento(eventoId){

 		//Activar el evento:
 		this.mostrarEvento= true;
 		this.appService.control="evento";
 		this.eventoActivo=this.eventos.evento.find(i => i.id==eventoId);

 		//Verificar la activación por variable:
 		this.checkVariable(eventoId);
 		this.checkRNG(eventoId);
 		this.iniciarDialogo(eventoId);
 	}

 	checkVariable(eventoId:number):void{}

 	checkRNG(eventoId:number):void{}

 	iniciarDialogo(eventoId:number):void{

 		var dialogoId = this.eventos.evento[eventoId].dialogo_id;

 		//Colocar el primer Dialogo:
 		this.dialogo.push({nombreInterlocutor: this.eventos.dialogos[dialogoId].texto1, dialogoInterlocutor: this.eventos.dialogos[dialogoId].texto2});
 		
 		//Si tiene dialogos encadanados mostrar los siuientes:
 		
 	}

 	agregarDialogo(){
 		console.log("agregando evento");
 		console.log(this.eventos);

 	}

 	procesarEvento(objetoEvento){
 	}

}

