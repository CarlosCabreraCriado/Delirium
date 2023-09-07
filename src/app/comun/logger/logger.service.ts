
import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class LoggerService {

	public logger=[];
	private loggerColor=[];
	private estadoLogger: string= "default";
	public mostrarLogger: boolean= false;
	private comando= "";

	private parametros: any;

	// Observable string sources
    private observarLogger = new Subject<any>();

    // Observable string streams
    observarLogger$ = this.observarLogger.asObservable();

    //Emisor de eventos Socket:
	@Output() subscripcionLogger: EventEmitter<any> = new EventEmitter();
	@Output() obtenerRender: EventEmitter<void> = new EventEmitter();
	@Output() obtenerSesion: EventEmitter<void> = new EventEmitter();
	@Output() obtenerEstado: EventEmitter<void> = new EventEmitter();

  constructor() {
  }

  setParametros(parametros){
  		this.parametros=parametros;
  	}

  toggleLogger(val: boolean):void{
    if(val){
      this.subscripcionLogger.emit("scroll");
    }
 		this.mostrarLogger = val;
 		this.comando= "";
 	}

 	log(mensaje:any,color?:any):void{
 		this.logger.push(mensaje);
 		if(color=="undefined"){
 			this.loggerColor.push("white");
 		}else{
 			this.loggerColor.push(color);
 		}
 	}

 	addComando(tecla: string){
 		switch(tecla){
 			case "Backspace":
 				this.comando=this.comando.slice(0,this.comando.length-1);
 			break;
 			default:
 				this.comando= this.comando+tecla;
 			break;
 		}
 	}

 	procesarComando(renderMazmorra,sesion,estadoControl){

 		//Estado Logger DEFAULT
 		if(this.estadoLogger=="default"){
 			switch(this.comando){

 				case "":
 					this.log("Comando vacio","white");
 				break;

 				case "help":
 					this.log("clear: limpia el logger");
 					this.log("render: devuelve el objeto de render actual (Estado de la partida)");
 					this.log("sesion: devuelve el objeto de sesion actual (Estado de la partida)");
 					this.log("reset: resetea la mazmorra (Reset a valor definido por server)");
 					this.log("registro analisis: Muestra el registro de estadisticas de la partida");
 					this.log("---------------------------------------------------------------------------------------------------");
 					this.log("stats heroes: Muestra las stats de un heroe (insertar ID despues de ejecutar instrucción)");
 					this.log("stats heroes all: Muestra las stats de todos los heroes");
 					this.log("stats enemigos: Muestra las stats de un enemigo (insertar ID despues de ejecutar instrucción)");
 					this.log("stats enemigos all: Muestra las stats de todos los enemigos");
 					this.log("---------------------------------------------------------------------------------------------------");
 					this.log("add enemigo: Añade un enemigo (insertar ID despues de ejecutar instrucción)");
 					this.log("eliminar enemigo: Elimina un enemigo (insertar ID despues de ejecutar instrucción)");
 					this.log("add sala: Abre una sala (insertar ID despues de ejecutar instrucción) WARNING: NO EXCEDER 6 ENEMIGOS");
 					this.log("---------------------------------------------------------------------------------------------------");
 					this.log("daño now: Muestra el daño total realizado en ese turno");
 					this.log("heal now: Muestra el daño total realizado en ese turno");
 					this.log("escudo now: Muestra el daño total realizado en ese turno");
 					this.log("---------------------------------------------------------------------------------------------------");
 					this.log("daño total: Muestra el daño total realizado en ese partida");
 					this.log("heal total: Muestra el daño total realizado en ese partida");
 					this.log("escudo total: Muestra el daño total realizado en la partida");
 					this.log("---------------------------------------------------------------------------------------------------");
 					this.log("restringir accion true: activa las restricciones de acciones");
 					this.log("restringir accion false: desactiva las restricciones de acciones");
 					this.log("---------------------------------------------------------------------------------------------------");

 				break;


 				case "clear":
 					this.logger= [];
 					this.loggerColor=[];
 				break;

 				case "render":
 					this.log("Render: "+JSON.stringify(renderMazmorra));
 					console.log(renderMazmorra);
 				break;

 				case "sesion":
 					this.log("Sesión: "+JSON.stringify(sesion));
 					console.log(sesion);
 				break;

 				case "reset":
 					this.log("Reseteando Mazmorra...");
 					this.observarLogger.next({comando: "reset",valor: {}, toggle:true});
 					this.estadoLogger="default";
 				break;

 				case "console enemigos":
 					this.log("Mostrando objeto enemigos en consola...");
 					this.observarLogger.next({comando: "console enemigos",valor: {}});
 					this.estadoLogger="default";
 				break;

 				case "console buff":
 					this.log("Mostrando objeto buff en consola...");
 					this.observarLogger.next({comando: "console buff",valor: {}});
 					this.estadoLogger="default";
 				break;

 				case "console heroes hech":
 					this.log("Mostrando objeto hereoes hech en consola...");
 					this.observarLogger.next({comando: "console heroes hech",valor: {}});
 					this.estadoLogger="default";
 				break;


 				//****************************************
 				//       COMANDO TURNO
 				//****************************************

 				case "turno":
 					this.log("Turno: "+renderMazmorra.turno);
 					this.log("Pasos de turno: "+renderMazmorra.registroTurno.length);
 					this.log("Registro Turnos: "+JSON.stringify(renderMazmorra.registroTurno));
 				break;

 				//****************************************
 				//       COMANDO REGISTRO ANALISIS
 				//****************************************

 				case "registro analisis":
 					this.log("Registro daño: "+JSON.stringify(renderMazmorra.estadisticas[0].dano));
 					this.log("Registro heal: "+JSON.stringify(renderMazmorra.estadisticas[0].heal));
 					this.log("Registro escudo: "+JSON.stringify(renderMazmorra.estadisticas[0].escudo));
 					this.log("Registro agro: "+JSON.stringify(renderMazmorra.estadisticas[0].dano));
 				break;

 				//****************************************
 				//       COMANDO ANALISIS DAÑO NOW ALL
 				//****************************************

 				case "daño now":
 				var danoNow=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						danoNow[i]= renderMazmorra.estadisticas[i].dano[renderMazmorra.estadisticas[i].dano.length-1];
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+danoNow[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS HEAL NOW ALL
 				//****************************************

 				case "heal now":
 				var healNow=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						healNow[i]= renderMazmorra.estadisticas[i].heal[renderMazmorra.estadisticas[i].heal.length-1];
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+healNow[i]);//CARLOS PRINGAO
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS ESCUDO NOW ALL
 				//****************************************

 				case "escudo now":
 				var escudoNow=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						escudoNow[i]= renderMazmorra.estadisticas[i].escudo[renderMazmorra.estadisticas[i].escudo.length-1];
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+escudoNow[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS AGRO NOW ALL
 				//****************************************

 				case "agro now":
 				var agroNow=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						agroNow[i]= renderMazmorra.estadisticas[i].agro[renderMazmorra.estadisticas[i].agro.length-1];
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+agroNow[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS DAÑO TOTAL ALL
 				//****************************************

 				case "daño total":
 				var danoTotal=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						danoTotal[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].dano.length; j++){
 							danoTotal[i]+= renderMazmorra.estadisticas[i].dano[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+danoTotal[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS HEAL TOTAL ALL
 				//****************************************

 				case "heal total":
 				var healTotal=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){//AUTOR: PABLO LOZANO GIL
 						healTotal[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].heal.length; j++){
 							healTotal[i]+= renderMazmorra.estadisticas[i].heal[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+healTotal[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS ESCUDO TOTAL ALL
 				//****************************************

 				case "escudo total":
 				var escudoTotal=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						escudoTotal[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].escudo.length; j++){
 							escudoTotal[i]+= renderMazmorra.estadisticas[i].escudo[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+escudoTotal[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS AGRO TOTAL ALL
 				//****************************************

 				case "agro total":
 				var agroTotal=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						agroTotal[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].agro.length; j++){
 							agroTotal[i]+= renderMazmorra.estadisticas[i].agro[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+agroTotal[i]);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS DAÑO MEDIO PT ALL
 				//****************************************

 				case "daño medio pt":
 				var danoMedioPt=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						danoMedioPt[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].dano.length; j++){
 							danoMedioPt[i]+= renderMazmorra.estadisticas[i].dano[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+danoMedioPt[i]/renderMazmorra.estadisticas[i].dano.length);
 					}
 				break;

 				//****************************************
 				//       COMANDO ANALISIS HEAL MEDIO PT ALL
 				//****************************************

 				case "heal medio pt":
 				var healMedioPt=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						healMedioPt[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].heal.length; j++){
 							healMedioPt[i]+= renderMazmorra.estadisticas[i].heal[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+healMedioPt[i]/renderMazmorra.estadisticas[i].heal.length);
 					}
 				break;

 				//****************************************
 				//     COMANDO ANALISIS ESCUDO MEDIO PT ALL
 				//****************************************

 				case "escudo medio pt":
 				var escudoMedioPt=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						escudoMedioPt[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].escudo.length; j++){
 							escudoMedioPt[i]+= renderMazmorra.estadisticas[i].escudo[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+escudoMedioPt[i]/renderMazmorra.estadisticas[i].escudo.length);
 					}
 				break;

 				//****************************************
 				//     COMANDO ANALISIS AGRO MEDIO PT ALL
 				//****************************************

 				case "agro medio pt":
 				var agroMedioPt=[];
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						agroMedioPt[i]= 0;
 						for(var j=0; j<renderMazmorra.estadisticas[i].agro.length; j++){
 							agroMedioPt[i]+= renderMazmorra.estadisticas[i].agro[j];
 						}
 						this.log(renderMazmorra.heroes[i].nombre+" ==> "+agroMedioPt[i]/renderMazmorra.estadisticas[i].agro.length);
 					}
 				break;

 				//****************************************
 				//       COMANDO STATS HEROES
 				//****************************************

 				case "stats heroes":
 					this.log("** Seleccione Heroe: ", "orange");
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						this.log((i+1)+": "+renderMazmorra.heroes[i].nombre,"orange");
 					}
 					this.estadoLogger="stats heroes";
 				break;

 				//****************************************
 				//       COMANDO STATS HEROES ALL
 				//****************************************
 				case "stats heroes all":
 					for(var i=0; i<renderMazmorra.heroes.length; i++){
 						this.log("---------- "+renderMazmorra.heroes[i].nombre+" -------");
 						this.log("Clase : "+renderMazmorra.heroes[i].clase);
 						this.log("Vida Máxima : "+(renderMazmorra.heroes[i].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib));
 						this.log("Vida (%): "+renderMazmorra.heroes[i].vida);
 						this.log("Vida (Pts): "+renderMazmorra.heroes[i].vida * (renderMazmorra.heroes[i].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100);
 						this.log("Recurso (%): "+renderMazmorra.heroes[i].recurso);
 						this.log("Recurso Especial : "+renderMazmorra.heroes[i].recursoEspecial);
 						this.log("General : "+renderMazmorra.heroes[i].estadisticas.general);
 						this.log("Armadura : "+renderMazmorra.heroes[i].estadisticas.armadura);
 						this.log("Vitalidad : "+renderMazmorra.heroes[i].estadisticas.vitalidad);
 						this.log("Fuerza : "+renderMazmorra.heroes[i].estadisticas.fuerza);
 						this.log("Intelecto : "+renderMazmorra.heroes[i].estadisticas.intelecto);
 						this.log("Precision : "+renderMazmorra.heroes[i].estadisticas.precision);
 						this.log("Ferocidad : "+renderMazmorra.heroes[i].estadisticas.ferocidad);
 						this.log("*");
 					}
 				break;

 				//****************************************
 				//       COMANDO STATS ENEMIGOS
 				//****************************************

 				case "stats enemigos":
 					this.log("** Seleccione Enemigo: ", "orange");
 					for(var i=0; i<renderMazmorra.enemigos.length; i++){
 						this.log((i+1)+": "+renderMazmorra.enemigos[i].nombre,"orange");
 					}
 					this.estadoLogger="stats enemigos";
 				break;

 				//****************************************
 				//       COMANDO STATS ENEMIGOS ALL
 				//****************************************
 				case "stats enemigos all":
 					for(var i=0; i<renderMazmorra.enemigos.length; i++){
 						this.log("---------- "+renderMazmorra.enemigos[i].nombre+" -------");
 						this.log("Vida Máxima : "+(renderMazmorra.enemigos[i].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib));
 						this.log("Vida (%): "+renderMazmorra.enemigos[i].vida);
 						this.log("Vida (Pts): "+renderMazmorra.enemigos[i].vida * (renderMazmorra.enemigos[i].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100);
 						this.log("Armadura : "+renderMazmorra.enemigos[i].estadisticas.armadura);
 						this.log("Vitalidad : "+renderMazmorra.enemigos[i].estadisticas.vitalidad);
 						this.log("Fuerza : "+renderMazmorra.enemigos[i].estadisticas.fuerza);
 						this.log("Intelecto : "+renderMazmorra.enemigos[i].estadisticas.intelecto);
 						this.log("Precision : "+renderMazmorra.enemigos[i].estadisticas.precision);
 						this.log("Ferocidad : "+renderMazmorra.enemigos[i].estadisticas.ferocidad);
 						this.log("*");
 					}
 				break;

 				//****************************************
 				//       COMANDO TRIGGER EVENTO
 				//****************************************
 				case "trigger evento":
 					this.log("**  INTRODUZCA EL ID DEL EVENTO **");
 					this.estadoLogger= "evento";
 				break;

 				//****************************************
 				//       COMANDO ESTADO
 				//****************************************
 				case "estado":
 					this.log("MOSTRANDO ESTADO CONTROL... ");
 					console.warn("ESTADO CONTROL: ",estadoControl);
 				break;

 				//****************************************
 				//       Eliminar Enemigo
 				//****************************************

 				case "eliminar enemigo":
 					this.log("** Seleccione ID Enemigo: ", "orange");
 					for(var i=0; i<renderMazmorra.enemigos.length; i++){
 						this.log((i+1)+": "+renderMazmorra.enemigos[i].nombre,"orange");
 					}
 					this.estadoLogger="eliminar enemigo";
 				break;

 				//****************************************
 				//       Add Enemigo
 				//****************************************

 				case "add enemigo":
 					this.log("** Seleccione ID Enemigo: ", "orange");
 					this.estadoLogger="add enemigo";
 				break;//PENE


 				//****************************************
 				//       Abrir Sala
 				//****************************************

 				case "add sala":
 					this.log("** Introduzca ID Sala: ", "orange");
 					this.estadoLogger="add sala";
 				break;

 				//****************************************
 				//       Activar Restringir Accion
 				//****************************************

 				case "restringir accion true":
 					this.log("RESTRICCION DE ACCION: ACTIVADO", "orange");
 					this.observarLogger.next({comando: "restringir accion true",valor: this.comando});
 					this.estadoLogger="default";
 				break;

 				//****************************************
 				//       Desactivar Restringir Accion
 				//****************************************

 				case "restringir accion false":
 					this.log("RESTRICCION DE ACCION: DESACTIVANDO ", "orange");
 					this.observarLogger.next({comando: "restringir accion false",valor: this.comando});
 					this.estadoLogger="default";
 				break;


 				//****************************************
 				//       COMANDO NO ENCONTRADO
 				//****************************************

 				default:
 					this.log("Comando no encontrado","red");
 				break;
 			}
 			this.comando="";
 			return;
 		}

 		//Estado Logger STATS HEROES
 		if(this.estadoLogger=="stats heroes"){
 			if(+this.comando<=renderMazmorra.heroes.length){
 				this.log("---------- "+renderMazmorra.heroes[+this.comando-1].nombre+" -------");
 				this.log("Clase : "+renderMazmorra.heroes[+this.comando-1].clase);
 				this.log("Vida Máxima : "+(renderMazmorra.heroes[+this.comando-1].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib));
 				this.log("Vida (%): "+renderMazmorra.heroes[+this.comando-1].vida);
 				this.log("Vida (Pts): "+renderMazmorra.heroes[+this.comando-1].vida * (renderMazmorra.heroes[+this.comando-1].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100);
 				this.log("Recurso : "+renderMazmorra.heroes[+this.comando-1].recurso);
 				this.log("Recurso Especial : "+renderMazmorra.heroes[+this.comando-1].recursoEspecial);
 				this.log("General : "+renderMazmorra.heroes[+this.comando-1].estadisticas.general);
 				this.log("Armadura : "+renderMazmorra.heroes[+this.comando-1].estadisticas.armadura);
 				this.log("Vitalidad : "+renderMazmorra.heroes[+this.comando-1].estadisticas.vitalidad);
 				this.log("Fuerza : "+renderMazmorra.heroes[+this.comando-1].estadisticas.fuerza);
 				this.log("Intelecto : "+renderMazmorra.heroes[+this.comando-1].estadisticas.intelecto);
 				this.log("Precision : "+renderMazmorra.heroes[+this.comando-1].estadisticas.precision);
 				this.log("Ferocidad : "+renderMazmorra.heroes[+this.comando-1].estadisticas.ferocidad);
 			}else{
 				this.log("Valor no valido","red");
 			}
 			this.estadoLogger="default";
 		}

 		//Estado Logger STATS ENEMIGOS
 		if(this.estadoLogger=="stats enemigos"){
 			if(+this.comando<=renderMazmorra.enemigos.length){
 				this.log("---------- "+renderMazmorra.enemigos[+this.comando-1].nombre+" -------");
 				this.log("Vida Máxima : "+(renderMazmorra.enemigos[+this.comando-1].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib));
 				this.log("Vida (%): "+renderMazmorra.enemigos[+this.comando-1].vida);
 				this.log("Vida (Pts): "+renderMazmorra.enemigos[+this.comando-1].vida * (renderMazmorra.enemigos[+this.comando-1].estadisticas.vitalidad*this.parametros.atributos[0].vitalidad_atrib)/100);
 				this.log("Armadura : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.armadura);
 				this.log("Vitalidad : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.vitalidad);
 				this.log("Fuerza : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.fuerza);
 				this.log("Intelecto : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.intelecto);
 				this.log("Precision : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.precision);
 				this.log("Ferocidad : "+renderMazmorra.enemigos[+this.comando-1].estadisticas.ferocidad);
 			}else{
 				this.log("Valor no valido","red");
 			}
 			this.estadoLogger="default";
 		}

 		//Estado Logger ADD ENEMIGO:
 		if(this.estadoLogger=="add enemigo"){
 			this.observarLogger.next({comando: "add enemigo",valor: this.comando,toggle: true});
 			this.estadoLogger="default";
 		}

 		//Estado Logger Eliminar ENEMIGO:
 		if(this.estadoLogger=="eliminar enemigo"){
 			this.observarLogger.next({comando: "eliminar enemigo",valor: this.comando,toggle: true});
 			this.estadoLogger="default";
 		}

 		//Estado Logger ADD SALA:
 		if(this.estadoLogger=="add sala"){
 			this.observarLogger.next({comando: "cambiar sala",valor: this.comando,toggle: true});
 			this.estadoLogger="default";
 		}

 		//Estado Logger ACTIVAR EVENTO:
 		if(this.estadoLogger=="evento"){
 			this.observarLogger.next({comando: "activar evento",valor: this.comando,toggle: true});
 			this.estadoLogger="default";
 		}

 		this.comando="";
 		return;
 	}

}

