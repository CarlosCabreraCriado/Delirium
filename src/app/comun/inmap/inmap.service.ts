
import { Injectable, OnInit} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})

export class InMapService {

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

	//Variables de sala:
	private sala:any={
		nombre: "",
		jugadores: [{}]
	};

  constructor(private appService: AppService,private socketService:SocketService) { 

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe(async(data) => {

            var validacion = await this.appService.getValidacion();

      		if(data.emisor== validacion.nombre && data.tipoEmisor == validacion.tipo){console.log("EVITANDO "+data.peticion);return;}
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
      		    	console.log("SALA: ")
      		    	console.log(this.sala);
      		    	
      			break;
				
      			case "cerrarSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	//this.appService.setSala(this.sala);
      		    	//console.log(this.sala); 	
      			break;

      			case "iniciarPartida":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
      		    	this.socketSubscripcion.unsubscribe();
      		    	this.appService.setControl("mazmorra");
					this.appService.cambiarUrl("mazmorra");
      			break;
      		}
      	});

		//this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.validacion.nombre,nombreSala: this.sala.nombre, contenido: this.heroeSeleccionado});

	}
	
	async cargarPerfil(){
		
		//Comprueba el Logueo:
		console.log("Obteniendo validacion y perfil...");
		this.validacion = await this.appService.getValidacion();
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

	async importarDatosGenerales(){
		console.log("Importando Datos al servicio Inmap... ")
		this.heroeStat= await this.appService.getHeroesStats();
		this.heroeHech= await this.appService.getHechizos();
		this.enemigos= await this.appService.getEnemigos();
		this.buff= await this.appService.getBuff();
		this.objetos= await this.appService.getObjetos();
		this.animaciones= await this.appService.getAnimaciones();
		this.parametros= await this.appService.getParametros();
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
		this.grupo.push({ cuentaID: "", heroe: {	clase: "hechicero", especializacion: "-", id_imagen: 1, id: 1, nivel: 5, nombre: "Hive", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		this.grupo.push({ cuentaID: "", heroe: {	clase: "cazador", especializacion: "-", id_imagen: 5, id: 1, nivel: 5, nombre: "Nandelt", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		this.grupo.push({ cuentaID: "", heroe: {	clase: "ladron", especializacion: "-", id_imagen: 9, id: 1, nivel: 5, nombre: "Doomcrash", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		this.grupo.push({ cuentaID: "", heroe: {	clase: "sacerdote", especializacion: "-", id_imagen: 7, id: 1, nivel: 5, nombre: "Puerhorn", num_consumibles: 0, num_objetos_inventario: 0, oro: 10, px: 0 } })

		
		this.heroeSeleccionado = {};

		console.log("Grupo: ");
		console.log(this.grupo);

	}

	iniciarPartida():void{

		//Inicio de Sala:
		/*this.sala= {
			nombre: "Developer",
			jugadores: [
			{
				clase: "picaro",
				especializacion: "-",
				id: 4,
				nivel: 10,
				nombre: "Nandelt",
				num_consumibles: 0,
				num_objetos_inventario: 0,
				oro: 0,
				px: 0,
				usuario: "Iván",
				online: false
			},
			{
				clase: "guerrero",
				especializacion: "-",
				id: 1,
				nivel: 10,
				nombre: "Vrutus",
				num_consumibles: 0,
				num_objetos_inventario: 0,
				oro: 0,
				px: 0,
				usuario: "Victor",
				online: false
			},
			{
				clase: "sacerdote",
				especializacion: "-",
				id: 3,
				nivel: 10,
				nombre: "Hive",
				num_consumibles: 0,
				num_objetos_inventario: 0,
				oro: 0,
				px: 0,
				usuario: "Eduardo",
				online: false
			},
			{
				clase: "hechicero",
				especializacion: "-",
				id: 2,
				nivel: 10,
				nombre: "Mediv",
				num_consumibles: 0,
				num_objetos_inventario: 0,
				oro: 0,
				px: 0,
				usuario: "Carlos",
				online: false
			 }]
		}*/    
			this.heroeSeleccionado= {
				clase: "hechicero",
				especializacion: "-",
				id: 2,
				nivel: 10,
				nombre: "Mediv",
				num_consumibles: 0,
				num_objetos_inventario: 0,
				oro: 0,
				px: 0,
				usuario: "Carlos",
				online: false
			 }

		this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.validacion.nombre,nombreSala: "Developer", contenido: this.heroeSeleccionado});

		console.log("SALA:")
		console.log(this.sala);

		console.log("Iniciando");

		//this.socketService.enviarSocket('iniciarPartida', {nombre: this.validacion.nombre, clave: this.validacion.clave});

		//Secuencia de inicio:

		this.appService.setSala(this.sala);
		this.socketSubscripcion.unsubscribe();
		this.appService.setControl("mazmorra");
		this.appService.cambiarUrl("mazmorra");

	}

}
