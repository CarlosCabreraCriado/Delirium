
import { Injectable, OnInit} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})

export class InMapService implements OnInit{

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription

	//Definicion estadisticas generales:
	public heroeHech: any;
	public heroeStat: any;
	public enemigos: any;
	public buff: any;
	public objetos: any;
	public animaciones: any;
	public parametros: any;

	//Datos de validacion y perfil:
	private validacion: any;
	private perfil: any;

	//Estados Inmap:
	public heroeSeleccionado: any;	
	public grupo: any;

  constructor(private appService: AppService,private socketService:SocketService) { }

	ngOnInit(){

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
      		if(data.emisor== this.appService.getValidacion().nombre && this.appService.getValidacion().tipo==data.tipoEmisor){console.log("EVITANDO "+data.peticion);return;}
      		switch(data.peticion){
      			case "log":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      			break;
      			/*
      			case "estadoSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	console.log("SALA: ")
      		    	console.log(this.sala);
      		    	
      			break;
				*/
      			case "cerrarSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	//this.appService.setSala(this.sala);
      		    	//console.log(this.sala); 	
      			break;
      		}
      	});
	}
	
	cargarPerfil(){
		
		//Comprueba el Logueo:
		console.log("Obteniendo validacion y perfil...");
		this.validacion = this.appService.getValidacion();
		console.log(this.validacion);
		if(!this.validacion){
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}

		//Carga el perfil:
		this.perfil=this.appService.getPerfil();
	}

	getIDCuenta(){
		return this.validacion._id;		
	}

	importarDatosGenerales(){
		console.log("Importando Datos al servicio Inmap... ")
		this.heroeStat=this.appService.getHeroesStats();
		this.heroeHech=this.appService.getHeroesHech();
		this.enemigos=this.appService.getEnemigos();
		this.buff=this.appService.getBuff();
		this.objetos=this.appService.getObjetos();
		this.animaciones=this.appService.getAnimaciones();
		this.parametros=this.appService.getParametros();
	}

	importarHeroeSeleccionado(){
		this.heroeSeleccionado = this.appService.getHeroeSeleccionado();
	}


	cargarGrupo(){

		//Inicializa el grupo:
		this.grupo = [];

		//Incluye Heroe Propio:
		if(this.heroeSeleccionado == null){
			this.grupo.push({ cuentaID: this.validacion._id, heroe: {	clase: "", especializacion: null, id: 0, nivel: 0, nombre: null, num_consumibles: 0, num_objetos_inventario: 0, oro: 0, px: 0 } })
		}else{
			this.grupo.push({ cuentaID: this.validacion._id, heroe: this.heroeSeleccionado })
		}

		//Forzar Grupo:
		this.grupo.push({ cuentaID: "", heroe: {	clase: "MINOTAURO", especializacion: "-", id: 1, nivel: 5, nombre: "ETC", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		this.grupo.push({ cuentaID: "", heroe: {	clase: "CHRONOMANTE", especializacion: "-", id: 1, nivel: 5, nombre: "Valera", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		this.grupo.push({ cuentaID: "", heroe: {	clase: "CLERIGO", especializacion: "-", id: 1, nivel: 5, nombre: "Anduin", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		//this.grupo.push({ cuentaID: "", heroe: {	clase: "CRUZADO", especializacion: "-", id: 1, nivel: 5, nombre: "Uther", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })
		
		this.heroeSeleccionado = {};

		console.log("Grupo: ");
		console.log(this.grupo);

	}

}
