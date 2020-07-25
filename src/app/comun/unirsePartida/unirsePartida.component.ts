
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { Subscription } from "rxjs";
//import { ElectronService } from 'ngx-electron';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-unirsePartida',
  templateUrl: './unirsePartida.component.html',
  styleUrls: ['./unirsePartida.component.sass']
})

export class UnirsePartidaComponent implements OnInit{

	constructor(public appService: AppService, /*public electronService: ElectronService*/ private socketService: SocketService) { }

	private cursorSuscripcion: Subscription = null;
	
	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private validacion: any;
	public usuario: string = "Sesión no iniciada.";
	private perfil: any;
	private heroeSeleccionado: any;
	private pantalla = "seleccionHeroe"

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription

	public salas: any=[{}];
	public sala:any;

	ngOnInit(){
		this.cursor= this.cursorMin;
		this.cursorSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );

		this.validacion = this.appService.getValidacion();
		console.log(this.validacion);

		if(this.validacion.nombre==undefined){
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}else{
			this.appService.getDatos(this.validacion.clave);
		}

		this.perfil=this.appService.getPerfil();

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
      		if(this.appService.control!="unirsePartida"){return;}
      		console.log("Socket: ");
      		switch(data.peticion){
      			case "log":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      			break;
      			case "getSalas":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	this.salas = data.contenido;
      		    	console.log(this.salas);
      			break;
      			case "estadoSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
					this.appService.setControl("sala");
					this.appService.cambiarUrl("sala");
      			break;
      			case "iniciarPartida":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
      		    	this.appService.setControl("mazmorra");
					this.appService.cambiarUrl("developer");
      			break;
      		}

      	});


		this.appService.setProgresoCarga("100");
		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
      		this.socketService.enviarSocket("getSalas", true);
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
		this.appService.setControl("index");
		this.appService.cambiarUrl("");
	}

	seleccionarHeroe(index){
		this.heroeSeleccionado = this.appService.perfil.heroes[index];
		this.pantalla = "buscarPartida";
		
		//Formateo Mayusculas y espacios:
		this.heroeSeleccionado.clase= this.heroeSeleccionado.clase.replace(/_/g," ");
		this.heroeSeleccionado.clase= this.heroeSeleccionado.clase.charAt(0).toUpperCase() + this.heroeSeleccionado.clase.slice(1).toLowerCase();
	}

	seleccionarSala(index){
		this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.validacion.nombre,nombreSala: this.salas[index].nombre, contenido: this.heroeSeleccionado});
	}
}




