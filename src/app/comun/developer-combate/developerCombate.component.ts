
import { Component, OnInit, AfterViewInit, NgModule, ViewChildren, QueryList, Directive} from '@angular/core';
import { AppService } from '../../app.service';
import { DeveloperCombateService } from './developerCombate.service';
import { Subscription } from "rxjs";
import { RenderMazmorra} from './render.class';
import { trigger,state,style, animate, transition} from '@angular/animations';
import { AnimacionNumeroComponent} from '../animacion-numero/animacion-numero.component'
import { LoggerComponent} from '../logger/logger.component'
import { LoggerService} from '../logger/logger.service'
import { PausaService} from '../pausa/pausa.service'
import { EventosService} from '../eventos/eventos.service'
import { RngComponent} from '../rng/rng.component'
import { InterfazService} from '../interfaz/interfaz.service'
import { SocketService} from '../socket/socket.service'
import { HeroesInfoService} from '../heroesInfo/heroesInfo.service'

@Directive({selector: 'AppAnimacionNumero'})
class AppAnimacionNumero {
}

@Component({
  selector: 'app-developer',
  templateUrl: './developerCombate.component.html',
  styleUrls: ['./developerCombate.component.sass'],
  animations: [
    // animation triggers go here
  ]
})

export class DeveloperCombateComponent implements OnInit,AfterViewInit{
	constructor(private developerCombateService: DeveloperCombateService, private appService: AppService, private loggerService:LoggerService, private pausaService:PausaService, private eventosService: EventosService, private socketService: SocketService, private interfazService:InterfazService, private heroesInfoService: HeroesInfoService){}
	
	@ViewChildren("animacionNumero") components: QueryList<AppAnimacionNumero>

	//Declara Suscripción para imput de teclado:
	private tecla: string;
	private teclaSuscripcion: Subscription;

	//Declara Suscripcion para Logger:
	private appServiceSuscripcion: Subscription;

	//Declara Suscripcion para Logger:
	private loggerSuscripcion: Subscription;
	private retrasoLoggerObs= 1000;
	private bloquearLogger= false;

	//Declara Suscripcion para Eventos:
	private eventosSuscripcion: Subscription;

	//Declara Suscripcion para Interfaz:
	private interfazSuscripcion: Subscription;

	//Declara Estado para eventos de Servicio Combate:
	private estado: string;
	private estadoSuscripcion: Subscription;

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription;

	//Variables Internas:
	private mostrarPantallaCarga:boolean = true;

	//Variables Renderizado:
	private autoGuardado:any;
	private autoGuardado2:any;

	//Variable de renderizado:
	public renderMazmorra: RenderMazmorra;
	public sala:any={};
	
/* 	----------------------------------------------
	SUSCRIPCIONES E IMPORTACION DE OBJETOS A SERVICIO
 	----------------------------------------------*/
	ngOnInit(){

		this.appService.mostrarPantallacarga(true);

		console.log("PERFIL: ");
		console.log(this.appService.getPerfil());
		this.developerCombateService.setDispositivo(this.appService.getDispositivo());
		this.developerCombateService.validacion = this.appService.getValidacion();

		if(this.appService.control!="mazmorra"){this.appService.setControl("mazmorra")}

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{

      		if(this.appService.control!="mazmorra"){return;}
      		/*
      		if(data.emisor == this.appService.getValidacion().nombre && this.developerCombateService.validacion.tipo==data.tipoEmisor){
      			switch(data.peticion){

      				case "unirsePartida":
      					if(this.developerCombateService.partidaIniciada){
      						console.log("EVITANDO "+data.peticion);
      						return;
      					}
      				break;

      				default:
      					console.log("EVITANDO "+data.peticion);
      					return;
      				break;
      			}
      		}
			*/
      		switch(data.peticion){

      			case "log":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      			break;

      			case "estadoSala":
      				console.log("Peticion: "+data.peticion);
      				console.log("Emisor: "+data.emisor);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
      		    	this.developerCombateService.sala= this.sala;
      		    	this.developerCombateService.comprobarConectado();
      		    	this.developerCombateService.sincronizar=false;  	
      			break;

      			case "unirsePartida":
      				console.log("Peticion: "+data.peticion);
      				console.log("Emisor: "+data.emisor);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.sala = data.contenido;
      		    	this.appService.setSala(this.sala);
      		    	this.developerCombateService.sala= this.sala;
      		    	this.renderMazmorra = this.developerCombateService.cargarPartida(this.sala);
      		    	this.developerCombateService.sincronizar=false;  	
      			break;

      			case "cerrarSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	this.appService.setSala({});    		    	
      		    	this.retroceder();
      			break;

      			case "comandoPartida":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Comando: "+data.comando);
      		    	if(data.emisor == this.appService.getValidacion().nombre){break;}
      		    	switch(data.comando){

      		    		case "pasarTurno":
      		    			this.developerCombateService.activarComandoSocket();
      		    			this.developerCombateService.routerMazmorra("p");
      		    		break;

      		    		case "lanzarHechizo":
      		    			console.log("Sincronizando hechizo");
      		    			console.log(data.contenido);
  
      		    			//this.developerCombateService.setRenderMazmorra(data.contenido);
      		    			//console.log(data.contenido);

      						this.developerCombateService.lanzarHechizo();
 							
      		    			//this.renderMazmorra =this.developerCombateService.getRenderMazmorra();
      		    		break;

      		    		case "forzarRewind":
      		    			console.log("Sincronizando: ");
      		    			console.log(data.contenido);
      		    			this.renderMazmorra = data.contenido;
      		    			this.developerCombateService.setRenderMazmorra(data.contenido);
      		    			this.developerCombateService.mensajeAccion("Realizando rewind...",5000);
      		    		break;

      		    		case "forzarSincronizacion":
      		    			console.log("Forzando Sincronizando: ");
      		    			console.log(data.contenido);
      		    			this.renderMazmorra = data.contenido;
      		    			this.developerCombateService.setRenderMazmorra(data.contenido);
      		    			this.developerCombateService.mensajeAccion("Sincronizando...",2000);
      		    		break;

      		    		case "sincronizacion":
      		    			console.log("Sincronizando: ");
      		    			console.log(data.contenido);
      		    			this.renderMazmorra = data.contenido;
      		    			this.developerCombateService.setRenderMazmorra(data.contenido);
      		    		break;
      		    	}
      			break;
      		} 
      	});


		//Suscripcion AppService:
		this.appServiceSuscripcion = this.appService.observarAppService$.subscribe((val) => {
        	switch(val){
        		case "Iniciar":
        			this.developerCombateService.validacion=this.appService.getValidacion();
        			
        			if(this.developerCombateService.validacion.miembro=="Host"){
        				//this.socketService.enviarSocket('crearPartida', {nombre: this.developerCombateService.validacion.nombre, clave: this.developerCombateService.validacion.clave});
        			}else{
        				//this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.developerCombateService.validacion.nombre, nombreSala: "Oficial", contenido: this.appService.perfil.heroes[0]});
        			}
        		break;

        		case "AbandonarPartida":
        			this.abandonarPartida();
        		break;
        	}
        });

		//Suscripcion Tecla Pulsada:
		this.teclaSuscripcion = this.appService.observarTeclaPulsada$.subscribe((val) => {
        	this.tecla= val;
        	this.developerCombateService.emisor=true;
        	this.developerCombateService.routerMazmorra(val);
        });

		//suscripcion Logger:
        this.loggerSuscripcion = this.loggerService.observarLogger$.subscribe((val) => {
        	if(!this.bloquearLogger){
        		this.developerCombateService.loggerObs(val);
        	}
        	setTimeout(()=>{    
      			this.bloquearLogger=false;
 			}, this.retrasoLoggerObs); 
        });

        //suscripcion Eventos:
        this.eventosSuscripcion = this.eventosService.observarEventos$.subscribe((val) => {
        	this.developerCombateService.eventosObs(val);
   		});

        //suscripcion Interfaz:
        this.interfazSuscripcion = this.interfazService.observarInterfaz$.subscribe((val) => {
        	this.developerCombateService.interfazObs(val);
        });

      	//Inicio suscripcion evento progreso Carga
    	this.developerCombateService.cargarAutoGuardado.subscribe(autoGuardado => {
      		this.renderMazmorra = this.developerCombateService.getRenderMazmorra();
    	});

    	//Inicio suscripcion evento logger
    	this.loggerService.obtenerRender.subscribe(val => {
      		console.log("ENVIADO");
      		return this.renderMazmorra;
    	});


    	if(!this.appService.debug){
    		//this.developerCombateService.validacion = this.appService.getValidacion();
    		//this.renderMazmorra = this.developerCombateService.cargarPartida(this.sala);
    	}
    	
    	this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.developerCombateService.validacion.nombre});
	}

	ngOnDestroy(){
		this.loggerSuscripcion.unsubscribe();
 		this.socketSubscripcion.unsubscribe();
 		this.eventosSuscripcion.unsubscribe();
 		this.interfazSuscripcion.unsubscribe();
 		this.appServiceSuscripcion.unsubscribe();
 		this.teclaSuscripcion.unsubscribe();
	}

/* 	----------------------------------------------
		ELIMINACIÓN DE PANTALLA DE CARGA
 	----------------------------------------------*/
	ngAfterViewInit() {
		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 2000);
  	}

/* 	----------------------------------------------
		ROUTER DE ACCIONES DE MAZMORRA
 	----------------------------------------------*/
	actualizarComponente(): void{
	}

/* 	----------------------------------------------
	Evento de actualización de parametros de mazmorra
 	----------------------------------------------*/
	actualizarInterfazMazmorra(): void{
	}

/* 	----------------------------------------------
		FUNCIONES DE RENDERIZADO DE INTERFAZ
 	----------------------------------------------*/

 	renderIndividual(): any{
    	var clase= "";
	
    	if(this.developerCombateService.getDispositivo()=="Movil"){
    	  clase= clase+" Individual"
    	}
    	return clase;
  	}

	renderizarMarcoHeroe(i:number): string{

		var clases = "Heroe-"+(i+1);

		//Renderiza marco de turno:
		if(this.renderMazmorra.heroes[i].turno){
			clases = clases + " Turno";
		}

		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
		var esHeroe = false;
		var esEnemigo = false;
		for(var k=0; k<this.renderMazmorra.heroes.length; k++){
			if(this.renderMazmorra.heroes[k].turno){
				esHeroe= true;
				break;
			}
		}

		for(var k=0; k<this.renderMazmorra.enemigos.length; k++){
			if(this.renderMazmorra.enemigos[k].turno){
				esEnemigo= true;
				break;
			}
		}


		//Renderiza Marco de objetivoAuxiliar:
		if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAuxiliarAliado";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoAuxiliarEnemigo";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAuxiliarAliado";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAuxiliarEnemigo";
				}
			}
		}

		//Renderiza Marco de objetivo:
		if(this.renderMazmorra.heroes[i].objetivo){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAliado";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoEnemigo";
				}
			}
		}
		return clases;
	}

	renderizarEscudoHeroe(i:number): string{
		var left= 0;
		//Si el escudo cabe en la vida que falta
		if(100-this.renderMazmorra.heroes[i].vida >= this.renderMazmorra.heroes[i].escudo){
			left= this.renderMazmorra.heroes[i].vida + (this.renderMazmorra.heroes[i].escudo/2);
		}else{
			left= 100 - (this.renderMazmorra.heroes[i].escudo/2);
		}
		
		return left+"%";
	}

	renderizarClaseBuffosHeroe(i:number,j:number): string{
		var clases;

		//Renderiza buffo o debuffo:
		if(this.renderMazmorra.heroes[i].buff[j].tipo2== "DEBUF"){
			clases = "DeBuffo-Heroe";
		}

		//Renderiza buffo o debuffo:
		if(this.renderMazmorra.heroes[i].buff[j].tipo2== "BUFF"){
			clases = "Buffo-Heroe";
		}
		return clases;
	}

	renderizarEstiloBuffosHeroe(i:number,j:number,buff:any):any{
		var estilo={}
		console.log(buff)
		var  indexVertical= Math.floor(buff.icon_id/10);
        var  indexHorizontal= buff.icon_id-indexVertical*10;
		estilo={
			'background':'url(./assets/Buffos/Buff.png) '+0.5+11*indexHorizontal+'% '+0.5+9.9*indexVertical+'%',
			'background-size': '1000% 1100%'
		}
		return estilo;
	}

	renderizarMarcoEnemigo(i:number): string{
		var clases = "Enemigo-"+(i+1);
		//Renderiza Marco de turno:
		if(this.renderMazmorra.enemigos[i].turno){
			clases = clases + " Turno";
		}

		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
 		var esHeroe = false;
 		var esEnemigo = false;
 		for(var k=0; k<this.renderMazmorra.heroes.length; k++){
 			if(this.renderMazmorra.heroes[k].turno){
 				esHeroe= true;
  				break;
 			}
 		}

 		for(var k=0; k<this.renderMazmorra.enemigos.length; k++){
 			if(this.renderMazmorra.enemigos[k].turno){
 				esEnemigo= true;
 				break;
 			}
 		}

		//Renderiza Marco de objetivoAuxiliar:
		if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAuxiliarAliado";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoAuxiliarEnemigo";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAuxiliarEnemigo";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAuxiliarAliado";
				}
			}
		}

		//Renderiza Marco de objetivo:
		if(this.renderMazmorra.enemigos[i].objetivo){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoEnemigo";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAliado";
				}
			}
		}
		return clases;
	}

	renderizarEscudoEnemigo(i:number): string{
		var left= 0;
		//Si el escudo cabe en la vida que falta
		if(100-this.renderMazmorra.enemigos[i].vida >= this.renderMazmorra.enemigos[i].escudo){
			left= this.renderMazmorra.enemigos[i].vida + (this.renderMazmorra.enemigos[i].escudo/2);
		}else{
			left= 100 - (this.renderMazmorra.enemigos[i].escudo/2);
		}
		
		return left+"%";
	}

	renderizarIndiceAgroEnemigo(indiceEnemigo: number): number{
		var indiceMaxAgro;
		indiceMaxAgro = this.renderMazmorra.enemigos[indiceEnemigo].agro.indexOf(Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro))+1;
		if(Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro)==0){
			indiceMaxAgro=0;
		}
		return indiceMaxAgro;
	}

	renderizarAgroEnemigo(indiceEnemigo: number): string{
		var clase= "0%";
		var sumaAgro= 0;

		for(var i=0; i< this.renderMazmorra.enemigos[indiceEnemigo].agro.length;i++){
			sumaAgro += this.renderMazmorra.enemigos[indiceEnemigo].agro[i];
		}

		var maxAgro = Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro);

		clase= maxAgro/sumaAgro*100+"%";
		return clase;
	}

	renderizarClaseBuffosEnemigos(i:number,j:number): string{
		var clases;

		//Renderiza buffo o debuffo:
		if(this.renderMazmorra.enemigos[i].buff[j].tipo2== "DEBUF"){
			clases = "DeBuffo-Enemigo";
		}

		//Renderiza buffo o debuffo:
		if(this.renderMazmorra.enemigos[i].buff[j].tipo2== "BUFF"){
			clases = "Buffo-Enemigo";
		}
		return clases;
	}

	renderizarEstiloBuffosEnemigos(buff:any):any{
		
		var estilo={}
		var  indexVertical= Math.floor(buff.icon_id/10);
        var  indexHorizontal= buff.icon_id-indexVertical*10;

		estilo={
			'background':'url(./assets/Buffos/Buff.png) '+(0.5+11*indexHorizontal)+'% '+(0.5+9.9*indexVertical)+'%',
			'background-size': '1000% 1100%'
		}
		return estilo;
	}

	/* 	----------------------------------------------
		FUNCIONES DE PAUSE
 	----------------------------------------------*/
 	abandonarPartida():void{
 		
 		this.pausaService.togglePause();
 		
 		//Quitar Suscripciones:
 		this.loggerSuscripcion.unsubscribe();
 		this.socketSubscripcion.unsubscribe();
 		this.eventosSuscripcion.unsubscribe();
 		this.interfazSuscripcion.unsubscribe();
 		this.appServiceSuscripcion.unsubscribe();
 		this.teclaSuscripcion.unsubscribe();

 		this.developerCombateService.cargaCompleta=false;

 		//Gestionar Control:
 		this.appService.setSala({});
 		this.socketService.enviarSocket('abandonarSala',null);
 		this.appService.setControl("");
 		this.developerCombateService.musicaMazmorra.volume= 0;
  		this.developerCombateService.musicaMazmorra.remove();
		this.appService.cambiarUrl("index");	
 	}
	/* 	----------------------------------------------
		FUNCIONES VARIAS
 		----------------------------------------------*/

	retroceder():void{
		this.appService.setControl("");
		this.developerCombateService.musicaMazmorra.volume= 0;
  		this.developerCombateService.musicaMazmorra.remove();
		this.appService.cambiarUrl("index");
	}

	seleccionarHeroe(index):void{
		console.log("Heroe seleccionado: ");
		this.heroesInfoService.setPersonaje(index);
		this.heroesInfoService.mostrarHeroesInfo=true;
	}

}





