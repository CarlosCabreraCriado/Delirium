
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { IndexService } from './sala.service';
import { Subscription } from "rxjs";
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-sala',
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.sass']
})

export class SalaComponent implements OnInit{

	constructor(public appService: AppService, public indexService: IndexService, private socketService:SocketService) { }

	private cursorSuscripcion: Subscription = null;

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription

	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private validacion: any;
	public claveValida: boolean= true;
	public host: boolean= false;
	public usuario: string = "Sesión no iniciada.";
	private mostrarEntrarPartida= false;
	private mostrarAddJugador= false;
	private pantalla= "default";
	private clases={}

	private sala:any={
		nombre: "",
		jugadores: [{}]
	};

	ngOnInit(){
		this.cursor= this.cursorMin;
		this.cursorSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );


		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
      		console.log("SOCKET:");
      		if(this.appService.control!="sala"){
      			console.log("Error, control")
      			return;}
      			
      		if(data.emisor == this.validacion.nombre && this.validacion.tipo==data.tipoEmisor){
      			switch(data.peticion){
      				case "iniciarPartida":
      				break;
      				case "estadoSala":
      				case "cerrarSala":
      					console.log("EVITANDO "+data.peticion);
      					return;
      				break;
      				default:
      					console.log("EVITANDO "+data.peticion);
      				return;
      				break;
      			}
      		}
      		switch(data.peticion){
      			case "log":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      			break;
      	
      			case "estadoSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(data.contenido);

      		    	if(this.validacion.tipo=="Cliente" && !this.sala.jugadores.find(i => i.usuario === this.validacion.nombre)){
      		    		this.appService.mostrarDialogo("Informativo",{contenido:"Te han expulsado de la sala."});
      		    	}
      		    	
      		    	if(this.sala.iniciada){
						console.log("SALA YA INICIADA");
						this.mostrarEntrarPartida=true;
					}
      			break;

      			case "cerrarSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.socketSubscripcion.unsubscribe();
      		    	this.appService.setSala({});
      		    	this.retroceder();
      			break;

      			case "iniciarPartida":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
      		    	this.socketSubscripcion.unsubscribe();
      		    	this.appService.setControl("mazmorra");
					this.appService.cambiarUrl("developer");
      			break;
      		}
      	});

		this.validacion = this.appService.getValidacion();

		if(!this.validacion){
			this.socketSubscripcion.unsubscribe();
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}

		this.sala = this.appService.getSala();
		if(this.sala.jugadores==undefined){
			this.sala.jugadores = [];
		}

		if(this.validacion.tipo=="Host"){
			this.socketService.enviarSocket('crearPartida', {nombre: this.validacion.nombre, clave: this.validacion.clave});
		}

		if(this.sala.iniciada){
			console.log("SALA YA INICIADA");
			this.mostrarEntrarPartida=true;
		}

		this.appService.setProgresoCarga("100");

		setTimeout(()=>{    
      		//this.appService.mostrarPantallacarga(false);
      		/*
      		if(this.sala.nombre==""|| this.sala.nombre== undefined){
      			this.sala.nombre=this.validacion.nombre;
      			this.sala.jugadores=[];
      			console.log("Creando Sala: ");
      			this.socketService.enviarSocket('crearPartida', {nombre: this.validacion.nombre, clave: this.validacion.clave});
      			this.host= true;
      		}
      		*/
      		if(this.validacion.tipo=="Host"){
      			this.host=true;
      		}
 		}, 1000);
	}

	actualizarComponente(): void{
		
		if(this.appService.control=="null"){
        	this.appService.setControl("sala");
        	return;
      	}

		if(this.appService.control!="sala"){return;}

		switch(this.tecla){
			case "ArrowUp":
				
			break;
			case "ArrowDown":
				

			break;
			case "Enter":

			break;
		}
	}

	retroceder():void{
		this.socketSubscripcion.unsubscribe();
		this.appService.setControl("");
		this.appService.cambiarUrl("index");
	}

	abandonarSala():void{
		this.appService.setSala({});
		this.socketSubscripcion.unsubscribe();
		this.socketService.enviarSocket('abandonarSala', {nombre: this.validacion.nombre, clave: this.validacion.clave});
		this.retroceder();
	}

	iniciarPartida():void{

		if(this.sala.jugadores==undefined){
			this.appService.mostrarDialogo("Informativo",{contenido:"Jugadores insuficientes."});
			return;
		}

		if(this.sala.jugadores.length<3){
			this.appService.mostrarDialogo("Informativo",{contenido:"Jugadores insuficientes."});
			return;
		}
		console.log("Iniciando");
		this.socketService.enviarSocket('iniciarPartida', {nombre: this.validacion.nombre, clave: this.validacion.clave});
	}

	eliminarJugador(numJugador){

		if(this.mostrarEntrarPartida){
			this.appService.mostrarDialogo("Informativo",{contenido:"Error. La sala ya esta iniciada."});
			return;
		}

		if(!this.host){
			this.appService.mostrarDialogo("Informativo",{contenido:"Error. Debes de ser el host."});
			return;
		}
		console.log("Eliminando Jugador numero "+numJugador);
		this.sala.jugadores.splice(numJugador,1);
		this.socketService.enviarSocket('sincronizarSala', {sala: this.sala});
	}

	addJugador(){
		this.pantalla="elegirTipoJugador";
	}

	getClases():any{
		var clases= [];
		clases=Object.keys(this.appService.getHeroesStats());

		var indexEliminar1= clases.indexOf("_id");
		var indexEliminar2= clases.indexOf("nombreId");
		var indexEliminar3= clases.indexOf("__v");
		
		clases.splice(indexEliminar1,1);
		clases.splice(indexEliminar2,1);
		clases.splice(indexEliminar3,1);
	
		return clases;
	}

	addBot(clase):void{

		if(this.mostrarEntrarPartida){
			this.appService.mostrarDialogo("Informativo",{contenido:"Error. La sala ya esta iniciada."});
			this.pantalla="default";
			return;
		}

		if(!this.host){
			this.appService.mostrarDialogo("Informativo",{contenido:"Error. Debes de ser el host."});
			this.pantalla="default";
			return;
		}

		if(this.sala.jugadores.length<6){
			//Contar Numero de Bots:
			var numBots=1;
			for(var i=0;i<this.sala.jugadores.length;i++){
				if(this.sala.jugadores[i].usuario=="Bot"){
					numBots++;
				}
			}
			console.log("Añadiendo Bot... ");
			this.sala.jugadores.push({
                    clase: clase,
                    especializacion: "_",
                    id: 1,
                    nivel: 10,
                    nombre: "Bot"+numBots,
                    num_consumibles: 0,
                    num_objetos_inventario: 0,
                    oro: 0,
                    px: 0,
                    usuario: "Bot",
                    online: true
                });
			//Formateo Mayusculas y espacios:
			this.sala.jugadores[this.sala.jugadores.length-1].clase= this.sala.jugadores[this.sala.jugadores.length-1].clase.replace(/_/g," ");
			this.sala.jugadores[this.sala.jugadores.length-1].clase= this.sala.jugadores[this.sala.jugadores.length-1].clase.charAt(0).toUpperCase() + this.sala.jugadores[this.sala.jugadores.length-1].clase.slice(1).toLowerCase();
		}

		this.socketService.enviarSocket('sincronizarSala', {sala: this.sala});
		this.pantalla="default";
		
	}

	cancelar(){
		this.pantalla="default";
	}
}




