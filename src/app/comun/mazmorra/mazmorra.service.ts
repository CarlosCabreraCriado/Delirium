
import { Injectable, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../app.service';
import { LoggerService } from '../logger/logger.service';
import { PausaService } from '../pausa/pausa.service';
import { EventosService } from '../eventos/eventos.service';
import { RngService } from '../rng/rng.service';
import { InterfazService } from '../interfaz/interfaz.service';
import { Subject } from 'rxjs';
import * as cloneDeep from 'lodash/cloneDeep';
//import { cloneDeep } from 'lodash/cloneDeep';
import { HttpClient } from "@angular/common/http"
import { SocketService } from '../socket/socket.service';
import { Subscription } from "rxjs";

//import { ElectronService } from 'ngx-electron';
import { RenderMazmorra} from './render.class';

@Injectable({
  providedIn: 'root'
})

export class MazmorraService implements OnInit{

	//Definicion base de datos local
	public db;

	//Variables generales:
	public cuenta:any={};
	public sala:any = {};
	public dispositivo= "";
	public partidaIniciada= false;
	public perfil:any;

	//Definicion estadisticas generales:
    public clases: any;
	public hechizos: any;
	public enemigos: any;
	public buff: any;
	public objetos: any;
	public animaciones: any;

	public parametros: any; //Pendiente Decomision
	public heroeStat: any; //Pendiente Decomision

	//Definicion mazmorra actual:
	public mazmorra: any;
	public guardado: any;
	private mostrarMazmorra: boolean = false;

	//Definicion de autoguardados:
	public autoGuardado = {} as RenderMazmorra;
	public autoGuardado2 = {} as RenderMazmorra;

	//Declaración de estado de render:
	private renderMazmorra = {} as RenderMazmorra;
	private personaje:any

	//Parametros de configuracion:
	private velocidadBuff: number = 2000;
	private velocidadHechizo: number = 2000;

	//Musica ambiental:
	public musicaMazmorra = new Audio();

	//Variables internas:
	private turnoModificado: boolean = false;
	private cuentaAplicacionHechizo: number= 0;
	private cuentaLanzamientoHechizo: number= 0;
	private mostrarLogger: boolean= true;
	private mostrarPausa: boolean= false;
	private mostrarRNG: boolean= true;
	public cargaCompleta: boolean = false;
	public sincronizar:boolean= true;
	public emisor:boolean= false;
	public comandoSocketActivo:boolean= false;
	public esHeroe: boolean= false;
	public esEnemigo: boolean= false;
	private seleccionarHeroes: boolean= false;
	private seleccionarEnemigos: boolean= false;

	//OPCIONESE DE DEBUG:
	private restringirAcciones = false;
	private restringirRecurso = true;
	private restringirRNG = false;
	private restringirTurno = false;
	private forzarGeneradoRender = true;
	private permitirMultiControl = true;

	//Variables Isometrico:
	public estiloIsometrico: any = {};

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription
	
	musicaMazmorraPlay(): void{
  		
  		this.musicaMazmorra.src = "./assets/musica/musica-mazmorra.mp3";
  		this.musicaMazmorra.load();
  		this.musicaMazmorra.volume= 0;
  		this.musicaMazmorra.play();
	}

	//Emision de eventos
	@Output() cargarAutoGuardado: EventEmitter<any> = new EventEmitter();

	//Emision de eventos
	@Output() mostrarAnimacionNumero: EventEmitter<any> = new EventEmitter();

  	constructor(private appService: AppService/*, private electronService: ElectronService*/, private loggerService: LoggerService, private pausaService: PausaService,private rngService: RngService, private interfazService: InterfazService,private eventosService: EventosService, private http:HttpClient,private socketService:SocketService) { 
  	 //this.db = new Datastore({filename:'../datos/example.dat', autoload: true});
	}

	ngOnInit(){

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
      		if(data.emisor== this.appService.getCuenta().then((result) => {return result.nombre}) && this.appService.getCuenta().then((result) => {return result.tipo})==data.tipoEmisor){console.log("EVITANDO "+data.peticion);return;}
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
      		    	this.appService.setSala(this.sala);
      		    	console.log(this.sala); 	
      			break;
      		}
      	});


	}

	/* 	----------------------------------------------
			ROUTER DE MAZMORRA
 	---------------------------------------------- */
 	routerMazmorra(tecla:string):void{
 		
 		//Devolver a index si la pagina se ha recargado:
 		/*if(this.appService.control=="null"){
        	this.appService.setControl("index");
        	this.appService.cambiarUrl("/index");
        	return;
      	}*/

      	if(this.appService.control=="null"){this.appService.setControl("mazmorra");}
		if(this.appService.control!="mazmorra"){return;}

      	console.log("ESTADO: "+this.renderMazmorra.estadoControl.estado);

		//Router del Logger:
		if(this.renderMazmorra.estadoControl.estado=="looger"){	
			if(tecla=="Enter"){
				this.loggerService.procesarComando(this.renderMazmorra);
			}else{
				this.loggerService.addComando(tecla);
			}
			if(tecla=="Tab"){
				this.renderMazmorra.estadoControl.estado="seleccionAccion";
				this.loggerService.toggleLogger();
			}
			return;
		}
		
		switch(tecla){

			/* ----------------------------------------------
						ROUTER SIN RESTRICCION
			------------------------------------------------- */

			case "Tab":
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				this.renderMazmorra.estadoControl.estado="looger";
				this.loggerService.toggleLogger();
				return;
			}
			
			break;

			case "ArrowUp":
				if (this.musicaMazmorra.volume <1) {
					this.musicaMazmorra.volume= this.musicaMazmorra.volume+0.1;
				}else{
					this.musicaMazmorra.volume= 1;
				}
			break;

			case "ArrowDown":
				if (this.musicaMazmorra.volume>0) {
					this.musicaMazmorra.volume= this.musicaMazmorra.volume-0.1;
				}else{
					this.musicaMazmorra.volume= 0;
				}
			break;

			case "Escape":
				this.pausaService.togglePause();
			break;

			/* *************************************************
					ROUTER CON RESTRICCION DE TURNO
			************************************************* */

			case "ArrowRight":
				if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo" || this.renderMazmorra.estadoControl.estado=="hechizoEncadenado"){
					this.moverObjetivo(1);
				}

			break;

			case "ArrowLeft":
				if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo" || this.renderMazmorra.estadoControl.estado=="hechizoEncadenado"){
					this.moverObjetivo(-1);
				}
			break;

			case "Backspace":
			if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo"){
				this.cancelarObjetivo();
			}
			break;

			case "s":
				if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo" || this.renderMazmorra.estadoControl.estado=="hechizoEncadenado"){
					this.seleccionarObjetivo();
				}
			break;

			case "Enter":
			if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo" || this.renderMazmorra.estadoControl.estado=="hechizoEncadenado"){
				//this.lanzarHechizo();
				this.activarRNG();
				return;
			}
			break;

			case "p":
				this.pasarTurno();
			break;

			case "0":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}

			console.log("Hechizo 1:");
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(1)){this.seleccionObjetivo(1);}
				return;
			}
			break;

			case "1":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}

			console.log("Hechizo 2:");
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(2)){this.seleccionObjetivo(2);}
			}
			break;

			case "2":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}

			console.log("Hechizo 3:");
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(3)){this.seleccionObjetivo(3);}
			}
			break;

			case "3":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}

			console.log("Hechizo 4:");
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(4)){this.seleccionObjetivo(4);}
			}
			break;

			case "4":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}

			console.log("Hechizo 5:");
			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(5)){this.seleccionObjetivo(5);}
			}
			break;

			case "5":
				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){break;}
				}else{
					this.desactivarComandoSocket();
				}
			console.log("Hechizo 6:");

			if(this.renderMazmorra.estadoControl.estado=="seleccionAccion"){
				if(this.verificarCasteo(6)){this.seleccionObjetivo(6);}
			}
			break;

			/* *************************************************
					ROUTER CON RESTRICCION DE HOST
			************************************************* */
			case "+":
			this.renderMazmorra.estadoControl.estado="seleccionSala";
			this.mensajeAccion("Selecciona una sala...",1000);
			break;

			case "f":
			console.log("Forzando Sincronización")
			this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
			this.mensajeAccion("Sincronizando...",2000);
			break;

			case "m":
			this.renderMazmorra = cloneDeep(this.autoGuardado);
			this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarRewind", contenido: this.renderMazmorra});
			this.cargarAutoGuardado.emit(this.renderMazmorra);
			this.mensajeAccion("Realizando rewind...",5000);
			break;

			case "n":
			this.renderMazmorra = cloneDeep(this.autoGuardado2);
			this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarRewind", contenido: this.renderMazmorra});
			this.cargarAutoGuardado.emit(this.renderMazmorra);
			this.mensajeAccion("Realizando rewind...",5000);
			break;
		}

		if(this.renderMazmorra.estadoControl.estado=="seleccionSala"){

			switch(tecla){
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				this.cambiarSala(parseInt(tecla));
				this.cambiarSala(parseInt(tecla));
				this.renderMazmorra.salaActual=parseInt(tecla);
				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
				this.mensajeAccion("Cambiando Sala...",2000);
				this.renderMazmorra.estadoControl.estado="seleccionAccion";
				break;
				case "Backspace":
				this.renderMazmorra.estadoControl.estado="seleccionAccion";
				break;
			}

		}

		if(this.renderMazmorra.estadoControl.estado=="rng"){
			if(tecla=="Backspace"){
				this.renderMazmorra.estadoControl.estado="seleccionAccion";
				this.desactivarRNG();
				return;
			}

			if(tecla=="Enter"){
				this.renderMazmorra.estadoControl.rng= this.rngService.getValorRng();
				this.desactivarRNG();
				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "sincronizacion", contenido: this.renderMazmorra});
				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: {}});
				this.lanzarHechizo();
				return;
			}

			switch(tecla){
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				this.rngService.setValorTirada(tecla);
				break;
			}
		}

		if(this.renderMazmorra.turno){}

	}

	/* 	----------------------------------------------
		IMPORTANCION ESTADISTICAS CON SERVIDOR
 	----------------------------------------------*/
 	cargarPartida(sala):any{
 		this.sala = sala;
 		if(this.sala.nombre==undefined){
			console.log("RECONECTANDO: "+this.cuenta.nombre)
			this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.cuenta.nombre});
			return this.renderMazmorra;
		}

 		console.log("-------------------------");
 		console.log("CARGANDO DATOS DE PARTIDA");
 		console.log("-------------------------");
 		console.log("SALA: ")
 		console.log(sala);
		this.importarEstadisticasGenerales(sala);
		return this.renderMazmorra;
	}

 	//Importa las estadisticas generales desde el servidor:
	importarEstadisticasGenerales(sala): void{

        console.log("Importando Estadisticas Generales: ");

        this.appService.setProgresoCarga("70%");

        //Cargar Datos locales
        this.clases=this.appService.getClases();
        this.hechizos=this.appService.getHechizos();
        this.enemigos=this.appService.getEnemigos();
        this.buff=this.appService.getBuff();
        this.objetos=this.appService.getObjetos();
        this.animaciones=this.appService.getAnimaciones();

        //Importar la partida:
        this.importarPartida(sala);

	}

	//Importa los datos de la partida y la mazmorra:
	importarPartida(sala): void{
		/*
		console.log("Cargando mazmorra");
		this.mazmorra = this.electronService.ipcRenderer.sendSync('getDatosMazmorraSnack');
		console.log("Mazmorra Snack cargado: ");
		console.log(this.mazmorra);
		this.appService.setProgresoCarga("80%");

		console.log("Cargando datos de partida");
		this.guardado = this.electronService.ipcRenderer.sendSync('getDatosGuardadoSnack');
		console.log("Partida Cargada: ");
		console.log(this.guardado);
		this.appService.setProgresoCarga("100%");
		*/

		console.log("-------------------------");
 		console.log(" CONFIGURANDO MAZMORRA");
 		console.log("-------------------------");
		
 		if(this.cuenta.tipo=="Host"){
 			this.personaje = {
 				nombre: this.cuenta.nombre,
 				heroeIndex: 0
 			};
 		}else{
 			this.personaje = sala.jugadores.find(j => j.usuario === this.appService.getCuenta().then((result) => {return result.nombre}));
			this.personaje.heroeIndex = sala.jugadores.indexOf(this.personaje);
 		}

		var partida = {
			nombreMazmorra: "MazmorraSnack",
			nombrePartida: "GuardadoSnack",
		}

		//Obteniendo Perfil de jugador:
		this.perfil = this.appService.getPerfil();

		this.renderMazmorra.personaje= this.personaje.nombre;
		this.renderMazmorra.personajeIndex= this.personaje.heroeIndex;

		console.log("Cargando Mazmorra: "+partida.nombreMazmorra);

		this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarMazmorra",{nombreMazmorra: partida.nombreMazmorra, nombreGuardado: partida.nombrePartida, heroeNombre: this.personaje.nombre, heroeIndex: this.personaje.heroeIndex, token: this.appService.getToken()}).subscribe((data) => {
			console.log("Mazmorra: ");
			console.log(data);	
			this.mazmorra= data;
			this.appService.setProgresoCarga("80%");

			console.log("Cargando datos de partida: "+partida.nombrePartida);
			this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarGuardado",{nombreMazmorra: partida.nombreMazmorra, nombreGuardado: partida.nombrePartida, heroeNombre: this.personaje.nombre, heroeIndex: this.personaje.heroeIndex, token: this.appService.getToken()}).subscribe((data) => {
				console.log("Guardado: ");
				console.log(data);	
				this.guardado= data;
				
				this.sala = this.appService.getSala();

				if(this.sala.nombre==undefined){
					console.log("RECONECTANDO: "+this.cuenta.nombre)
					this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.cuenta.nombre});
				}
				
				
				if(this.appService.getSala().jugadores==undefined){
					console.log(this.appService.getSala())
					console.log("JUGADORES INSUFICIENTES..")
				}else{
					this.guardado.heroes= this.appService.getSala().jugadores;
					this.guardado.general[0].num_heroes= this.appService.getSala().jugadores.length;
					this.appService.setProgresoCarga("100%");
					this.inicializarPartida();
				}
      		   
			});
		});
	}

	/* 	----------------------------------------------
			INICIALIZACIÓN DE MAZMORRA
 	----------------------------------------------*/
 	inicializarPartida():void{

 		console.log("INICIALIZANDO");
 		this.partidaIniciada= true;

 		//Inicialización del objeto renderMazmorra:
 		this.renderMazmorra.heroes = [];
 		this.renderMazmorra.enemigos = [];
 		this.renderMazmorra.objetosGlobales = [];
 		this.renderMazmorra.nivel_equipo= 9;
 		
 		//Inicializar objetivos:
 		this.renderMazmorra.objetivo = {
 			enemigos: [],
 			heroes: []
 		}

 		//Inicializar Eventos:
 		this.eventosService.inicializarEventos(this.mazmorra);
		
		//Inicializar Canvas Isometrico:
		//this.appService.renderizarCanvasIsometrico();

 		//Inicializar Estado: 
 		this.renderMazmorra.estadoControl = {
 			estado: "seleccionAccion",
 			hechizo: 0,
 			tipoObjetivo: "EU",
 			rng: 0,
 			rngEncadenado: false,
 			critico: false,
 			detenerHechizo: false
 		};

 		//Inicializacion de turnos:
 		this.renderMazmorra.turno = 1;
 		this.renderMazmorra.cuentaAcciones = 0;

 		//Inicialización de los heroes:
 		this.renderMazmorra.numHeroes = this.guardado.heroes.length;
 		for (var i = 0; i < this.guardado.heroes.length; i++) {
 			this.renderMazmorra.heroes[i]={
 				clase: this.guardado.heroes[i].clase.toLowerCase().charAt(0).toUpperCase() + this.guardado.heroes[i].clase.toLowerCase().slice(1),
 				nombre: this.guardado.heroes[i].nombre,
 				vida: 100,
 				escudo: 0,
				energia: 100,
 				recurso: 100,
 				acciones: 2,
 				recursoEspecial: 0,
 				estadisticas: {
 					armadura: 0,
					vitalidad: 0,
					fuerza: 0,
					intelecto: 0,
					agilidad: 0,
					precision: 0,
					ferocidad: 0,
					general: 0
 				},
 				cargaUlti: 0,
 				buff: [],
 				oro: this.guardado.heroes[i].oro,
				id_imagen: this.guardado.heroes[i].id_imagen,
 				objetos: [],
 				turno: false,
 				objetivo: false,
 				objetivoAuxiliar: false,
				mostrarAnimacion: false,
 				animacion: {
					id: 1,
					nombre: "Basico",
					duracion: "1",
					subanimaciones: [],
					sonidos: []
				},
 				online: this.guardado.heroes[i].online
 			};
 			this.renderMazmorra.heroes[i].objetos = this.guardado.objetos.filter(j => j.portador_nombre === this.guardado.heroes[i].nombre);
 		}


 		this.renderMazmorra.heroes[0].turno= true;

 		//Inicialización de la primera sala:
		
		//Detectar la sala inicial:
		var idSalaInicial = 0;
		for(var i = 0; i < this.mazmorra.salas.length; i++){
			if(this.mazmorra.salas[i].salaInicial){
				idSalaInicial = this.mazmorra.salas[i].sala_id;
			}	
		}

		if(idSalaInicial > 0){
			this.cambiarSala(idSalaInicial);
		}

		//Inicializacion de sala (ANTIGUA)
		/*
 		this.renderMazmorra.salaActual = 2;
 		this.renderMazmorra.numEnemigos = this.mazmorra.salas.find(j => j.sala_id === this.renderMazmorra.salaActual).enemigos.length;
 		this.renderMazmorra.nombreSala = this.mazmorra.salas.find(j => j.sala_id === this.renderMazmorra.salaActual).nombre;
 		this.renderMazmorra.descripcionSala = this.mazmorra.salas.find(j => j.sala_id === this.renderMazmorra.salaActual).descripcion;
 		for (var i = 0; i < this.mazmorra.salas[this.renderMazmorra.salaActual].enemigos.length; i++) {
 			this.renderMazmorra.enemigos[i] = {
 				nombre: this.mazmorra.salas[this.renderMazmorra.salaActual].enemigos[i].nombre,
 				enemigo_id: this.mazmorra.salas[this.renderMazmorra.salaActual].enemigos[i].enemigo_id,
				familia: this.enemigos.enemigos_stats.find(k => k.id === this.mazmorra.salas[this.renderMazmorra.salaActual].enemigos[i].tipo_enemigo_id).familia.toLowerCase(),
 				vida: 100,
 				escudo: 0,
 				agro: [],
 				buff: [],
 				turno: false,
 				estadisticas: {
 					armadura: 0,
					vitalidad: 0,
					fuerza: 0,
					intelecto: 0,
					precision: 0,
					ferocidad: 0,
					general: 0
 				},
 				acciones: 2,
 				objetivo: false,
 				objetivoAuxiliar: false,
 				hechizos: this.enemigos.enemigos_stats.find(k => k.id === this.mazmorra.salas[this.renderMazmorra.salaActual].enemigos[i].tipo_enemigo_id).hechizos_id,
 				animacion: 0
 			}

 			//this.renderMazmorra.enemigos[i].nombre = this.enemigos.enemigos_stats.find(j => j.id === this.renderMazmorra.enemigos[i].enemigo_id).nombre
 			
 			//Inicializacion de Agro:
 			for(var j= 0; j <this.renderMazmorra.numHeroes;j++){
 				this.renderMazmorra.enemigos[i].agro.push(0);
 			}
 		}
		*/

 		//Inicializando variables de render:
 		this.renderMazmorra.render = {
 			barraAccion: {
 				mensajeAccion: "Partida Iniciada",
 				mostrar: false,
 				nombreTurno: this.renderMazmorra.heroes[0].nombre,
 				claseTurno: "/Clases/"+this.renderMazmorra.heroes[0].clase.toLowerCase()
 			},
 			objetivoPredefinido: {
 				enemigos: [],
 				heroes: []
 			},
 			heroeMuerto: [],
 			enemigoMuerto: []
 		}

 		console.log(this.renderMazmorra);


 		//Calcular estadisticas Heroes:
 		for (var i = 0; i < this.renderMazmorra.numHeroes; i++) {
 			this.calcularEstadisticas(true,this.renderMazmorra.heroes[i]);
 		}
 		//Calcular estadisticas Enemigos:
 		for (var i = 0; i < this.renderMazmorra.enemigos.length; i++) {
 			this.calcularEstadisticas(false,this.renderMazmorra.enemigos[i]);
 		}

 		//Inicializa turno:
 		this.renderMazmorra.registroTurno= [];
 		this.renderMazmorra.registroTurno[0]= 0;

 		//Inicializar Analisis de estadisticas:
 		this.renderMazmorra.estadisticas= [];
 		for(var i=0; i < this.renderMazmorra.numHeroes; i++){
 			this.renderMazmorra.estadisticas[i]={
 				dano: [],
 				heal: [],
 				escudo: [],
 				agro: []
 			}
 		}

 		//Agregar nuevo registro de analisis:
 		for(var i=0; i <this.renderMazmorra.numHeroes;i++){
 			this.renderMazmorra.estadisticas[i].dano.push(0);
 			this.renderMazmorra.estadisticas[i].heal.push(0);
 			this.renderMazmorra.estadisticas[i].escudo.push(0);
 			this.renderMazmorra.estadisticas[i].agro.push(0);
 		}

		//Check de cambio de control de personaje: 
		this.cambiarControlPersonaje();

 		//Iniciar Looger:
 		this.loggerService.log("-----------------------------","yellow");
 		this.loggerService.log(" DELIRIUM  -  v"+this.appService.version,"yellow");
 		this.loggerService.log("Partida Iniciada...","yellow");
 		this.loggerService.log("-----------------------------","yellow");

 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			this.loggerService.log(this.renderMazmorra.heroes[i].nombre+" ---> "+this.renderMazmorra.heroes[i].clase,"orange");
 		}
 		
 		if(Object.keys(this.sala.render).length === 0 || this.forzarGeneradoRender){
			console.log("Render generado");
			console.log(this.renderMazmorra);
			this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
		}else{
			console.log("Obteniendo Render Externo");
			this.setRenderMazmorra(this.sala.render);
		}
 		
 		this.musicaMazmorraPlay();
 		this.autoGuardado2 = cloneDeep(this.renderMazmorra);
 		this.autoGuardado = cloneDeep(this.renderMazmorra);
 		
 		this.cargaCompleta=true;
 		if(this.renderMazmorra.render.barraAccion.mostrar){
 			this.appService.setControl("bloqueoMensaje");
 			setTimeout(()=>{  
 					this.renderMazmorra.render.barraAccion.mostrar = false;
      				this.appService.setControl("desbloqueoMensaje");
 			}, 2000);	
 		}

 		console.log("Partida Inicializada: ");
 		console.log(this.renderMazmorra);
		this.mostrarMazmorra= true;

		//Inicializar Canvas Isometrico:
		this.appService.renderizarCanvasIsometrico();


 	}

 	getRenderMazmorra(): RenderMazmorra{
 		return this.renderMazmorra;
 	}

 	setRenderMazmorra(render): void{
 		this.renderMazmorra= Object.assign({},render);
 		this.cargarAutoGuardado.emit(render);
 		return;
 	}

 	setDispositivo(dispositivo){
 		this.dispositivo= dispositivo;
 		return;
 	}

 	getDispositivo(){
 		return this.dispositivo;
 	}

 	setEstadoControl(estado):void{
 		this.renderMazmorra.estadoControl.estado= estado;
 		return;
 	}

	/* 	----------------------------------------------
				MANEJO BASE DE DATOS LOCAL
 	----------------------------------------------*/
	//Guarda en almacenamiento local el objeto
  	insertarDB(objeto): void{
  		this.db.insert(objeto, function(err, record) {
    	if (err) {
        	alert(err);
        	return;
    	}
    	console.log(record);
		});
  	}
  	//Busca objeto en almacenamiento
  	leerDB(): void{
  		this.db.find({}, function(err, record) {
    	if (err) {
    	    console.error(err);
    	}
    	console.log(record);
		});
  	}
  
	/* 	----------------------------------------------
			FUNCIONES BASICAS
 	----------------------------------------------*/

 	//Funcion principal de paso de turno:
 	pasarTurno(): void{

				//Restriccion por BLOQUEO:
				if(this.appService.control=="null"){this.appService.setControl("mazmorra");}
				if(this.appService.control!="mazmorra"){return;}

				//Restringir accion por turno incorrecto.
				if(!this.comandoSocketActivo){
					if(this.personaje.heroeIndex!= this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1] && this.restringirTurno){return;}
				}else{
					this.desactivarComandoSocket();
				}
			
			if(this.emisor){
				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "pasarTurno"});
				this.emisor=false;
			}

			console.log("Pasando Turno...");
			if(this.renderMazmorra.estadoControl.estado=="seleccionObjetivo"){
				this.renderMazmorra.estadoControl.estado = "seleccionAccion";
 				this.renderMazmorra.estadoControl.hechizo = 0;
				this.cancelarObjetivo();
			}
			//Pasar turno aplicando buffos:
			this.loggerService.log("-------------- Pasando Turno ------------------");
 			this.lanzarBuffos();

 		//Elimina a los enemigos Muertos:
 		this.enemigoMuerto(-1);

 		//Agregar nuevo registro de analisis:
 		for(var i=0; i <this.renderMazmorra.numHeroes;i++){
 			this.renderMazmorra.estadisticas[i].dano.push(0);
 			this.renderMazmorra.estadisticas[i].heal.push(0);
 			this.renderMazmorra.estadisticas[i].escudo.push(0);
 			this.renderMazmorra.estadisticas[i].agro.push(0);
 		}

 		//Paso de turno Con modificador por muerte de enemigo:
 		if(this.turnoModificado){

 			//Los ultimos enemigos han sido eliminados:
 			if(this.renderMazmorra.heroes[0].turno){
 				this.renderMazmorra.turno++;
 				this.renderMazmorra.registroTurno.push(0);
 				this.renderMazmorra.heroes[0].turno = true;
 				this.renderMazmorra.heroes[0].acciones = 2;
 				this.mensajeAccion("Turno de "+this.renderMazmorra.heroes[0].nombre,2000);
 				this.loggerService.log("-------------- Turno de "+this.renderMazmorra.heroes[0].nombre+" ------------------");
 				this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.heroes[0].nombre;
 				this.renderMazmorra.render.barraAccion.claseTurno="/Clases/"+this.renderMazmorra.heroes[0].clase.toLowerCase();

 				this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 				this.autoGuardado2 = cloneDeep(this.autoGuardado);
 				this.autoGuardado = cloneDeep(this.renderMazmorra);
 				this.turnoModificado= false;
				this.cambiarControlPersonaje();
 				return;
 			}

 			//Paso de turno entre enemigos:
 			for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 				if(this.renderMazmorra.enemigos[i].turno){
 					this.loggerService.log("-------------- Turno de "+this.renderMazmorra.enemigos[i].nombre+" ------------------");
 					this.mensajeAccion("Turno de "+this.renderMazmorra.enemigos[i].nombre,2000);
 					this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.enemigos[i].nombre;
 					this.renderMazmorra.render.barraAccion.claseTurno="/Enemigos/"+this.renderMazmorra.enemigos[i].nombre.toLowerCase();
					
					this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 					this.autoGuardado2 = cloneDeep(this.autoGuardado);
 					this.autoGuardado = cloneDeep(this.renderMazmorra);
 					this.turnoModificado= false;
					this.cambiarControlPersonaje();
 					return;
 				}
 			}
 		} //Fin de modificador por muerte.

 		//Paso de turno entre heroes:
 		for(var i=0; i <this.renderMazmorra.heroes.length-1; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				this.renderMazmorra.heroes[i].turno = false;
 				this.renderMazmorra.heroes[i+1].turno = true;
 				this.renderMazmorra.registroTurno.push(i+1);
 				this.renderMazmorra.heroes[i+1].acciones = 2;
 				this.loggerService.log("-------------- Turno de "+this.renderMazmorra.heroes[i+1].nombre+" ------------------");
 				this.mensajeAccion("Turno de "+this.renderMazmorra.heroes[i+1].nombre,2000);
 				this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.heroes[i+1].nombre;
 				this.renderMazmorra.render.barraAccion.claseTurno="/Clases/"+this.renderMazmorra.heroes[i+1].clase.toLowerCase();
 				
 				this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 				this.autoGuardado2 = cloneDeep(this.autoGuardado);
 				this.autoGuardado = cloneDeep(this.renderMazmorra);
				this.cambiarControlPersonaje();
 				return;
 			}
 		}
 		//Paso de turno entre enemigos:
 		for(var i=0; i <this.renderMazmorra.enemigos.length-1; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				this.renderMazmorra.enemigos[i].turno = false;
 				this.renderMazmorra.enemigos[i+1].turno = true;
 				this.renderMazmorra.registroTurno.push(-(i+2));
 				this.renderMazmorra.enemigos[i+1].acciones= 2;
 				this.loggerService.log("-------------- Turno de "+this.renderMazmorra.enemigos[i+1].nombre+" ------------------");
 				this.mensajeAccion("Turno de "+this.renderMazmorra.enemigos[i+1].nombre,2000);
 				this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.enemigos[i+1].nombre;
 				this.renderMazmorra.render.barraAccion.claseTurno="/Enemigos/"+this.renderMazmorra.enemigos[i+1].nombre.toLowerCase();

 				this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 				this.autoGuardado2 = cloneDeep(this.autoGuardado);
 				this.autoGuardado = cloneDeep(this.renderMazmorra);
				this.cambiarControlPersonaje();
 				return;
 			}
 		}
 		// Paso de turno Heroe-Enemigo:
 		if(this.renderMazmorra.heroes[this.renderMazmorra.heroes.length-1].turno){

 			if(this.renderMazmorra.enemigos.length>0){
 				this.renderMazmorra.enemigos[0].turno = true;
 				this.renderMazmorra.registroTurno.push(-1);
 				this.renderMazmorra.enemigos[0].acciones = 2;
 				this.renderMazmorra.heroes[this.renderMazmorra.heroes.length-1].turno = false;
 				this.loggerService.log("-------------- Turno de "+this.renderMazmorra.enemigos[0].nombre+" ------------------");
 				this.mensajeAccion("Turno de "+this.renderMazmorra.enemigos[0].nombre,2000);
 				this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.enemigos[0].nombre;
 				this.renderMazmorra.render.barraAccion.claseTurno="/Enemigos/"+this.renderMazmorra.enemigos[0].nombre.toLowerCase();
 			}else{
 				this.renderMazmorra.heroes[0].turno = true;
 				this.renderMazmorra.registroTurno.push(0);
 				this.renderMazmorra.heroes[0].acciones = 2;
 				this.renderMazmorra.heroes[this.renderMazmorra.heroes.length-1].turno = false;
 				this.loggerService.log("-------------- Turno de "+this.renderMazmorra.heroes[0].nombre+" ------------------");
 				this.mensajeAccion("Turno de "+this.renderMazmorra.heroes[0].nombre,2000);
 				this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.heroes[0].nombre;
 				this.renderMazmorra.render.barraAccion.claseTurno="/Clases/"+this.renderMazmorra.heroes[0].clase.toLowerCase();
 			}

 			this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 			this.autoGuardado2 = cloneDeep(this.autoGuardado);
 			this.autoGuardado = cloneDeep(this.renderMazmorra);
			this.cambiarControlPersonaje();
 			return;
 		}

 		// Paso de turno Enemigo-Heroe:
 		if(this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].turno){
 			this.renderMazmorra.turno++;
 			this.renderMazmorra.heroes[0].turno = true;
 			this.renderMazmorra.registroTurno.push(0);
 			this.renderMazmorra.heroes[0].acciones = 2;
 			this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].turno = false;
 			this.loggerService.log("-------------- Turno de "+this.renderMazmorra.heroes[0].nombre+" ------------------");
 			this.mensajeAccion("Turno de "+this.renderMazmorra.heroes[0].nombre,2000);
 			this.renderMazmorra.render.barraAccion.nombreTurno=this.renderMazmorra.heroes[0].nombre;
 			this.renderMazmorra.render.barraAccion.claseTurno="/Clases/"+this.renderMazmorra.heroes[0].clase.toLowerCase();
			
			this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
 			this.autoGuardado2 = cloneDeep(this.autoGuardado);
 			this.autoGuardado = cloneDeep(this.renderMazmorra);
			this.cambiarControlPersonaje();
 			return;
 		}

 	}

 	//Muestra mensaje en barra de acción y bloquea input:
 	mensajeAccion(mensaje: string, tiempoMensaje: number):void{
 		this.renderMazmorra.render.barraAccion.mensajeAccion = mensaje;
 		this.renderMazmorra.render.barraAccion.mostrar = true;
 		this.appService.setControl("bloqueoMensaje");
 		setTimeout(()=>{  
 				this.renderMazmorra.render.barraAccion.mostrar = false;
      			this.appService.setControl("desbloqueoMensaje");
 		}, tiempoMensaje);	
 	}

	//Cambiar Control Personaje:
	cambiarControlPersonaje(){

		//CAMBIAR PERSONAJE CONTROL SI PERMITE MULTI CONTROL:
		if(this.permitirMultiControl){
			console.log("Cambiando control personaje (Multicontrol)");
			console.log(this.personaje)
			//Buscar si el turno es de un Heroe y seleccionar como control:
			for(var i=0; i <this.renderMazmorra.heroes.length-1; i++){
				if(this.renderMazmorra.heroes[i].turno){
					this.renderMazmorra.personaje = this.renderMazmorra.heroes[i].nombre;
					this.renderMazmorra.personajeIndex = i;
					this.personaje.nombre = this.renderMazmorra.heroes[i].nombre;
					this.personaje.heroeIndex = i;
					this.personaje.clase = this.renderMazmorra.heroes[i].clase;;
				}
			}
		}

	}

 	//Gestiona el cambio de sala:
 	addEnemigo(idEnemigo:number):void{
 		//Añade los enemigos de la nueva sala a la instancia:
 		var enemigoAdd= this.enemigos.enemigos_stats.find(j => j.id == idEnemigo);
 		console.log(enemigoAdd);
 		this.loggerService.log("--------------Añadiendo Enemigo-----------------");
 		this.loggerService.log("Añadiendo: "+enemigoAdd.nombre);

 		
 		if(enemigoAdd.nombre=="0"){
 			enemigoAdd.nombre = this.enemigos.enemigos_stats.find(j => j.id == idEnemigo);
 		}

 			this.renderMazmorra.enemigos.push({
 				nombre: enemigoAdd.nombre,
 				enemigo_id: enemigoAdd.id,
				tipo_enemigo_id: enemigoAdd.tipo_enemigo_id,
				familia: this.enemigos.enemigos_stats.find(k => k.id === enemigoAdd.enemigo_id).familia.toLowerCase(),
 				turno: false,
 				vida: 100,
 				escudo: 0,
 				agro: [],
 				buff:[],
 				estadisticas: {
 					armadura: enemigoAdd.armadura,
					vitalidad: enemigoAdd.vitalidad,
					fuerza: enemigoAdd.fuerza,
					intelecto: enemigoAdd.intelecto,
					precision: enemigoAdd.precision,
					ferocidad: enemigoAdd.ferocidad,
					general: 0
 				},
 				objetivo: false,
 				acciones: 2,
 				objetivoAuxiliar: false,
 				hechizos: enemigoAdd.hechizos_id,
				mostrarAnimacion: false,
 				animacion: {
					id: 1,
					nombre: "Basico",
					duracion: "1",
					subanimaciones: [],
					sonidos: []
				}
 			});

 			//Inicializacion de Agro:
 			for(var j= 0; j <this.renderMazmorra.numHeroes;j++){
 				this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].agro.push(0);
 			}

 			this.loggerService.log("Agregando enemigo: "+this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].nombre);
 		

 		//Calcular estadisticas Enemigos:
 		
 		//this.calcularEstadisticas(false,this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1]);

 		console.log(this.renderMazmorra.enemigos);
 		this.loggerService.log("----------------------------------------------");
 	}

 	//Gestiona el cambio de sala:
 	cambiarSala(sala:number):void{

 		//Añade los enemigos de la nueva sala a la instancia:
		console.log(this.mazmorra)

 		var enemigosAdd= this.mazmorra.salas.filter(j => j.sala_id == sala)[0].enemigos;

 		this.loggerService.log("--------------Cambiando Sala------------------");
 		this.loggerService.log("Cambiando de sala: "+sala);

		console.log(enemigosAdd)

 		for(var i=0; i <enemigosAdd.length;i++){
 			if(enemigosAdd[i].nombre=="0"){
 				enemigosAdd[i].nombre = this.enemigos.enemigos_stats.find(j => j.id == enemigosAdd[i].enemigo_id).nombre;
 			}
 			this.renderMazmorra.enemigos.push({
 				nombre: enemigosAdd[i].nombre,
 				enemigo_id: enemigosAdd[i].enemigo_id,
				tipo_enemigo_id: enemigosAdd[i].tipo_enemigo_id,
				familia: this.enemigos.enemigos_stats.find(k => k.id === enemigosAdd[i].enemigo_id).familia.toLowerCase(),
 				turno: false,
 				vida: 100,
 				escudo: 0,
 				agro: [],
 				buff:[],
 				estadisticas: {
 					armadura: 0,
					vitalidad: 0,
					fuerza: 0,
					intelecto: 0,
					precision: 0,
					ferocidad: 0,
					general: 0
 				},
 				objetivo: false,
 				acciones: 2,
 				objetivoAuxiliar: false,
 				hechizos: this.enemigos.enemigos_stats.find(k => k.id === enemigosAdd[i].enemigo_id).hechizos_id,
				mostrarAnimacion: false,
 				animacion: {
					id: 1,
					nombre: "Basico",
					duracion: "1",
					subanimaciones: [],
					sonidos: []
				}
 			});

 			//Inicializacion de Agro:
 			for(var j= 0; j <this.renderMazmorra.numHeroes;j++){
 				this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].agro.push(0);
 			}

 			this.loggerService.log("Agregando enemigo: "+this.renderMazmorra.enemigos[this.renderMazmorra.enemigos.length-1].nombre);
 		}

 		//Calcular estadisticas Enemigos:
 		for (var i = 0; i < this.renderMazmorra.enemigos.length; i++) {
 			this.calcularEstadisticas(false,this.renderMazmorra.enemigos[i]);
 		}

 		console.log(this.renderMazmorra.enemigos);
 		this.loggerService.log("----------------------------------------------");
 	}

 	//Calcular Estadisticas:
 	calcularEstadisticas(esHeroe:boolean,caster:any):void{
 		
 		if(esHeroe){
 			//var clase= caster.clase.toLowerCase().charAt(0).toUpperCase() + caster.clase.toLowerCase().slice(1);
 			//var clase= caster.clase.toUpperCase();
 			var clase= caster.clase.toLowerCase();
 			if(clase=="Mago_de_sangre" || clase=="Mago de sangre"){clase="mago_de_sangre"}
 			var especializacion = "NO_SPEC";
 			var estadisticasEquipo= 0;
 			var nivel_spec = 10;

 			//Calculo de estadistica general y modificadores:
 			var modificadorVitalidad = 0;
 			var modificadorFuerza = 0;
 			var modificadorIntelecto = 0;
 			var modificadorAgilidad = 0;
 			var modificadorPrecision = 0;
 			var modificadorFerocidad = 0;
 			var modificadorTotal = 0;

 			//estadisticasEquipo= caster.estadisticas.general;
 			estadisticasEquipo= 0;

 			//Calcula estadisticas HEROE:
 			if(this.renderMazmorra.nivel_equipo <nivel_spec){
 				caster.estadisticas.armadura= 0;
 				console.log(clase);
				console.log(this.parametros)
 				caster.estadisticas.vitalidad= this.parametros.personajes.find(i => i.clase==clase).vitalidad_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_vitalidad / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.fuerza= this.parametros.personajes.find(i => i.clase==clase).fuerza_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_fuerza / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.intelecto= this.parametros.personajes.find(i => i.clase==clase).intelecto_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_intelecto / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.agilidad= this.parametros.personajes.find(i => i.clase==clase).agilidad_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_aguilidad / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.precision= this.parametros.personajes.find(i => i.clase==clase).precision_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_precision / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.ferocidad= this.parametros.personajes.find(i => i.clase==clase).ferocidad_base + (estadisticasEquipo + this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo) * this.parametros.personajes.find(i => i.clase==clase).mod_ferocidad / this.parametros.personajes.find(i => i.clase==clase).suma_mod;
 				caster.estadisticas.general= caster.estadisticas.vitalidad+caster.estadisticas.fuerza+caster.estadisticas.intelecto+caster.estadisticas.agilidad+caster.estadisticas.ferocidad+caster.estadisticas.precision+caster.estadisticas.armadura;

 			}else{
 				caster.estadisticas.armadura= 0;
 				caster.estadisticas.vitalidad= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).vitalidadBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorVitalidad/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorVitalidad / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.fuerza= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).fuerzaBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorFuerza/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorFuerza / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.intelecto= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).intelectoBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorIntelecto/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorIntelecto / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.agilidad= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).agilidadBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorAgilidad/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorAgilidad / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.precision= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).precisionBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorPrecision/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorPrecision / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.ferocidad= this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).ferocidadBase +(estadisticasEquipo + this.parametros.escalado[0].esc_stats*nivel_spec*this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").modificadorFerocidad/this.parametros["parametros"+clase].find(i => i.especializacion=="NO_SPEC").sumaModificador)+(estadisticasEquipo * this.parametros.escalado[0].esc_stats * this.renderMazmorra.nivel_equipo-nivel_spec) * this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).modificadorAgilidad / this.parametros["parametros"+clase].find(i => i.especializacion==especializacion).sumaModificador;
 				caster.estadisticas.general= caster.estadisticas.vitalidad+caster.estadisticas.fuerza+caster.estadisticas.intelecto+caster.estadisticas.agilidad+caster.estadisticas.ferocidad+caster.estadisticas.precision+caster.estadisticas.armadura;
 			}
 		
 		}else{

 			//Calcula estadisticas ENEMIGO:
 			caster.estadisticas.armadura= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).armadura;
 			caster.estadisticas.vitalidad= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).vitalidad;
 			caster.estadisticas.fuerza= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).fuerza;
 			caster.estadisticas.intelecto= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).intelecto;
 			caster.estadisticas.precision= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).precision;
 			caster.estadisticas.ferocidad= this.enemigos.enemigos_stats.find(j => j.id === caster.enemigo_id).ferocidad;
 		}	
 	}

	/* 	----------------------------------------------
			MANEJO DE OBJETIVOS
 	----------------------------------------------*/

 	//Selecciona los objetivos del hechizo indicado segun de quien sea el turno:
 	seleccionObjetivo(numHechizo: number):void{

 		this.renderMazmorra.estadoControl.estado = "seleccionObjetivo";
 		this.renderMazmorra.estadoControl.hechizo = numHechizo;

 		console.log(this.renderMazmorra.render.objetivoPredefinido.enemigos);

 		//Si hay objetivos predefinidos Lanza el hechizo automaticamente
 		if(this.renderMazmorra.render.objetivoPredefinido.enemigos.length!=0){
 			//this.lanzarHechizo();
 			this.activarRNG()
 			return;
 		}

 		if(this.renderMazmorra.render.objetivoPredefinido.heroes.length!=0){
 			//this.lanzarHechizo();
 			this.activarRNG()
 			return;
 		}

 		var clase;
 		//Detectar de quien es el turno (Heroes):
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				//Turno del heroe[i]:
 				clase= this.renderMazmorra.heroes[i].clase.toLowerCase();
 				this.renderMazmorra.estadoControl.tipoObjetivo = this.hechizos.hechizos.find(j => j.id==numHechizo).objetivo;

 				//Si el caster es heroe y el objetivo es AL:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AL"){
 					this.renderMazmorra.heroes[i].objetivo = true;
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}

 				//Si el caster es heroe y el objetivo es EU:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
 					this.renderMazmorra.enemigos[0].objetivo = true;
 				}

 				//Si el caster es heroe y el objetivo es AU:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
 					this.renderMazmorra.heroes[0].objetivo = true;
 				}

 				//Si el caster es heroe y el objetivo es EM:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
 					this.renderMazmorra.enemigos[0].objetivoAuxiliar = true;
 				}

 				//Si el caster es heroe y el objetivo es AM:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
 					this.renderMazmorra.heroes[0].objetivoAuxiliar = true;
 				}

 				//Si el caster es heroe y el objetivo es AA:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AA"){
 					for(var j=0; j <this.renderMazmorra.heroes.length; j++){
 						this.renderMazmorra.heroes[j].objetivo = true;
 					}
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}

 				//Si el caster es heroe y el objetivo es EE:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EA"){
 					for(var j=0; j <this.renderMazmorra.enemigos.length; j++){
 						this.renderMazmorra.enemigos[j].objetivo = true;
 					}
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}
 				
 			}
 		}

 		//Detectar de quien es el turno (Enemigos):
 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				//Turno del enemigo[i]:
 				clase= this.renderMazmorra.enemigos[i].nombre;
 				//var hechizosEnemigos = this.enemigos.enemigos_hech.find(j => j.id==this.renderMazmorra.enemigos[i].hechizos);
 				this.renderMazmorra.estadoControl.tipoObjetivo = this.enemigos.enemigos_hech.find(j => j.id==numHechizo).objetivo;

 				//Si el caster es enemigo y el objetivo es AL:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AL"){
 					this.renderMazmorra.enemigos[i].objetivo = true;
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}

 				//Si el caster es enemigo y el objetivo es EU:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
 					this.renderMazmorra.heroes[0].objetivo = true;
 				}

 				//Si el caster es enemigo y el objetivo es AU:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
 					this.renderMazmorra.enemigos[0].objetivo = true;
 				}

 				//Si el caster es enemigo y el objetivo es EM:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
 					this.renderMazmorra.heroes[0].objetivoAuxiliar = true;
 				}

 				//Si el caster es enemigo y el objetivo es AM:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
 					this.renderMazmorra.enemigos[0].objetivoAuxiliar = true;
 				}

 				//Si el caster es enemigo y el objetivo es AA:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="AA"){
 					for(var j=0; j <this.renderMazmorra.enemigos.length; j++){
 						this.renderMazmorra.enemigos[j].objetivo = true;
 					}
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}

 				//Si el caster es enemigo y el objetivo es EE:
 				if(this.renderMazmorra.estadoControl.tipoObjetivo=="EE"){
 					for(var j=0; j <this.renderMazmorra.heroes.length; j++){
 						this.renderMazmorra.heroes[j].objetivo = true;
 					}
 					//this.lanzarHechizo();
 					this.activarRNG()
 				}
 				
 			}
 		}
 	}

 	//Cancela la selecion de objetivos:
 	cancelarObjetivo(): void{

 		//Elimina objetivos en heroes: 
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
 				this.renderMazmorra.heroes[i].objetivoAuxiliar= false;
 			}
 			if(this.renderMazmorra.heroes[i].objetivo){
 				this.renderMazmorra.heroes[i].objetivo= false;
 			}
 		}

 		//Elimina objetivos en enemigos:
 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){
 				this.renderMazmorra.enemigos[i].objetivoAuxiliar= false;
 			}
 			if(this.renderMazmorra.enemigos[i].objetivo){
 				this.renderMazmorra.enemigos[i].objetivo= false;
 			}
 		}
 		this.renderMazmorra.estadoControl.estado = "seleccionAccion";
 	}

 	//moverObjetivo (positivo--> DERECHA; negativo --> IZQUIERDA)
 	moverObjetivo(val:number):void{

 		//Mueve objetivo AU && EU:
 		if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU" || this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
 			//Evalua objetivos en heroes:
 			for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 				if(this.renderMazmorra.heroes[i].objetivo){
 					if((val+i>=0) && (val+i <this.renderMazmorra.heroes.length)){
 						this.renderMazmorra.heroes[i].objetivo=false;
 						this.renderMazmorra.heroes[i+val].objetivo=true;
 						return;
 					}
 				}
 			}
 			//Evalua objetivos en enemigos:
 			for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 				if(this.renderMazmorra.enemigos[i].objetivo){
 					if((val+i>=0) && (val+i <this.renderMazmorra.enemigos.length)){
 						this.renderMazmorra.enemigos[i].objetivo=false;
 						this.renderMazmorra.enemigos[i+val].objetivo=true;
 						return;
 					}
 				}
 			}
 		}

 		//Mueve el objetivo Auxiliar en AM && EM 
 		if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM" || this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
 			//Evalua objetivos Auxiliares en heroes:
 			for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 				if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
 					if((val+i>=0) && (val+i <this.renderMazmorra.heroes.length)){
 						this.renderMazmorra.heroes[i].objetivoAuxiliar=false;
 						this.renderMazmorra.heroes[i+val].objetivoAuxiliar=true;
 						return;
 					}
 				}
 			}
 			//Evalua objetivos Auxiliares en enemigos:
 			for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 				if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){
 					if((val+i>=0) && (val+i <this.renderMazmorra.enemigos.length)){
 						this.renderMazmorra.enemigos[i].objetivoAuxiliar=false;
 						this.renderMazmorra.enemigos[i+val].objetivoAuxiliar=true;
 						return;
 					}
 				}
 			}
 		}
 	}

 	//Selecciona el objetivo desde un objetivo auxiliar:
 	seleccionarObjetivo(): void{
 		//Evalua objetivos Auxiliares en heroes: (Invierte el objetivo en el objetivo auxiliar)
 			for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 				if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
 					this.renderMazmorra.heroes[i].objetivo= !this.renderMazmorra.heroes[i].objetivo;
 					return;
 				}
 			}
 			//Evalua objetivos Auxiliares en enemigos: (Invierte el objetivo en el objetivo auxiliar)
 			for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 				if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){
 					this.renderMazmorra.enemigos[i].objetivo= !this.renderMazmorra.enemigos[i].objetivo;
 					return;
 				}
 			}
 	}

	/* 	----------------------------------------------
			GESTION DE HECHIZOS
 	----------------------------------------------*/
 	//Verifica si el hechizo se puede comenzar:
 	verificarCasteo(numHechizo:number):boolean{
 		var resultado= true;

 		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
 		var indiceCaster;
 		this.esHeroe = false;
 		this.esEnemigo = false;
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				this.esHeroe= true;
 				indiceCaster = i;
  				break;
 			}
 		}

 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				this.esEnemigo= true;
 				indiceCaster= i;
 				break;
 			}
 		}

 		if(this.esHeroe){
 			if(this.renderMazmorra.heroes[indiceCaster].recurso < this.hechizos.hechizos.find(j => j.id==numHechizo).recurso){
 				if(this.restringirRecurso){
 					this.mensajeAccion("Recurso Insuficiente", 1000);
 					resultado = false;
 				}
 			}

 			if(this.renderMazmorra.heroes[indiceCaster].energia < this.hechizos.hechizos.find(j => j.id==numHechizo).recurso){
 				if(this.restringirRecurso){
 					this.mensajeAccion("Energia Insuficiente", 1000);
 					resultado = false;
 				}
 			}

 			if(this.renderMazmorra.heroes[indiceCaster].recursoEspecial < this.hechizos.hechizos.find(j => j.id==numHechizo).poder){
 				if(this.restringirRecurso){
 					this.mensajeAccion("Poder Insuficiente", 1000);
 					resultado = false;
 				}
 			}

 			if(this.renderMazmorra.heroes[indiceCaster].acciones < this.hechizos.hechizos.find(j => j.id==numHechizo).acciones){
 				if(this.restringirAcciones){
 					this.mensajeAccion("Acciones Insuficientes", 1000);
 					resultado = false;
 				}
 			}
 		}

 		if(this.esEnemigo){
 			if(this.renderMazmorra.enemigos[indiceCaster].acciones < this.enemigos.enemigos_hech.find(i => i.id==this.renderMazmorra.enemigos[indiceCaster].hechizos).acciones){
 				if(this.restringirAcciones){
 					this.mensajeAccion("Acciones Insuficientes", 1000);
 					resultado = false;
 				}
 			}
 		}
 		return resultado
 	}

 	//Lanzar Hechizo sobre los objetivos selecionados (Genera una aplización de hechizo por objetivo):
 	lanzarHechizo():void{

 		//Reinicia el contador de lanzamiento de hechizo:
 		this.cuentaAplicacionHechizo=0;

 		//Bloquea los inputs:
 		this.appService.setControl("bloqueoHechizo");
 		this.renderMazmorra.render.barraAccion.mensajeAccion = "Procesando...";
 		this.renderMazmorra.render.barraAccion.mostrar = true;

 		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
 		var caster;
 		var esHeroe = false;
 		var esEnemigo = false;
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				esHeroe= true;
 				caster= this.renderMazmorra.heroes[i];
  				break;
 			}
 		}

 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				esEnemigo= true;
 				caster= this.renderMazmorra.enemigos[i];
 				break;
 			}
 		}
 		console.log(caster);
 		//------------------------------------
 		//Declara las propiedades del hechizo:
 		//------------------------------------
 		var hechizo = {
 				id: 0,
 				nombre: "null",
 				tipo: "0",
 				recurso: 0,
 				acciones: 0,
 				poder: 0,
 				dano_dir: 0,
 				heal_dir: 0,
 				escudo_dir: 0,
				buff_id: 0,
				funcion: 0,
				objetivo: 0,
				animacion: 0,
				hechizo_encadenado_id: 0
 		}

 		//Si el caster es heroe:
 		if(esHeroe){
 			hechizo={
 				id: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].id,
 				nombre: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].nombre,
 				tipo: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].tipo_daño,
 				recurso: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].recurso,
 				poder: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].poder,
 				acciones: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].acciones,
 				dano_dir: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].daño_dir,
 				heal_dir: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].heal_dir,
 				escudo_dir: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].escudo_dir,
				buff_id: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].buff_id,
				funcion: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].funcion,
				objetivo: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].objetivo,
				animacion: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].animacion_id,
				hechizo_encadenado_id: this.hechizos.hechizos[this.renderMazmorra.estadoControl.hechizo-1].hech_encadenado_id
 			}

 		console.log("Lanzando hechizo:");
 		console.log(hechizo);
 		console.log("RNG: ");
 		console.log(this.renderMazmorra.estadoControl.rng);

 		//Si el caster es enemigo:
 		}else if(esEnemigo){
 			hechizo={
 				id: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).id,
 				nombre: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).nombre,
 				tipo: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).tipo,
 				recurso:this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).recurso,
 				poder: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).poder,
 				acciones: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).acciones,
 				dano_dir: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).daño_dir,
 				heal_dir: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).heal_dir,
 				escudo_dir: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).escudo_dir,
				buff_id: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).buff_id,
				funcion: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).funcion,
				objetivo: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).objetivo,
				animacion: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).animacion_id,
				hechizo_encadenado_id: this.enemigos.enemigos_hech.find(i => i.id==caster.hechizos).hechizo_encadenado_id
 			}
 			
 		console.log("Lanzando hechizo:");
 		console.log(hechizo);
 		

 		}else{
 			console.log("Error: Caster no identificado");
 			return;
 		}

 		//---------------------------------------------------------------
 		// Consumo del recurso del hechizo:
 		//----------------------------------------------------------------

 		if(esHeroe){
 			this.renderMazmorra.heroes.find(i => i.nombre == caster.nombre).recurso -= hechizo.recurso;
 			this.renderMazmorra.heroes.find(i => i.nombre == caster.nombre).recursoEspecial -= hechizo.poder;
 			this.renderMazmorra.heroes.find(i => i.nombre == caster.nombre).energia -= hechizo.recurso;

 			if(caster.recurso>100){
 				caster.recurso= 100;
 			}

 		}

 		//---------------------------------------------------------------
 		// Consumo de acciones:
 		//---------------------------------------------------------------

 		if(esHeroe){
 			this.renderMazmorra.heroes.find(i => i.nombre == caster.nombre).acciones -= hechizo.acciones;
 		}

 		//---------------------------------------------------------------
 		// Se aplican modificadores al hechizo: (Modificacion por stats)
 		//----------------------------------------------------------------

 		//hechizo = this.aplicarModificadoresHechizo(hechizo);

 		//---------------------------------------------------------------
 		// Iteramos efectos en los objetivos:
 		//----------------------------------------------------------------
 		var objetivosEnemigos=[];
 		var objetivosHeroes=[];

 		//Iteramos enemigos:
 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].objetivo){
 				objetivosEnemigos.push(i);
 			}
 		}

 		//Iteramos heroes:
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].objetivo){
 				objetivosHeroes.push(i);
 			}
 		}

 		//Eliminamos los objetivos:

 			//Elimina objetivos en heroes: 
 			for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 				if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
 					this.renderMazmorra.heroes[i].objetivoAuxiliar= false;
 				}
 				if(this.renderMazmorra.heroes[i].objetivo){
 					this.renderMazmorra.heroes[i].objetivo= false;
 				}

 			}
 			//Elimina objetivos en enemigos:
 			for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 				if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){
 					this.renderMazmorra.enemigos[i].objetivoAuxiliar= false;
 				}
 				if(this.renderMazmorra.enemigos[i].objetivo){
 					this.renderMazmorra.enemigos[i].objetivo= false;
 				}
 			}

 		//Si hay objetivos predefinidos Remplaza los objetivos por los predefinidos:
 		if(this.renderMazmorra.render.objetivoPredefinido.enemigos.length!=0){
 			objetivosEnemigos = this.renderMazmorra.render.objetivoPredefinido.enemigos;
 		}

 		if(this.renderMazmorra.render.objetivoPredefinido.heroes.length!=0){
 			objetivosHeroes = this.renderMazmorra.render.objetivoPredefinido.heroes;
 		}

 		//Logger
 		this.loggerService.log("--- HECHIZO ("+hechizo.nombre+")--- ","lightblue");

 		//Aplicamos el hechizo en los objetivos:
 		this.aplicarHechizos(hechizo,objetivosEnemigos,objetivosHeroes);
 	}

 	//Aplica de forma iterativa el hechizo sobre los objetivos:
 	aplicarHechizos(hechizo: any, objetivoEnemigos: any, objetivoHeroes: any):void{
 		
 		//Añadir cuanta aplicacion hechizo:
 		this.cuentaAplicacionHechizo++;

 		//Guarda una copia del hechizo original para relanzamientos:
 		var hechizoOriginal= Object.assign({},hechizo);

 		console.log("Aplicando Hechizo: "+hechizo.nombre);
 
 		//Condicion de desbloqueo (No encontrar hechizos por aplicar):
 		var desbloqueo=true;

 		//Detecta quien es el caster (Heroes/Enemigo):
 		var esHeroe = false;
 		var esEnemigo = false;
 		var caster;
 		var casterIndice;
 		var parametroSeleccionado;

 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				esHeroe= true;
 				caster= this.renderMazmorra.heroes[i];
 				casterIndice= i;
  				break;
 			}
 		}

 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				esEnemigo= true;
 				caster= this.renderMazmorra.enemigos[i];
 				casterIndice= i;
 				break;
 			}
 		}

 		//HECHIZO SOBRE ENEMIGO:

 		//Efectua hechizo sobre un enemigo:
 		if(objetivoEnemigos.length>0){

 			//Logger:
 			this.loggerService.log("*** "+caster.nombre+ " --> "+this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].nombre,"pink");
 			if(hechizo.buff_id!=0){
 				this.loggerService.log("Aplicando BUFF/DEBUFF (ID: "+hechizo.buff_id+")...","yellow");
 			}

 			//Realiza animacion:
 			this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].animacion= this.animaciones.animaciones.find(i => i.id== hechizo.animacion);

			var objetivoProvisional = objetivoEnemigos[objetivoEnemigos.length-1];
			this.renderMazmorra.enemigos[objetivoProvisional].mostrarAnimacion= true;
			setTimeout(()=>{  
				this.renderMazmorra.enemigos[objetivoProvisional].mostrarAnimacion= false;
			}, 1000*(this.renderMazmorra.enemigos[objetivoProvisional].animacion.duracion));	


 			//Modificar de potencia del hechizo de salida:
 			if(esHeroe){
 				hechizo= this.modificacionHechizoSalidaHeroe(caster,hechizo);
 			}
 			if(esEnemigo){
 				hechizo= this.modificacionHechizoSalidaEnemigo(caster,hechizo);
 			}

 			//Modificación de los atributos
 			hechizo = this.modificacionHechizoEntradaEnemigo(objetivoEnemigos[objetivoEnemigos.length-1],hechizo);

 			//Aplicacion de Buffos:
 			if(hechizo.buff_id!=0){
 				if(esHeroe){
 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.push({
 						id: hechizo.buff_id,
						duracion: this.buff.buff.find(i => i.id==hechizo.buff_id).duracion,
						tipo: this.buff.buff.find(i => i.id==hechizo.buff_id).tipo,
						tipo2: this.buff.buff.find(i => i.id==hechizo.buff_id).tipo2,
						stat_inc: this.buff.buff.find(i => i.id==hechizo.buff_id).stat_inc,
						dano_t: this.buff.buff.find(i => i.id==hechizo.buff_id).daño_t,
						heal_t: this.buff.buff.find(i => i.id==hechizo.buff_id).heal_t,
						escudo_t: this.buff.buff.find(i => i.id==hechizo.buff_id).escudo_t,
						icon_id: this.buff.buff.find(i => i.id==hechizo.buff_id).imagen_id,
						rng: this.renderMazmorra.estadoControl.rng,
						origen: "0"
	 				});
	 			}else{
	 				this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.push({
 						id: hechizo.buff_id,
						duracion: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).duracion,
						tipo: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).tipo,
						tipo2: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).tipo2,
						stat_inc: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).stat_inc,
						dano_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).daño_t,
						heal_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).heal_t,
						escudo_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).escudo_t,
						icon_id: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).icon_id,
						rng: this.renderMazmorra.estadoControl.rng,
						origen: "0"
	 				});
	 			}
 				

 				//Asocia el origen del buffo:
 				if(esHeroe){
 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff[this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1].origen = "H"+casterIndice;
 				}else if(esEnemigo){
 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff[this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1].origen = "E"+casterIndice;
 				}
 				//Modificar de potencia del Buff segun el caster:
 				if(esHeroe){
 					this.modificacionBuffSalidaHeroeEnemigo(caster,objetivoEnemigos[objetivoEnemigos.length-1],this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1);
 				}
 				if(esEnemigo){
 					this.modificacionBuffSalidaEnemigoEnemigo(caster,objetivoEnemigos[objetivoEnemigos.length-1],this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1);
 				}

 				//Coloca efecto de stat increase:
 				var ultimoBuff = this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff[this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1];

 				if(ultimoBuff.stat_inc!=0){
 					var vectorInstrucciones = ultimoBuff.stat_inc.split("+");
 					var primerTipoStat;
 					var segundoTipoStat;
 					var operador;
 					var valorStat;

 					for(var i=0; i <vectorInstrucciones.length;i++){
 						console.log("Analizando la primera Instrucción: ");
 						console.log(vectorInstrucciones[i]);

 						primerTipoStat= vectorInstrucciones[i].slice(0,2);
 						operador=null;
 						segundoTipoStat=null;
 						valorStat= vectorInstrucciones[i].slice(2);

 						if(vectorInstrucciones[i].slice(-1)=="%"){
 							operador="%";
 							valorStat= vectorInstrucciones[i].slice(2,-1);
 						}

 						if(vectorInstrucciones[i].slice(-1)=="/"){
 							operador="/";
 							segundoTipoStat= vectorInstrucciones[i].slice(-3,-1);
 							valorStat= vectorInstrucciones[i].slice(2,-3);
 						}

 						var estadisticasEnemigo= {
	 						vidaTotal: (this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib),
	 						vida: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].vida,
	 						puntosVida: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].vida * (this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100,
	 						vidaFaltante: (this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)-( this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].vida * (this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100),
	 						vitalidad: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["vitalidad"],
	 						fuerza: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["fuerza"],
	 						intelecto: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["intelecto"],
	 						agilidad: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["agilidad"],
	 						precision: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["precision"],
	 						ferocidad: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["ferocidad"],
	 						armadura: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["armadura"],
	 						general: this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["general"],
	 						agro: 0,
	 					}
	 					

	 					for(var j=0; j <2;j++){
	 						if(j==0){parametroSeleccionado= primerTipoStat}else{parametroSeleccionado= segundoTipoStat};
	 						switch(parametroSeleccionado){
		 						case "VT":
		 							if(j==0){primerTipoStat= "vitalidad"}else{segundoTipoStat= "vitalidad"};
		 						break;
		 						case "FU":
		 							if(j==0){primerTipoStat= "fuerza"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "IN":
		 							if(j==0){primerTipoStat= "intelecto"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "GI":
		 							if(j==0){primerTipoStat= "agilidad"}else{segundoTipoStat= "agilidad"};
		 						break;
		 						case "PR":
		 							if(j==0){primerTipoStat= "precision"}else{segundoTipoStat= "precision"};
		 						break;
		 						case "FE":
		 							if(j==0){primerTipoStat= "ferocidad"}else{segundoTipoStat= "ferocidad"};
		 						break;
		 						case "AR":
		 							if(j==0){primerTipoStat= "armadura"}else{segundoTipoStat= "armadura"};
		 						break;
		 						case "VI":
		 							if(j==0){primerTipoStat= "puntosVida"}else{segundoTipoStat= "puntosVida"};
		 						break;
		 						case "MN":
		 							if(j==0){primerTipoStat= "recurso"}else{segundoTipoStat= "recurso"};
		 						break;
		 						case "AG":
		 							if(j==0){primerTipoStat= "agro"}else{segundoTipoStat= "agro"};
		 						break;
		 						case "PO":
		 							if(j==0){primerTipoStat= "poder"}else{segundoTipoStat= "poder"};
		 						break;
		 						case "GE":
		 							if(j==0){primerTipoStat= "general"}else{segundoTipoStat= "general"};
		 						break;
		 						case "VF":
		 							if(j==0){primerTipoStat= "vidaFaltante"}else{segundoTipoStat= "vidaFaltante"};
		 						break;
		 						case "MF":
		 							if(j==0){primerTipoStat= "manaFaltante"}else{segundoTipoStat= "manaFaltante"};
		 						break;
		 						case "TH":
		 							if(j==0){primerTipoStat= "vidaTotal"}else{segundoTipoStat= "vidaTotal"};
		 						break;
		 						case "TM":
		 							if(j==0){primerTipoStat= "manaTotal"}else{segundoTipoStat= "manaTotal"};
		 						break;
		 					}
	 					}

	 					//Modificar valores:

	 					//Operador Nulo
	 					if(operador==null){
	 						estadisticasEnemigo[primerTipoStat] += parseFloat(valorStat);
	 					}
	
	 					//Operador %
	 					if(operador=="%"){
	 						estadisticasEnemigo[primerTipoStat] += estadisticasEnemigo[primerTipoStat]*parseFloat(valorStat);
	 					}
	
	 					//Operador /
	 					if(operador=="/"){
	 						estadisticasEnemigo[primerTipoStat] += estadisticasEnemigo[segundoTipoStat]*parseFloat(valorStat);
	 					}

	 					//Devolver los valores modificados:
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["vitalidad"] = estadisticasEnemigo.vitalidad;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["fuerza"] = estadisticasEnemigo.fuerza;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["intelecto"] = estadisticasEnemigo.intelecto;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["agilidad"] = estadisticasEnemigo.agilidad;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["precision"] = estadisticasEnemigo.precision;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["ferocidad"] = estadisticasEnemigo.ferocidad;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["armadura"] = estadisticasEnemigo.armadura;
	 					this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].estadisticas["general"] = estadisticasEnemigo.general;
	 					if(primerTipoStat=="puntosVida"){
	 						this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].vida = estadisticasEnemigo.puntosVida/estadisticasEnemigo.vidaTotal*100;
	 					}
	 					
	 				}
 				}

 				//Aplica modificador de ENTRADA del buffo sobre el ENEMIGO:
 				this.modificacionBuffEntradaEnemigo(objetivoEnemigos[objetivoEnemigos.length-1],this.renderMazmorra.enemigos[objetivoEnemigos[objetivoEnemigos.length-1]].buff.length-1);
 			}

 			//Ejecutar funciones de hechizo:
 			this.ejecutarFuncionHechizo(hechizo.funcion,hechizo,objetivoEnemigos,objetivoHeroes);

 			//Aplicar hechizo final al objetivo:
 			this.aplicarHechizosFinalEnemigo(objetivoEnemigos[objetivoEnemigos.length-1],hechizo,caster);

 			//Eliminar objetivo del array:
 			objetivoEnemigos.splice(objetivoEnemigos.length-1, 1);

 		//HECHIZO SOBRE HEROE:

 		//Efectua hechizos sobre un Heroe:
 		}else if(objetivoHeroes.length>0){

 			//Logger:
 			this.loggerService.log("*** "+caster.nombre+ " --> "+this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].nombre,"pink");
 			if(hechizo.buff_id!=0){
 				this.loggerService.log("Aplicando BUFF/DEBUFF (ID: "+hechizo.buff_id+")...","yellow");
 			}
 			//Realiza animacion:
 			this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].animacion= hechizo.animacion;

 			//Modificar de potencia del hechizo de salida:
 			if(esHeroe){
 				this.modificacionHechizoSalidaHeroe(caster,hechizo);
 			}
 			if(esEnemigo){
 				this.modificacionHechizoSalidaEnemigo(caster,hechizo);
 			}

 			//Modificación de potencia del hechizo de Entrada:
 			hechizo= this.modificacionHechizoEntradaHeroe(objetivoHeroes[objetivoHeroes.length-1],hechizo);

 			//Aplicacion de Buffos:
 			if(hechizo.buff_id!=0){

 				if(esHeroe){
 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.push({
 						id: hechizo.buff_id,
						duracion: this.buff.buff.find(i => i.id==hechizo.buff_id).duracion,
						tipo: this.buff.buff.find(i => i.id==hechizo.buff_id).tipo,
						tipo2: this.buff.buff.find(i => i.id==hechizo.buff_id).tipo2,
						stat_inc: this.buff.buff.find(i => i.id==hechizo.buff_id).stat_inc,
						dano_t: this.buff.buff.find(i => i.id==hechizo.buff_id).daño_t,
						heal_t: this.buff.buff.find(i => i.id==hechizo.buff_id).heal_t,
						escudo_t: this.buff.buff.find(i => i.id==hechizo.buff_id).escudo_t,
						icon_id: this.buff.buff.find(i => i.id==hechizo.buff_id).icon_id,
						rng: this.renderMazmorra.estadoControl.rng,
						origen: "0"
	 				});
	 			}else{
	 				this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.push({
 						id: hechizo.buff_id,
						duracion: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).duracion,
						tipo: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).tipo,
						tipo2: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).tipo2,
						stat_inc: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).stat_inc,
						dano_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).daño_t,
						heal_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).heal_t,
						escudo_t: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).escudo_t,
						icon_id: this.enemigos.enemigos_buffos.find(i => i.id==hechizo.buff_id).icon_id,
						rng: this.renderMazmorra.estadoControl.rng,
						origen: "0"
	 				});
	 			}


 				//Asocia el origen del buffo:
 				if(esHeroe){
 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff[this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1].origen = "H"+casterIndice;
 				}else if(esEnemigo){
 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff[this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1].origen = "E"+casterIndice;
 				}

 				//Modificar de potencia del Buff segun el caster:
 				if(esHeroe){
 					this.modificacionBuffSalidaHeroeHeroe(caster,objetivoHeroes[objetivoHeroes.length-1],this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1);
 				}
 				if(esEnemigo){
 					this.modificacionBuffSalidaEnemigoHeroe(caster,objetivoHeroes[objetivoHeroes.length-1],this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1);
 				}

 				//Coloca efecto de stat increase:
 				var ultimoBuff = this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff[this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1];
 				if(ultimoBuff.stat_inc!=0){
 					var vectorInstrucciones = ultimoBuff.stat_inc.split("+");
 					var primerTipoStat;
 					var segundoTipoStat;
 					var operador;
 					var valorStat;

 					for(var i=0; i <vectorInstrucciones.length;i++){
 						console.log("Analizando la primera Instrucción: ");
 						console.log(vectorInstrucciones[i]);

 						primerTipoStat= vectorInstrucciones[i].slice(0,2);
 						operador=null;
 						segundoTipoStat=null;
 						valorStat= vectorInstrucciones[i].slice(2);

 						if(vectorInstrucciones[i].slice(-1)=="%"){
 							operador="%";
 							valorStat= vectorInstrucciones[i].slice(2,-1);
 						}

 						if(vectorInstrucciones[i].slice(-1)=="/"){
 							operador="/";
 							segundoTipoStat= vectorInstrucciones[i].slice(-3,-1);
 							valorStat= vectorInstrucciones[i].slice(2,-3);
 						}

 						var estadisticasHeroe= {
	 						vidaTotal: (this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib),
	 						manaTotal: 100,
	 						vida: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].vida,
	 						puntosVida: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].vida * (this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100,
	 						mana: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recurso,
	 						puntosMana: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recurso,
	 						vidaFaltante: (this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)-( this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].vida * (this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100),
	 						manaFaltante: 100 - this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recurso,
	 						vitalidad: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["vitalidad"],
	 						fuerza: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["fuerza"],
	 						intelecto: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["intelecto"],
	 						agilidad: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["agilidad"],
	 						precision: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["precision"],
	 						ferocidad: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["ferocidad"],
	 						armadura: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["armadura"],
	 						general: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["general"],
	 						poder: this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recursoEspecial,
	 						agro: 0,
	 					}
	 					
	 					for(var j=0; j <2;j++){
	 						if(j==0){parametroSeleccionado= primerTipoStat}else{parametroSeleccionado= segundoTipoStat};
	 						switch(parametroSeleccionado){
		 						case "VT":
		 							if(j==0){primerTipoStat= "vitalidad"}else{segundoTipoStat= "vitalidad"};
		 						break;
		 						case "FU":
		 							if(j==0){primerTipoStat= "fuerza"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "IN":
		 							if(j==0){primerTipoStat= "intelecto"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "GI":
		 							if(j==0){primerTipoStat= "agilidad"}else{segundoTipoStat= "agilidad"};
		 						break;
		 						case "PR":
		 							if(j==0){primerTipoStat= "precision"}else{segundoTipoStat= "precision"};
		 						break;
		 						case "FE":
		 							if(j==0){primerTipoStat= "ferocidad"}else{segundoTipoStat= "ferocidad"};
		 						break;
		 						case "AR":
		 							if(j==0){primerTipoStat= "armadura"}else{segundoTipoStat= "armadura"};
		 						break;
		 						case "VI":
		 							if(j==0){primerTipoStat= "puntosVida"}else{segundoTipoStat= "puntosVida"};
		 						break;
		 						case "MN":
		 							if(j==0){primerTipoStat= "recurso"}else{segundoTipoStat= "recurso"};
		 						break;
		 						case "AG":
		 							if(j==0){primerTipoStat= "agro"}else{segundoTipoStat= "agro"};
		 						break;
		 						case "PO":
		 							if(j==0){primerTipoStat= "poder"}else{segundoTipoStat= "poder"};
		 						break;
		 						case "GE":
		 							if(j==0){primerTipoStat= "general"}else{segundoTipoStat= "general"};
		 						break;
		 						case "VF":
		 							if(j==0){primerTipoStat= "vidaFaltante"}else{segundoTipoStat= "vidaFaltante"};
		 						break;
		 						case "MF":
		 							if(j==0){primerTipoStat= "manaFaltante"}else{segundoTipoStat= "manaFaltante"};
		 						break;
		 						case "TH":
		 							if(j==0){primerTipoStat= "vidaTotal"}else{segundoTipoStat= "vidaTotal"};
		 						break;
		 						case "TM":
		 							if(j==0){primerTipoStat= "manaTotal"}else{segundoTipoStat= "manaTotal"};
		 						break;
		 					}
	 					}

	 					//Modificar valores:

	 					//Operador Nulo
	 					if(operador==null){
	 						estadisticasHeroe[primerTipoStat] += parseFloat(valorStat);
	 					}
	
	 					//Operador %
	 					if(operador=="%"){
	 						estadisticasHeroe[primerTipoStat] += estadisticasHeroe[primerTipoStat]*parseFloat(valorStat);
	 					}
	
	 					//Operador /
	 					if(operador=="/"){
	 						estadisticasHeroe[primerTipoStat] += estadisticasHeroe[segundoTipoStat]*parseFloat(valorStat);
	 					}

	 					//Devolver los valores modificados:
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["vitalidad"] = estadisticasHeroe.vitalidad;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["fuerza"] = estadisticasHeroe.fuerza;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["intelecto"] = estadisticasHeroe.intelecto;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["agilidad"] = estadisticasHeroe.agilidad;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["precision"] = estadisticasHeroe.precision;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["ferocidad"] = estadisticasHeroe.ferocidad;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["armadura"] = estadisticasHeroe.armadura;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].estadisticas["general"] = estadisticasHeroe.general;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recurso = estadisticasHeroe.mana;
	 					this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].recursoEspecial = estadisticasHeroe.poder;
	 					if(primerTipoStat=="puntosVida"){
	 						this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].vida = estadisticasHeroe.puntosVida/estadisticasHeroe.vidaTotal*100;
	 					}
	 					
	 				}
 				}
 		
 				//Aplica modificador de ENTRADA del buffo sobre el HEROE:
 				this.modificacionBuffEntradaHeroe(objetivoHeroes[objetivoHeroes.length-1],this.renderMazmorra.heroes[objetivoHeroes[objetivoHeroes.length-1]].buff.length-1);
 			}

 			//Ejecutar funciones de hechizo:
 			this.ejecutarFuncionHechizo(hechizo.funcion,hechizo,objetivoEnemigos,objetivoHeroes);

 			//Aplicar hechizo final al objetivo:
 			this.aplicarHechizosFinalHeroe(objetivoHeroes[objetivoHeroes.length-1],hechizo);

 			//Eliminar objetivo del array:
 			objetivoHeroes.splice(objetivoHeroes.length-1, 1);
 		}
 		console.log("HECHIZOO");
 		console.log(hechizo);

 		//Verifica si quedan objetivos por efectuar y relanza el hechizo:
 		if(objetivoEnemigos.length>0){
 			setTimeout(()=>{    
      			this.aplicarHechizos(hechizoOriginal, objetivoEnemigos, objetivoHeroes);
 			}, this.velocidadHechizo);
 		}else if(objetivoHeroes.length>0){
 			setTimeout(()=>{    
      			this.aplicarHechizos(hechizoOriginal, objetivoEnemigos, objetivoHeroes);
 			}, this.velocidadHechizo);
 		}else{
 			setTimeout(()=>{
 				if(hechizo.hechizo_encadenado_id != 0 && !this.renderMazmorra.estadoControl.detenerHechizo){ //Si hay hechizo encadenado
 					this.appService.setControl("desbloqueoHechizo");
 					this.renderMazmorra.estadoControl.estado = "hechizoEncadenado";
 					this.renderMazmorra.estadoControl.hechizo = hechizo.hechizo_encadenado_id;
 					this.renderMazmorra.render.barraAccion.mostrar = false;
 					this.cuentaLanzamientoHechizo++;
 					this.loggerService.log("--> Iniciando Hechizo encadenado (ID: "+hechizo.hechizo_encadenado_id+")","yellow");
 					this.seleccionObjetivo(hechizo.hechizo_encadenado_id);
 				}else{
 				//Desbloquea y termina la aplicación de Hechizos:
 				this.appService.setControl("desbloqueoHechizo");
 				this.renderMazmorra.estadoControl.estado = "seleccionAccion";
 				this.renderMazmorra.estadoControl.hechizo = 0;
 				this.renderMazmorra.estadoControl.rngEncadenado= false;
 				this.renderMazmorra.render.barraAccion.mostrar = false;
 				this.cuentaLanzamientoHechizo=1;
 				this.renderMazmorra.estadoControl.detenerHechizo=false;
 				this.renderMazmorra.render.objetivoPredefinido.enemigos= [];
 				this.renderMazmorra.render.objetivoPredefinido.heroes= [];
 				}
 			
 			}, this.velocidadHechizo);
 			return;
 		}
 	}

 	//Aplica modificaciones de SALIDA a los efectos de HECHIZOS casteados por HEROES:
 	modificacionHechizoSalidaHeroe(caster,hechizo):any{

 		//Si es tipo FISICO:
 		if(hechizo.tipo=="F"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza) * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza) * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza) * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 		}

 		//Si es tipo MAGICO:
		if(hechizo.tipo=="M"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto) * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto)  * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto)  * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 		}

 		//Si es tipo DISTANCIA:
 		if(hechizo.tipo=="D"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad)  * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad)  * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad)  * this.evaluarRNG(this.renderMazmorra.estadoControl.rng);
 		}

 		//Logger:
 		this.loggerService.log("------ SALIDA ------- ","teal");
 		if(hechizo.dano_dir>0){
 			this.loggerService.log("-----> Daño: "+ hechizo.dano_dir,"orangered");
 		}
 		if(hechizo.heal_dir>0){
 			this.loggerService.log("-----> Heal: "+hechizo.heal_dir,"lawngreen");
 		}
 		if(hechizo.escudo_dir>0){
 			this.loggerService.log("-----> Escudo: "+hechizo.escudo_dir);
 		}
 		return hechizo;
 	}

 	//Aplica modificaciones de SALIDA a los efectos de HECHIZOS casteados por ENEMIGOS:
 	modificacionHechizoSalidaEnemigo(caster,hechizo):any{
 		console.log(hechizo);
 		//Si es tipo FISICO:
 		if(hechizo.tipo=="F"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*caster.estadisticas.fuerza);
 		}

 		//Si es tipo MAGICO:
		if(hechizo.tipo=="M"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*caster.estadisticas.intelecto);
 		}

 		//Si es tipo DISTANCIA:
 		if(hechizo.tipo=="D"){
 			hechizo.dano_dir = hechizo.dano_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad);
 			hechizo.heal_dir = hechizo.heal_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad);
 			hechizo.escudo_dir = hechizo.escudo_dir*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*caster.estadisticas.agilidad);
 		}

 		//Logger:
 		this.loggerService.log("------ SALIDA ------- ","teal");
 		if(hechizo.dano_dir>0){
 			this.loggerService.log("-----> Daño: "+ hechizo.dano_dir,"orangered");
 		}
 		if(hechizo.heal_dir>0){
 			this.loggerService.log("-----> Heal: "+hechizo.heal_dir,"lawngreen");
 		}
 		if(hechizo.escudo_dir>0){
 			this.loggerService.log("-----> Escudo: "+hechizo.escudo_dir);
 		}

 		return hechizo;
 	}

 	//Aplica modificaciones de ENTRADA a los efectos de HECHIZOS sobre HEROES:
 	modificacionHechizoEntradaHeroe(indiceHeroe,hechizo):any{

 		//Aplicacion de armadura:
 		hechizo.dano_dir= hechizo.dano_dir * (1-this.renderMazmorra.heroes[indiceHeroe].estadisticas.armadura/100);
 		return hechizo;
 	}

 	//Aplica modificaciones de ENTRADA a los efectos de HECHIZOS sobre ENEMIGOS:
 	modificacionHechizoEntradaEnemigo(indiceEnemigo,hechizo):any{

 		//Aplicacion de armadura:
 		hechizo.dano_dir= hechizo.dano_dir * (1-this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.armadura/100);

 		return hechizo;
 	}

 	//Aplicar hechizo resultante sobre el HEROE:
 	aplicarHechizosFinalHeroe(indiceHeroe,hechizo):any{
 		
 		//Verificación del caster:
 		var esHeroe = false;
 		var indiceHeroeCaster = -1;
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				esHeroe= true;
 				indiceHeroeCaster= i;
  				break;
 			}
 		}

 		//Calculo Vida Total del objetivo:
 		var vidaTotalObjetivo = this.parametros.atributos[0].vitalidad_atrib*this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad;

 		//Añadir Escudos:
 		this.renderMazmorra.heroes[indiceHeroe].escudo += (hechizo.escudo_dir/vidaTotalObjetivo*100);

 		//Añadir Vida:
 		this.renderMazmorra.heroes[indiceHeroe].vida += (hechizo.heal_dir/vidaTotalObjetivo*100);

 		//Efectuar Daños:
 		this.renderMazmorra.heroes[indiceHeroe].vida -= (hechizo.dano_dir/vidaTotalObjetivo*100);

 		//Redondeo de vida:
 		this.renderMazmorra.heroes[indiceHeroe].vida = Math.round(this.renderMazmorra.heroes[indiceHeroe].vida * 100) / 100;

 		//Mantener rango de vida:
 		if(this.renderMazmorra.heroes[indiceHeroe].vida <=0){
 			this.renderMazmorra.heroes[indiceHeroe].vida= 0;
 		}
 		if(this.renderMazmorra.heroes[indiceHeroe].vida>100){
 			this.renderMazmorra.heroes[indiceHeroe].vida= 100;
 		}
		//Mantener rango de recurso:
 		if(this.renderMazmorra.heroes[indiceHeroe].recurso>100){
 			this.renderMazmorra.heroes[indiceHeroe].recurso= 100;
 		}

 		//Reset critico:
 		this.renderMazmorra.estadoControl.critico=false;

 		//Logger:
 		this.loggerService.log("------ ENTRADA------- ","teal");
 		if(hechizo.dano_dir>0){
 			this.loggerService.log("-----> Daño: "+ hechizo.dano_dir,"orangered");
 		}
 		if(hechizo.heal_dir>0){
 			this.loggerService.log("-----> Heal: "+hechizo.heal_dir,"lawngreen");
 			if(esHeroe){
 				this.renderMazmorra.estadisticas[indiceHeroeCaster].heal[this.renderMazmorra.estadisticas[indiceHeroeCaster].heal.length-1] += hechizo.heal_dir;
 			}
 		}
 		if(hechizo.escudo_dir>0){
 			this.loggerService.log("-----> Escudo: "+hechizo.escudo_dir);
 			if(esHeroe){
 				this.renderMazmorra.estadisticas[indiceHeroeCaster].escudo[this.renderMazmorra.estadisticas[indiceHeroeCaster].escudo.length-1] += hechizo.escudo_dir;
 			}
 		}	
 	}

 	//Aplicar hechizo resultante sobre el ENEMIGO:
 	aplicarHechizosFinalEnemigo(indiceEnemigo,hechizo,caster):any{
 		
 		//Verificación del caster:
 		var esHeroe = false;
 		var indiceHeroeCaster = -1;
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				esHeroe= true;
 				indiceHeroeCaster= i;
  				break;
 			}
 		}
 		
 		//Calculo Vida Total del objetivo:
 		var vidaTotalObjetivo = this.parametros.atributos[0].vitalidad_atrib*this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.vitalidad;

 		//Añadir Escudos:
 		this.renderMazmorra.enemigos[indiceEnemigo].escudo += (hechizo.escudo_dir/vidaTotalObjetivo*100);

 		//Añadir Vida:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida += (hechizo.heal_dir/vidaTotalObjetivo*100);

 		//Efectuar Daños:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida -= (hechizo.dano_dir/vidaTotalObjetivo*100);

 		//AplicarAgro:
 		this.renderMazmorra.enemigos[indiceEnemigo].agro[indiceHeroeCaster] += hechizo.dano_dir;

 		//Redondeo de vida:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida = Math.round(this.renderMazmorra.enemigos[indiceEnemigo].vida * 100) / 100;

 		//Mantener rango de vida:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].vida>100){
 			this.renderMazmorra.enemigos[indiceEnemigo].vida= 100;
 		}

 		//Reset critico:
 		this.renderMazmorra.estadoControl.critico=false;

 		//Comprueba si tiene dadiva:
 		if(caster.buff.find(i => i.id==17)){
 			this.renderMazmorra.heroes[caster.buff.find(i => i.id==17).origen.slice(1)].recursoEspecial += hechizo.dano_dir*0.7;
 			if(this.renderMazmorra.heroes[caster.buff.find(i => i.id==17).origen.slice(1)].recursoEspecial>=100){
 				this.renderMazmorra.heroes[caster.buff.find(i => i.id==17).origen.slice(1)].recursoEspecial=100;
 			}
 			console.log("Energia Generada: "+hechizo.dano_dir*0.7);
 		}

 		//LOGGER && ANALITICS
 		this.loggerService.log("------ ENTRADA------- ","teal");
 		if(hechizo.dano_dir>0){
 			this.loggerService.log("-----> Daño: "+ hechizo.dano_dir,"orangered");
 			if(esHeroe){
 				this.renderMazmorra.estadisticas[indiceHeroeCaster].dano[this.renderMazmorra.estadisticas[indiceHeroeCaster].dano.length-1] += hechizo.dano_dir;
 			}
 		}
 		if(hechizo.heal_dir>0){
 			this.loggerService.log("-----> Heal: "+hechizo.heal_dir,"lawngreen");
 		}
 		if(hechizo.escudo_dir>0){
 			this.loggerService.log("-----> Escudo: "+hechizo.escudo_dir);
 		}

 		//Elimina al enemigo si esta muerto:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].vida <=0){
 			this.renderMazmorra.enemigos[indiceEnemigo].vida= 0;
 			this.enemigoMuerto(indiceEnemigo);
 			console.log("Enemigo Muerto: "+indiceEnemigo);
 			//Logger:
 			this.loggerService.log("Enemigo Muerto:"+ indiceEnemigo);
 		}
 	}

 	//Ejecutar funciones de hechizo:
 	ejecutarFuncionHechizo(funcion: string, hechizo: any, objetivoEnemigos: any, objetivoHeroes:any): void{

 		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
 		var caster;
 		var esHeroe = false;
 		var esEnemigo = false;
 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			if(this.renderMazmorra.heroes[i].turno){
 				esHeroe= true;
 				caster= this.renderMazmorra.heroes[i];
  				break;
 			}
 		}

 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			if(this.renderMazmorra.enemigos[i].turno){
 				esEnemigo= true;
 				caster= this.renderMazmorra.enemigos[i];
 				break;
 			}
 		}

 		//Ejecuto acciones en función de la función:
 		switch(funcion){

 			case "GenerarEsencia":
 				caster.recursoEspecial++;
 			break

 			case "CargaArcana":

 				if((this.cuentaAplicacionHechizo == 1) && (caster.recursoEspecial+objetivoEnemigos.length-1>=3)){
 						this.renderMazmorra.render.objetivoPredefinido.enemigos = objetivoEnemigos.slice();
 						this.renderMazmorra.render.objetivoPredefinido.heroes = objetivoHeroes.slice();
 						console.log("CARGA ARCANA");
 						hechizo.hechizo_encadenado_id= this.hechizos.hechicero.find(i=> i.nombre =="Sobrecarga arcana").id;
 				}

 				if(objetivoEnemigos.length>1){
 					caster.recursoEspecial++;
 				}

 				if(caster.recursoEspecial>=3 && (this.cuentaAplicacionHechizo == this.renderMazmorra.render.objetivoPredefinido.enemigos.length)){
 					hechizo.hechizo_encadenado_id= this.hechizos.hechicero.find(i=> i.nombre =="Sobrecarga arcana").id;
 				}
 			break

 			case "CargaFuego":
 				if(this.renderMazmorra.estadoControl.critico){
 					caster.recursoEspecial++;
 				}
 				if(caster.recursoEspecial>=3){
 					hechizo.hechizo_encadenado_id=12;
 				}
 			break;

 			case "CargaFrio":
 				if(this.renderMazmorra.enemigos[objetivoEnemigos[0]].buff.find(i=> i.id==3)){
 					this.renderMazmorra.render.objetivoPredefinido.enemigos = objetivoEnemigos.slice();
 					this.renderMazmorra.render.objetivoPredefinido.heroes = objetivoHeroes.slice();
 					caster.recursoEspecial++;
 				}

 				if(caster.recursoEspecial>=3){
 					this.renderMazmorra.estadoControl.rngEncadenado=true;
 					hechizo.hechizo_encadenado_id=13;
 				}	
 			break;

 			case "Proyectil":
 				if(this.renderMazmorra.estadoControl.rng >= 4){
 					this.renderMazmorra.estadoControl.rngEncadenado=false;
 					this.renderMazmorra.render.objetivoPredefinido.enemigos= Object.assign([],objetivoEnemigos);
 					hechizo.hechizo_encadenado_id=15;
 				}else{
 					hechizo.hechizo_encadenado_id=0;
 				}

 				if(this.cuentaLanzamientoHechizo >= 2){
 					caster.recursoEspecial++;
 				}

 				if(caster.recursoEspecial>=3){
 					this.renderMazmorra.estadoControl.rngEncadenado=true;
 					this.renderMazmorra.render.objetivoPredefinido.enemigos= Object.assign([],objetivoEnemigos);
 					hechizo.hechizo_encadenado_id=14;
 				}

 				if(hechizo.id==14){
 					console.log("Lanzando Misil Resonante");
 					caster.recursoEspecial=0;
 				}
 			break;

 			case "Carga_Critico":
 				if(this.renderMazmorra.estadoControl.critico){
 					caster.recursoEspecial++;
 				}
 			break;

 			case "ResetPoder":
 				caster.recursoEspecial = 0;
 			break
 		}
 	}

	/* 	----------------------------------------------
			GESTION DE BUFFOS
 	----------------------------------------------*/

 	//Inicia la secuencia de aplicación de buffos: (previo) --> aplicarBuffos();
 	lanzarBuffos():void{
 		
 		//Bloquea los inputs:
 		this.appService.setControl("bloqueoBuff");
 		this.renderMazmorra.render.barraAccion.mensajeAccion = "Procesando...";
 		this.renderMazmorra.render.barraAccion.mostrar = true;

 		//Mensaje de palicación de buffos:

 		//Genera el array de buffos a aplicar
 		var aplicarBuffos={
 			enemigos: [],
 			heroes: []
 		} 

 		//Itera entre los enemigos:
 		for(var i=0; i <this.renderMazmorra.enemigos.length; i++){
 			aplicarBuffos.enemigos[i]= [];
 			for(var j=0; j <this.renderMazmorra.enemigos[i].buff.length; j++){
 				aplicarBuffos.enemigos[i][j] = this.renderMazmorra.enemigos[i].buff[j].id;
 			}
 		}

 		for(var i=0; i <this.renderMazmorra.heroes.length; i++){
 			aplicarBuffos.heroes[i]= [];
 			for(var j=0; j <this.renderMazmorra.heroes[i].buff.length; j++){
 				aplicarBuffos.heroes[i][j] = this.renderMazmorra.heroes[i].buff[j].id;
 			}
 		}
 		
 		this.aplicarBuffos(aplicarBuffos);
 	}

 	//Aplica de forma iterativa los Buffos:
 	aplicarBuffos(aplicarBuffos: any):void{

 		//Condicion de desbloqueo (No encontrar buffos por aplicar):
 		var desbloqueo=true;

 		//Aplicar buffos en los enemigos:
 		for(var i=0; i <aplicarBuffos.enemigos.length; i++){
 			//Enemigo con buffos pendientes:
 			if(aplicarBuffos.enemigos[i].length>0){

 				//Verificar el indice del Buff:
 				var indiceBuff = aplicarBuffos.enemigos[i].length-1;
 				
 				//Iniciar Animacion Buffo:
 				this.renderMazmorra.enemigos[i].animacion = this.buff.buff.find(j => j.id==aplicarBuffos.enemigos[i][aplicarBuffos.enemigos[i].length-1]).animacion_id;

 				//Ejecuta FUNCION al Buffo:
 				this.ejecutarFuncionBuffEnemigo(this.buff.buff.find(j => j.id==aplicarBuffos.enemigos[i][aplicarBuffos.enemigos[i].length-1]).funcion,i,this.renderMazmorra.enemigos[i].buff[indiceBuff]);

 				//Aplica efectos finales BUFF al ENEMIGO:
 				this.aplicaBuffFinalEnemigo(i,indiceBuff);

 				//Reducir duracion y eliminar si la duración es 0:
 				if(this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion.toString().slice(-1)=="T" && this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1]==-(i+1)){
 					//Reducir la duración por T:
 					if(this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion.toString().slice(0,-1)=="0"){
 						this.eliminarBuffEnemigo(i,indiceBuff);
 					}else{
 						this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion = (parseInt(this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion.toString().slice(0,-1))-1)+"T";
 					}

 				}else{
 					//Reduce la duración por PT:
 					if(this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion>0){
 						this.renderMazmorra.enemigos[i].buff[indiceBuff].duracion--;
 					}else{
 						this.eliminarBuffEnemigo(i,indiceBuff);
 					}
 				}

 				//Si el enemigo muere elimina la cola de Buff:
 				if(this.renderMazmorra.enemigos[i].vida <=0){
 					this.renderMazmorra.render.enemigoMuerto.push(i);
 					aplicarBuffos.enemigos[i] = [];
 				}else{

 					//Elimina el ultimo Buff aplicado de la cola de aplicación:
 					aplicarBuffos.enemigos[i].splice(aplicarBuffos.enemigos[i].length-1, 1);
 				}
 			}
 		}

 		//Aplicar buffos en los heroes:
 		for(var i=0; i <aplicarBuffos.heroes.length; i++){
 			//Heroe con buffos pendientes:
 			if(aplicarBuffos.heroes[i].length>0){

 				//Verificar el indice del Buff:
 				var indiceBuff = aplicarBuffos.heroes[i].length-1;

 				//Iniciar Animacion Buffo:
 				this.renderMazmorra.heroes[i].animacion = this.buff.buff.find(j => j.id==aplicarBuffos.heroes[i][aplicarBuffos.heroes[i].length-1]).animacion_id;

 				//Ejecutar funciones de hechizo:
 				this.ejecutarFuncionBuffHeroe(this.buff.buff.find(j => j.id==aplicarBuffos.heroes[i][aplicarBuffos.heroes[i].length-1]).funcion,i,this.renderMazmorra.heroes[i].buff[indiceBuff]);

 				//Aplica efectos finales BUFF al ENEMIGO:
 				this.aplicaBuffFinalHeroe(i,indiceBuff);

 				//Reducir duracion y eliminar si la duración es 0:
 				if(this.renderMazmorra.heroes[i].buff[indiceBuff].duracion.toString().slice(-1)=="T" && this.renderMazmorra.registroTurno[this.renderMazmorra.registroTurno.length-1]==i){
 					//Reducir la duración por T:
 					if(this.renderMazmorra.heroes[i].buff[indiceBuff].duracion.toString().slice(0,-1)=="0"){
 						this.eliminarBuffHeroe(i,indiceBuff);
 					}else{
 						this.renderMazmorra.heroes[i].buff[indiceBuff].duracion = (parseInt(this.renderMazmorra.heroes[i].buff[indiceBuff].duracion.toString().slice(0,-1))-1)+"T";
 					}

 				}else{
 					//Reduce la duración por PT:
 					if(this.renderMazmorra.heroes[i].buff[indiceBuff].duracion>0){
 						this.renderMazmorra.heroes[i].buff[indiceBuff].duracion--;
 					}else{
 						this.eliminarBuffHeroe(i,indiceBuff);
 					}
 				}

 				//Si el heroe muere elimina la cola de Buff:
 				if(this.renderMazmorra.heroes[i].vida <=0){
 					this.renderMazmorra.render.heroeMuerto.push(i);
 					aplicarBuffos.heroes[i] = [];
 				}else{
 					//Elimina el ultimo Buff aplicado:
 					aplicarBuffos.heroes[i].splice(aplicarBuffos.heroes[i].length-1, 1);
 				}
 			}
 		}

 		//Verifica si quedan objetivos Enemigos por aplicar buffos:
 		for(var i=0; i <aplicarBuffos.enemigos.length; i++){
 			if(aplicarBuffos.enemigos[i].length>0){
 				//Enemigo con buffos pendientes:
 				var desbloqueo= false;
 			}
 		}

 		//Verifica si quedan objetivos Aliados por aplicar buffos:
 		for(var i=0; i <aplicarBuffos.heroes.length; i++){
 			if(aplicarBuffos.heroes[i].length>0){
 				//Heroe con buffos pendientes:
 				var desbloqueo= false;
 			}
 		}

 		if(!desbloqueo){
 			setTimeout(()=>{    
      			this.aplicarBuffos(aplicarBuffos);
 			}, this.velocidadBuff);
 		}else{
 			//Elimina a los enemigos que hayan muerto por buff:
 			this.enemigoMuerto(-1);

 			//Desbloquea y termina la aplicación de buffos:
 			this.appService.setControl("desbloqueoBuff");
 			this.renderMazmorra.render.barraAccion.mostrar = false;
 			//this.pasarTurno();
 		}
 	}

 	//Aplica modificador de SALIDA de HEROE a HEROE:
 	modificacionBuffSalidaHeroeHeroe(casterHeroe,indiceHeroeObjetivo,indiceBuff):void{
 		//Si es tipo FISICO:
 		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="F"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 		}

 		//Si es tipo MAGICO:
		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="M"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 		}

 		//Si es tipo DISTANCIA:
 		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="D"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad); //* this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad);// * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t);
 		}
 	}

 	//Aplica modificador de SALIDA de HEROE a ENEMIGO:
 	modificacionBuffSalidaHeroeEnemigo(casterHeroe,indiceEnemigoObjetivo,indiceBuff):void{
 		
 		//Si es tipo FISICO:
 		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="F"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza);  //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterHeroe.estadisticas.fuerza); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo MAGICO:
		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="M"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterHeroe.estadisticas.intelecto); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo DISTANCIA:
 		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="D"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*this.parametros.escalado[0].escalar_vida*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*this.parametros.escalado[0].escalar_vida*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*this.parametros.escalado[0].escalar_vida*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterHeroe.estadisticas.agilidad); //* this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}
 		console.log("Daño recibido Buff: "+this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t);
 		return;
 	}

 	//Aplica modificador de SALIDA de ENEMIGO a HEROE:
 	modificacionBuffSalidaEnemigoHeroe(casterEnemigo,indiceHeroeObjetivo,indiceBuff):void{
 		//Si es tipo FISICO:
 		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="F"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo MAGICO:
		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="M"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo DISTANCIA:
 		if(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].tipo=="D"){
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad); // * this.evaluarRNG(this.renderMazmorra.heroes[indiceHeroeObjetivo].buff[indiceBuff].rng);
 		}
 	}

 	//Aplica modificador de SALIDA de ENEMIGO a ENEMIGO:
 	modificacionBuffSalidaEnemigoEnemigo(casterEnemigo,indiceEnemigoObjetivo,indiceBuff):void{
 		//Si es tipo FISICO:
 		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="F"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[2].fuerza_atrib*casterEnemigo.estadisticas.fuerza);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo MAGICO:
		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="M"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[3].intelecto_atrib*casterEnemigo.estadisticas.intelecto);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}

 		//Si es tipo DISTANCIA:
 		if(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].tipo=="D"){
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].dano_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].heal_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 			this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t = this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].escudo_t*(1+this.parametros.escalado[0].esc_hech*this.renderMazmorra.nivel_equipo) * (1+this.parametros.atributos[4].agilidad_atrib*casterEnemigo.estadisticas.agilidad);// * this.evaluarRNG(this.renderMazmorra.enemigos[indiceEnemigoObjetivo].buff[indiceBuff].rng);
 		}
 	}

 	//Aplica modificador de ENTRADA a los HEROES por accion de BUFF:
 	modificacionBuffEntradaHeroe(indiceHeroe,indiceBuff):void{
 		//Aplicacion de armadura:
 		this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].dano_t= this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].dano_t * (1-this.renderMazmorra.heroes[indiceHeroe].estadisticas.armadura/100);
 	}

 	//Aplica modificador de ENTRADA a los ENEMIGOS por accion de BUFF:
 	modificacionBuffEntradaEnemigo(indiceEnemigo,indiceBuff):void{
 		//Aplicacion de armadura:
 		this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t= this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t * (1-this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.armadura/100);
 	}

 	//Aplica efectos FINALES BUFF al HEROE:
 	aplicaBuffFinalHeroe(indiceHeroe,indiceBuff):void{

 		//Calculo Vida Total del objetivo:
 		var vidaTotalObjetivo = this.parametros.atributos[0].vitalidad_atrib*this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad;

 		//Añadir Escudos:
 		this.renderMazmorra.heroes[indiceHeroe].escudo += (this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].escudo_t/vidaTotalObjetivo*100);

 		//Añadir Vida:
 		this.renderMazmorra.heroes[indiceHeroe].vida += (this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].heal_t/vidaTotalObjetivo*100);

 		//Efectuar Daños:
 		this.renderMazmorra.heroes[indiceHeroe].vida -= (this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].dano_t/vidaTotalObjetivo*100);

 		//Redondeo de vida:
 		this.renderMazmorra.heroes[indiceHeroe].vida = Math.round(this.renderMazmorra.heroes[indiceHeroe].vida * 100) / 100;

 		//Mantener rango de vida:
 		if(this.renderMazmorra.heroes[indiceHeroe].vida <=0){
 			this.renderMazmorra.heroes[indiceHeroe].vida= 0;
 		}
 		if(this.renderMazmorra.heroes[indiceHeroe].vida>100){
 			this.renderMazmorra.heroes[indiceHeroe].vida= 100;
 		}
		//Mantener rango de recurso:
 		if(this.renderMazmorra.heroes[indiceHeroe].recurso>100){
 			this.renderMazmorra.heroes[indiceHeroe].recurso= 100;
 		}

 		//LOGGER && ANALITICS:
 		this.loggerService.log("------ BUFF/DEBUFF (ID: "+this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].id+", Objetivo: "+this.renderMazmorra.heroes[indiceHeroe].nombre+") ------- ","violet");
 		if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].dano_t>0){
 			this.loggerService.log("-----> Daño: "+ this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].dano_t,"orangered");
 		}
 		if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].heal_t>0){
 			this.loggerService.log("-----> Heal: "+this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].heal_t,"lawngreen");
 			if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){
 				this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].heal[this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].heal.length-1] += this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].heal_t;
 			}
 		}
 		if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].escudo_t>0){
 			this.loggerService.log("-----> Escudo: "+this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].escudo_t);
 			if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){
 				this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].escudo[this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].escudo.length-1] += this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].escudo_t;
 			}
 		}
 	}

 	//Aplica efectos FINALES BUFF al ENEMIGO:
 	aplicaBuffFinalEnemigo(indiceEnemigo,indiceBuff):void{

 		//Calculo Vida Total del objetivo:
 		var vidaTotalObjetivo = this.parametros.atributos[0].vitalidad_atrib*this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.vitalidad;

 		//Añadir Escudos:
 		this.renderMazmorra.enemigos[indiceEnemigo].escudo += (this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t/vidaTotalObjetivo*100);

 		//Añadir Vida:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida += (this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].heal_t/vidaTotalObjetivo*100);

 		//Efectuar Daños:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida -= (this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t/vidaTotalObjetivo*100);

 		//AplicarAgro:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(0,1)=="H"){
 			this.renderMazmorra.enemigos[indiceEnemigo].agro[parseInt(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))] += this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t;
 		}

 		//Redondeo de vida:
 		this.renderMazmorra.enemigos[indiceEnemigo].vida = Math.round(this.renderMazmorra.enemigos[indiceEnemigo].vida * 100) / 100;

 		//Mantener rango de vida:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].vida>100){
 			this.renderMazmorra.enemigos[indiceEnemigo].vida= 100;
 		}

 		//Comprueba si el origen del buff tiene dadiva y aplica efectos:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(0,1)=="H"){
 			if(this.renderMazmorra.heroes[this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1)].buff.find(i => i.id==17)){
 				this.renderMazmorra.heroes[this.renderMazmorra.heroes[this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1)].buff.find(i => i.id==17).origen.slice(1)].recursoEspecial += this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t*0.7;
 				if(this.renderMazmorra.heroes[this.renderMazmorra.heroes[this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1)].buff.find(i => i.id==17).origen.slice(1)].recursoEspecial>=100){
 					this.renderMazmorra.heroes[this.renderMazmorra.heroes[this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1)].buff.find(i => i.id==17).origen.slice(1)].recursoEspecial=100;
 				}
 				console.log("Energia Generada: "+this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t*0.7);
 			}
 		}

 		//Logger:
 		this.loggerService.log("------ BUFF/DEBUFF (ID: "+this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].id+", Objetivo: "+this.renderMazmorra.enemigos[indiceEnemigo].nombre+") ------- ","violet");
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t>0){
 			this.loggerService.log("-----> Daño: "+ this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t,"orangered");
 			if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(0,1)=="H"){
 				this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].dano[this.renderMazmorra.estadisticas[parseInt(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].dano.length-1]+= this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].dano_t;
 			}
 		}
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].heal_t>0){
 			this.loggerService.log("-----> Heal: "+this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].heal_t,"lawngreen");
 		}
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t>0){
 			this.loggerService.log("-----> Escudo: "+this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t);
 		}

 		//Evaluar enemigo muerto:
 		if(this.renderMazmorra.enemigos[indiceEnemigo].vida <0){
 			this.renderMazmorra.enemigos[indiceEnemigo].vida= 0;
 			console.log("Enemigo Muerto: "+indiceEnemigo);
 			this.loggerService.log("Enemigo muerto: "+this.renderMazmorra.enemigos[indiceEnemigo].nombre,"red");
 		}
 	}

 	//Ejecutar FUNCION de BUFF sobre HEROE: 
 	ejecutarFuncionBuffHeroe(funcion,indiceHeroe,Buff): void{

 		//Ejecuto acciones en función de la función:
 		switch(funcion){
 			case "":
 			break
 		}
 	}

 	//Ejecutar FUNCION de BUFF sobre ENEMIGO:
 	ejecutarFuncionBuffEnemigo(funcion,indiceEnemigo,Buff): void{

 		//Ejecuto acciones en función de la función:
 		switch(funcion){
 			case "GenerarEsencia":
 				var indice;
 				indice= parseInt(Buff.origen.slice(1));
 				this.renderMazmorra.heroes[indice].recursoEspecial++;
 			break
 		}
 	}

 	eliminarBuffEnemigo(indiceEnemigo,indiceBuff):void{
 		if(this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff].duracion == 0){

 			//Coloca efecto de stat increase:
 			var ultimoBuff = this.renderMazmorra.enemigos[indiceEnemigo].buff[indiceBuff];
 	
 			if(ultimoBuff.stat_inc!=0){
 				var tipoStat= ultimoBuff.stat_inc.slice(0,2);
 				var valorStat= parseInt(ultimoBuff.stat_inc.slice(2));
 				switch(tipoStat){
 					case "GE":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.general -= valorStat;
 					break;
 					case "AR":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.armadura -= valorStat;
 					break;
 					case "VT":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.vitalidad -= valorStat;
 					break;
 					case "FU":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.fuerza -= valorStat;
 					break;
 					case "IN":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.intelecto -= valorStat;
 					break;
 					case "PR":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.precision -= valorStat;
 					break;
 					case "FE":
 						this.renderMazmorra.enemigos[indiceEnemigo].estadisticas.ferocidad -= valorStat;
 					break;
 				}
 			}
 			this.renderMazmorra.enemigos[indiceEnemigo].buff.splice(indiceBuff,1);
 		}
 		return;
 	}

 	eliminarBuffHeroe(indiceHeroe,indiceBuff):void{
 		if(this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff].duracion == 0){

 			//Coloca efecto de stat increase:
 			var ultimoBuff = this.renderMazmorra.heroes[indiceHeroe].buff[indiceBuff];
 	
 			if(ultimoBuff.stat_inc!=0){
 					var vectorInstrucciones = ultimoBuff.stat_inc.split("+");
 					var primerTipoStat;
 					var segundoTipoStat;
 					var operador;
 					var valorStat;

 					for(var i=0; i <vectorInstrucciones.length;i++){
 						console.log("Analizando la primera Instrucción: ");
 						console.log(vectorInstrucciones[i]);

 						primerTipoStat= vectorInstrucciones[i].slice(0,2);
 						operador=null;
 						segundoTipoStat=null;
 						valorStat= vectorInstrucciones[i].slice(2);

 						if(vectorInstrucciones[i].slice(-1)=="%"){
 							operador="%";
 							valorStat= vectorInstrucciones[i].slice(2,-1);
 						}

 						if(vectorInstrucciones[i].slice(-1)=="/"){
 							operador="/";
 							segundoTipoStat= vectorInstrucciones[i].slice(-3,-1);
 							valorStat= vectorInstrucciones[i].slice(2,-3);
 						}

 						var parametroSeleccionado;

 						var estadisticas= {
	 						vidaTotal: (this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib),
	 						manaTotal: 100,
	 						vida: this.renderMazmorra.heroes[indiceHeroe].vida,
	 						puntosVida: this.renderMazmorra.heroes[indiceHeroe].vida * (this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100,
	 						mana: this.renderMazmorra.heroes[indiceHeroe].recurso,
	 						puntosMana: this.renderMazmorra.heroes[indiceHeroe].recurso,
	 						vidaFaltante: (this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)-( this.renderMazmorra.heroes[indiceHeroe].vida * (this.renderMazmorra.heroes[indiceHeroe].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100),
	 						manaFaltante: 100 - this.renderMazmorra.heroes[indiceHeroe].recurso,
	 						vitalidad: this.renderMazmorra.heroes[indiceHeroe].estadisticas["vitalidad"],
	 						fuerza: this.renderMazmorra.heroes[indiceHeroe].estadisticas["fuerza"],
	 						intelecto: this.renderMazmorra.heroes[indiceHeroe].estadisticas["intelecto"],
	 						agilidad: this.renderMazmorra.heroes[indiceHeroe].estadisticas["agilidad"],
	 						precision: this.renderMazmorra.heroes[indiceHeroe].estadisticas["precision"],
	 						ferocidad: this.renderMazmorra.heroes[indiceHeroe].estadisticas["ferocidad"],
	 						armadura: this.renderMazmorra.heroes[indiceHeroe].estadisticas["armadura"],
	 						general: this.renderMazmorra.heroes[indiceHeroe].estadisticas["general"],
	 						poder: this.renderMazmorra.heroes[indiceHeroe].recursoEspecial,
	 						agro: 0,
	 					}
	 					
	 					for(var j=0; j <2;j++){
	 						if(j==0){parametroSeleccionado= primerTipoStat}else{parametroSeleccionado= segundoTipoStat};
	 						switch(parametroSeleccionado){
		 						case "VT":
		 							if(j==0){primerTipoStat= "vitalidad"}else{segundoTipoStat= "vitalidad"};
		 						break;
		 						case "FU":
		 							if(j==0){primerTipoStat= "fuerza"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "IN":
		 							if(j==0){primerTipoStat= "intelecto"}else{segundoTipoStat= "fuerza"};
		 						break;
		 						case "GI":
		 							if(j==0){primerTipoStat= "agilidad"}else{segundoTipoStat= "agilidad"};
		 						break;
		 						case "PR":
		 							if(j==0){primerTipoStat= "precision"}else{segundoTipoStat= "precision"};
		 						break;
		 						case "FE":
		 							if(j==0){primerTipoStat= "ferocidad"}else{segundoTipoStat= "ferocidad"};
		 						break;
		 						case "AR":
		 							if(j==0){primerTipoStat= "armadura"}else{segundoTipoStat= "armadura"};
		 						break;
		 						case "VI":
		 							if(j==0){primerTipoStat= "puntosVida"}else{segundoTipoStat= "puntosVida"};
		 						break;
		 						case "MN":
		 							if(j==0){primerTipoStat= "recurso"}else{segundoTipoStat= "recurso"};
		 						break;
		 						case "AG":
		 							if(j==0){primerTipoStat= "agro"}else{segundoTipoStat= "agro"};
		 						break;
		 						case "PO":
		 							if(j==0){primerTipoStat= "poder"}else{segundoTipoStat= "poder"};
		 						break;
		 						case "GE":
		 							if(j==0){primerTipoStat= "general"}else{segundoTipoStat= "general"};
		 						break;
		 						case "VF":
		 							if(j==0){primerTipoStat= "vidaFaltante"}else{segundoTipoStat= "vidaFaltante"};
		 						break;
		 						case "MF":
		 							if(j==0){primerTipoStat= "manaFaltante"}else{segundoTipoStat= "manaFaltante"};
		 						break;
		 						case "TH":
		 							if(j==0){primerTipoStat= "vidaTotal"}else{segundoTipoStat= "vidaTotal"};
		 						break;
		 						case "TM":
		 							if(j==0){primerTipoStat= "manaTotal"}else{segundoTipoStat= "manaTotal"};
		 						break;
		 					}
	 					}

	 					//Modificar valores:

	 					//Operador Nulo
	 					if(operador==null){
	 						estadisticas[primerTipoStat] -= parseFloat(valorStat);
	 					}
	
	 					//Operador %
	 					if(operador=="%"){
	 						estadisticas[primerTipoStat] -= estadisticas[primerTipoStat]*parseFloat(valorStat);
	 					}
	
	 					//Operador /
	 					if(operador=="/"){
	 						estadisticas[primerTipoStat] -= estadisticas[segundoTipoStat]*parseFloat(valorStat);
	 					}

	 					//Devolver los valores modificados:
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["vitalidad"] = estadisticas.vitalidad;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["fuerza"] = estadisticas.fuerza;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["intelecto"] = estadisticas.intelecto;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["agilidad"] = estadisticas.agilidad;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["precision"] = estadisticas.precision;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["ferocidad"] = estadisticas.ferocidad;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["armadura"] = estadisticas.armadura;
	 					this.renderMazmorra.heroes[indiceHeroe].estadisticas["general"] = estadisticas.general;
	 					this.renderMazmorra.heroes[indiceHeroe].recurso = estadisticas.mana;
	 					this.renderMazmorra.heroes[indiceHeroe].recursoEspecial = estadisticas.poder;
	 					if(primerTipoStat=="puntosVida"){
	 						this.renderMazmorra.heroes[indiceHeroe].vida = estadisticas.puntosVida/estadisticas.vidaTotal*100;
	 					}
	
	 				}
 				}


 			this.renderMazmorra.heroes[indiceHeroe].buff.splice(indiceBuff,1);
 		}
 		return;
 	}

	/* 	----------------------------------------------
			GESTION DE MUERTES
 	----------------------------------------------*/

 	//Elimina la instancia del enemigo con el indice seleccionado y todos los que estan en cola:
 	enemigoMuerto(indiceEnemigo):void{

 		//Agregar indice de enemigo a la cola de eliminacion:
 		if(indiceEnemigo!=-1){
 			this.renderMazmorra.render.enemigoMuerto.push(indiceEnemigo);
 		}

 		if(this.renderMazmorra.render.enemigoMuerto.length==0){return;}

 		console.log("Eliminando enemigos:");
 		console.log(this.renderMazmorra.render.enemigoMuerto);

 		//Ordenar el vector:
 		this.renderMazmorra.render.enemigoMuerto.sort(function(a,b){return a - b;});

 		//Eliminar instancia de enemigos muertos:
 		for (var i = this.renderMazmorra.render.enemigoMuerto.length -1; i >= 0; i--){

 			//Eliminar Objetivo Predefinido si el enemigo ha muerto:
 			for(var j=0; j <this.renderMazmorra.render.objetivoPredefinido.enemigos.length;j++){
 				if(this.renderMazmorra.render.objetivoPredefinido.enemigos[j]==this.renderMazmorra.render.enemigoMuerto[i]){
 					this.renderMazmorra.render.objetivoPredefinido.enemigos.splice(j,1);
 					
 					if(this.renderMazmorra.render.objetivoPredefinido.enemigos.length==0){
 						this.renderMazmorra.estadoControl.detenerHechizo= true;
 					}else{
 						//WARNING MEJORA: RESTARLE 1 AL RESTO DE OBJETIVOS PREDEFINIDOS POR ENCIMA DEL QUE SE QUITA.
 					}

 				}
 			}

 			//Verfica si el enemigo a eliminar tiene el turno:
 			if(this.renderMazmorra.enemigos[this.renderMazmorra.render.enemigoMuerto[i]].turno){

 				if(this.renderMazmorra.render.enemigoMuerto[i] != this.renderMazmorra.enemigos.length -1){
 					//Activa el turno del siguiente enemigo que siga vivo:
 					console.log(this.renderMazmorra.enemigos[this.renderMazmorra.render.enemigoMuerto[i]+1]);
 					if(this.renderMazmorra.enemigos[this.renderMazmorra.render.enemigoMuerto[i]+1]){
 						this.renderMazmorra.enemigos[this.renderMazmorra.render.enemigoMuerto[i]+1].turno = true;
 						this.renderMazmorra.registroTurno.push(-(this.renderMazmorra.render.enemigoMuerto[i]+2));
 						this.renderMazmorra.enemigos[this.renderMazmorra.render.enemigoMuerto[i]+1].acciones = 2;
 						this.turnoModificado=true;
 					}else{
 						//Activa el turno del primer heroe:
 						console.log("Paso primer heroe por muerte de todos los enemigos restantes...");
 						this.renderMazmorra.heroes[0].turno = true;
 						this.renderMazmorra.heroes[0].acciones = 2;
 						this.turnoModificado=true;
 					}
 				}else{ 	//El ultimo enemigo ha muerto:
 						//Activa el turno del primer heroe:
 						console.log("Paso primer heroe por muerte del ultimo...");
 						this.renderMazmorra.heroes[0].turno = true;
 						this.renderMazmorra.heroes[0].acciones = 2;
 						this.turnoModificado=true;
 				}
 			}
 			//Eliminar el enemigo:
 			this.renderMazmorra.enemigos.splice(this.renderMazmorra.render.enemigoMuerto[i],1);
 		}

 		//Resetea el vector de enemigos para eliminar:
 		this.renderMazmorra.render.enemigoMuerto = [];
 	}

	/* 	----------------------------------------------
			GESTION DE RNG
 	----------------------------------------------*/

 	activarRNG(){
 		if(this.renderMazmorra.estadoControl.rngEncadenado){
 			//this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: this.renderMazmorra, emisor: this.renderMazmorra.personaje});
 			console.log("RNG ENCADENADO");
 			this.lanzarHechizo();
 			return;}
 		this.renderMazmorra.estadoControl.estado="rng";
 		this.renderMazmorra.estadoControl.rng=0;
 		this.renderMazmorra.estadoControl.rngEncadenado=true;
 		this.rngService.activarRng();
 	}

 	desactivarRNG(){
 		this.rngService.desactivarRng();
 	}

 	//Función de administración RNG:
 	evaluarRNG(valorRng):any{
 		var multiplicador= 1;
 		multiplicador= 1+ valorRng / 6;
 		if(valorRng==6){
 			this.renderMazmorra.estadoControl.critico= true;
 		}
 		if(valorRng==1){multiplicador=0}
 		return multiplicador;
 	}

 	/* 	----------------------------------------------
			GESTION DE LOGGER
 	----------------------------------------------*/

 	loggerObs(comando):void{
 		console.log("Evento Logger: "+comando.comando);
 		console.log("Valor: "+comando.valor);

 		switch(comando.comando){
 			case "activar evento":
 				this.eventosService.activarEvento(comando.valor);
 				this.loggerService.log("-------------- Pasando Turno ------------------");
 			break;

 			case "console enemigos":
 				console.log("ENEMIGOS: ");
 				console.log(this.enemigos);
 			break;

 			case "console buff":
 				console.log("BUFF: ");
 				console.log(this.buff);
 			break;

 			case "console heroes hech":
 				console.log("HEROES HECH: ");
 				console.log(this.hechizos);	
 			break;

 			case "cambiar sala":
 				this.cambiarSala(comando.valor);
 				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
 				this.renderMazmorra.estadoControl.estado="seleccionAccion";
 			break;

 			case "add enemigo":
 				this.addEnemigo(comando.valor);
 				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
 				this.renderMazmorra.estadoControl.estado="seleccionAccion";
 			break;

 			case "eliminar enemigo":
 				this.enemigoMuerto(comando.valor-1);
 				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
 				this.renderMazmorra.estadoControl.estado="seleccionAccion";
 			break;

 			case "eliminar enemigo":
 				this.enemigoMuerto(comando.valor);
 				this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.renderMazmorra});
 				this.renderMazmorra.estadoControl.estado="seleccionAccion";
 			break;

 			case "restringir accion false":
 				this.restringirAcciones= false;
 			break;

 			case "restringir accion true":
 				this.restringirAcciones= true;
 			break;

 			case "reset":
 				this.socketService.enviarSocket("resetMazmorra",{peticion: "resetMazmorra", comando: "resetMazmorra", contenido: this.sala.nombre});
 			break;
 		}
 	}

 	/* 	----------------------------------------------
			MANEJO DE COMANDOS
		----------------------------------------------*/

 	activarComandoSocket():void{
 		this.comandoSocketActivo=true;
 		return;
 	}

 	desactivarComandoSocket():void{
 		this.comandoSocketActivo=false;
 		return;
 	}

 	comprobarConectado():void{	
 	}

 	/*  ----------------------------------------------
			GESTION DE EVENTOS
		----------------------------------------------*/

 	eventosObs(comando): void{
 	}

 	/* 	----------------------------------------------
			GESTION DE INTERFAZ
 		----------------------------------------------*/

 	interfazObs(comando):void{

 		console.log("Evento Interfaz: "+comando.comando);
		if(comando.valor!=""){
			console.log("Valor: "+comando.valor);
		}

 		switch(comando.comando){
 			case "cancelar":
 				this.renderMazmorra.estadoControl.estado="seleccionAccion";
				this.seleccionarEnemigos = false;
				this.seleccionarHeroes = false;
 				this.cancelarObjetivo();
 			break;
 			case "seleccionarHechizo":

 				console.log("Lanzando Hechizo: "+comando.valor);
 				if(this.verificarCasteo(comando.valor)){
 					this.seleccionObjetivo(comando.valor);

 					switch(this.renderMazmorra.estadoControl.tipoObjetivo){
 						case "EU":
							this.seleccionarEnemigos = true;
							console.log("SELECCIONANDO ENEMIGOS")
 							this.interfazService.setPantallaInterfaz("seleccionObjetivoEnemigo");
 						break;
 						case "EM":
							this.seleccionarEnemigos = true;
 							this.interfazService.setPantallaInterfaz("seleccionObjetivoEnemigo");
 						break;

 						case "AU":
							this.seleccionarHeroes = true;
 							this.interfazService.setPantallaInterfaz("seleccionObjetivoAliado");
 						break;
 						case "AM":
							this.seleccionarHeroes = true;
 							this.interfazService.setPantallaInterfaz("seleccionObjetivoAliado");
 						break;
 					}
 					
 				}
 			break;
 			case "lanzarHechizo":
				this.seleccionarEnemigos = false;
				this.seleccionarHeroes = false;
 				this.activarRNG();
 			break;
 		}
 	}

 	seleccionEnemigo(numEnemigo):void{
 		console.log("Selecionando Enemigo "+numEnemigo);

		if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
		}

		//Si castea heroe:
 		if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoEnemigo"){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
				for(var i = 0;i <this.renderMazmorra.enemigos.length; i++){
					this.renderMazmorra.enemigos[i].objetivo = false;
				}
				this.renderMazmorra.enemigos[numEnemigo].objetivo = true;
			}else{
				this.renderMazmorra.enemigos[numEnemigo].objetivo = !this.renderMazmorra.enemigos[numEnemigo].objetivo;
			}
 		}
 		return;
 	}

	seleccionarHeroe(index):void{

		console.log("Heroe seleccionado: ");

		//Si castea un heroe:
 		if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoAliado"&& (this.esHeroe)){
 			this.renderMazmorra.heroes[index].objetivo = !this.renderMazmorra.heroes[index].objetivo;
 		}

		//Si castea un Enemigo:
 		if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoEnemigo"&& (this.esEnemigo)){
 			this.renderMazmorra.heroes[index].objetivo = !this.renderMazmorra.heroes[index].objetivo;
 		}
	}

 	/* 	----------------------------------------------
			GESTION CONTROLES TACTILES
 	----------------------------------------------*/

 	routerInterfaz(pantalla): void{
 		switch(pantalla){
 			case "elegirHechizo":
 			//this.renderMazmorra.estadoControl.estado="eligiendoHechizo";
 			this.interfazService.setHeroesHech(this.hechizos);
			console.log(this.perfil)
			console.log(this.hechizos)

			var hechizosEquipadosID = [0,0,0,0,0];
			var hechizosEquipadosImagenID = [0,0,0,0,0];

			//Rellenar vector de imagenes de hechizos:

				for(var i=0; i <this.perfil["hechizos"].length;i++){
					if(this.perfil.hechizos[i]["nombre_personaje"].toLowerCase()==this.personaje.nombre.toLowerCase()){
						if(this.perfil.hechizos[i]["slot"]>0 && this.perfil.hechizos[i]["equipado"]=="true"){
							hechizosEquipadosID[this.perfil.hechizos[i]["slot"]-1]= this.perfil.hechizos[i]["hechizo_id"];
							hechizosEquipadosImagenID[this.perfil.hechizos[i]["slot"]-1]= this.hechizos.hechizos.find(j => j.id == this.perfil.hechizos[i]["hechizo_id"])["imagen_id"];
						}
					}
				}

 				this.interfazService.setEnemigos(this.enemigos);
 				this.interfazService.activarInterfazHechizos(hechizosEquipadosID, hechizosEquipadosImagenID);
 				console.log(pantalla)
 			break;

			case "elegirMovimiento":
				console.log("MOVIMIENTO")
 				this.interfazService.activarInterfazMovimiento(5);
			break;
 		}
 		return;
 	}

 	lanzarRng():void{
 		this.renderMazmorra.estadoControl.rng= this.rngService.getValorRng();
		this.desactivarRNG();
		this.lanzarHechizo();
		this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: this.renderMazmorra});
 		return;
 	}

}





