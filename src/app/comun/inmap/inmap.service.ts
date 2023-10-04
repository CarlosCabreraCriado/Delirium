
import { Injectable, OnInit} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';

interface EstadoControlInMap {
      estado: string,
      esTurnoPropio: boolean,
      turnoIndex: number;
      heroePropioIndex: number;
}

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
	public heroeSeleccionadoPerfilIndex: number;
    public estadoInMap = "global";
    public estadoControlInMap: EstadoControlInMap;

	//Variables de sala:
	private sala:any={
		nombre: "",
		jugadores: [{}]
	};

  constructor(private appService: AppService,private socketService:SocketService) {
        console.log("INICIANDO INMAP SERVICE");
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
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
        this.heroeSeleccionadoPerfilIndex = this.appService.getHeroeSeleccionadoPerfilIndex();

        console.log("Heroe Seleccionado")
        console.log(this.heroeSeleccionado)

        //CARGAR SESION:
        //this.sesion= await this.appService.getSesion();
        this.parametros = await this.appService.getParametros();

        await this.appService.getEventos();

		//Inicializa el grupo:
        if(this.sesion.iniciada == false){
            this.sesion.iniciada = true;
            this.socketService.enviarSocket("actualizarSesion",{peticion: "actualizarSesion", comando: "actualizarSesion", contenido: this.sesion});
        }

        //REDIRIGE A REGION:
        this.toggleInMap();

        //REDIRIGIR A MAZMORRA:
		//this.iniciarPartida("Bastion");

	}

    toggleInMap(){ //Se activa desde el boton de Region:
        this.estadoInMap = this.appService.estadoInMap;
        if(this.estadoInMap=="global"){
            this.appService.cargarRegion("Asfaloth");
            this.estadoInMap = "region";
        }else{
            this.appService.setEstadoInMap("global");
            this.estadoInMap = "global";
        }
    }

	iniciarPartida(nombreIdMazmorra: string):void{
        //INICIANDO MAZMORRA:
        console.warn("INICIANDO...",nombreIdMazmorra)
        this.appService.iniciarMazmorra(nombreIdMazmorra);
	}

    realizarMovimiento(){
        this.appService.triggerChangeDetection();
    }

}
