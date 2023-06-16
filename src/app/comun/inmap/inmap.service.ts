
import { Injectable, OnInit} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})

export class InMapService {

	//Definicion estadisticas generales:
	public heroeHech: any;
	public heroeStat: any;
	public enemigos: any;
	public buff: any;
	public objetos: any;
	public animaciones: any;
	public parametros: any;

	//Datos de cuenta y perfil:
	private cuenta: any;
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

        console.log("INICIANDO INMAP SERVICE");

		//this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.cuenta.nombre,nombreSala: this.sala.nombre, contenido: this.heroeSeleccionado});

	}
	
	async cargarPerfil(){
		
		//Comprueba el Logueo:
		console.log("Obteniendo cuenta y perfil...");
		this.cuenta = await this.appService.getCuenta();
		console.log(this.cuenta);
		if(!this.cuenta){
			this.appService.setControl("index");
			this.appService.setEstadoApp("index");
		}

		//Carga el perfil:
		this.perfil= await this.appService.getPerfil();
        console.log("PERFIL")
        console.log(this.perfil)

	}

	getIDCuenta(){
		return this.cuenta._id;		
	}

	async importarDatosGenerales(){
		console.log("Importando Datos al servicio Inmap... ")
		this.enemigos= await this.appService.getEnemigos();
		this.buff= await this.appService.getBuff();
		this.objetos= await this.appService.getObjetos();
		this.animaciones= await this.appService.getAnimaciones();
	}

	importarHeroeSeleccionado(){
		this.heroeSeleccionado = this.appService.getHeroeSeleccionado();
	}


	cargarGrupo(){

        //Auto Seleccion de primer heroe:
		if(this.heroeSeleccionado == null){
		    this.appService.setHeroeSeleccionado(this.perfil.heroes[0])
        }

        this.heroeSeleccionado = this.appService.getHeroeSeleccionado();
        console.log("Heroe Seleccionado")
        console.log(this.heroeSeleccionado)

		//Inicializa el grupo:
		this.grupo = [];

		//Incluye Heroe Propio:
		if(this.heroeSeleccionado == null){
			this.grupo.push({ cuentaID: this.cuenta._id, heroe: {	clase: "", especializacion: null, id: 0, nivel: 0, nombre: null, num_consumibles: 0, num_objetos_inventario: 0, oro: 0, px: 0 } })
		}else{
			this.grupo.push({ cuentaID: this.cuenta._id, heroe: this.heroeSeleccionado })
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

	iniciarPartida(nombreIdMazmorra: string):void{

        //INICIANDO MAZMORRA:
        this.appService.iniciarMazmorra(nombreIdMazmorra);

		//Inicio de Sala:
			/*this.heroeSeleccionado= {
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
             */

        //GESTION DE SOCKET:
		//this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.cuenta.nombre,nombreSala: "Developer", contenido: this.heroeSeleccionado});
		//this.socketService.enviarSocket('iniciarPartida', {nombre: this.cuenta.nombre, clave: this.cuenta.clave});


	}

}
