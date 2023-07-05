
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

    //Importar Sesion:
	public sesion: any;

	//Estados Inmap:
	public heroeSeleccionado: any;	
    public estadoInmap = "global";

	//Variables de sala:
	private sala:any={
		nombre: "",
		jugadores: [{}]
	};

  constructor(private appService: AppService,private socketService:SocketService) { 

        console.log("INICIANDO INMAP SERVICE");

        this.sesion= this.appService.getSesion();

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


	async iniciarInMap(){

        //Auto Seleccion de primer heroe:
		if(this.heroeSeleccionado == null){
		    this.appService.setHeroeSeleccionado(this.perfil.heroes[0])
        }

        this.heroeSeleccionado = this.appService.getHeroeSeleccionado();

        console.log("Heroe Seleccionado")
        console.log(this.heroeSeleccionado)


        //CARGAR DATOS:
        this.sesion= await this.appService.getSesion();
        console.warn(this.sesion);

		//Inicializa el grupo:

        //REDIRIGIR A MAZMORRA:
		//this.iniciarPartida("MazmorraSnack");	

	}

    toggleInMap(){
        
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
