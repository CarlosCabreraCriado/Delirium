
import { Injectable, EventEmitter } from '@angular/core';
//import { Eventos } from './eventos.class';
import { Subscription } from 'rxjs';
import { EventosService } from "./eventos.service";
import { AppService } from "./app.service";

@Injectable({
  providedIn: 'root'
})

export class TriggerService {

    public triggerRegion: any;
    public mostrarEvento:boolean= false;
    private estado:string="default";
    private sesion: any; 

    //Declara Suscripcion para Eventos:
    private appServiceSuscripcion: Subscription;

  constructor(private eventosService: EventosService, private appService: AppService) { 
        //Observar Sesion:
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);

		//Observar Eventos AppService:
		this.appServiceSuscripcion = this.appService.eventoAppService.subscribe(
			(val) => {
				switch(val){
					case "inicializarIsometrico":
                        this.triggerRegion = this.appService.getTriggerRegion();
						break;
				}
		});
  }

  setTriggerRegion(triggersRegion: any){
    console.warn("CARGANDO TRIGGERS REGIÓN: ",triggersRegion); 
    this.triggerRegion = triggersRegion;
  }

  checkTrigger(activacion: string,config?:any){
      console.warn("CHECK Trigger: ",activacion,config)
      //Validar la activación: 
      switch(activacion){
          case "entrarCasilla":
                this.verificarEntrarCasilla(config["posicion_x"],config["posicion_y"]); 
              break;
          case "cambioVariable":
              break;
          case "enemigoEliminado":
              break;
          case "subirNivel":
              break;
          case "iniciarMazmorra":
              break;
          case "finalizarMazmorra":
              break;
          case "completarMision":
              break;
          case "pasoTurno":
              break;
          case "lanzarHechizo":
              break;
          case "movimiento":
              break;
          default:
              console.error("Activador de trigger invalido: "+activacion);
              return;
              break;
      }
  }//Fin Check Trigger

  verificarEntrarCasilla(posicion_x,posicion_y){
      for(var i=0; i < this.triggerRegion.length; i++){
          if((this.triggerRegion[i]["posicion_x"]== posicion_x) && (this.triggerRegion[i]["posicion_y"]==posicion_y)){
            this.ejecutarTrigger("region",i);
          }
      }
  }//Fin VerificarEntrarCasilla

  ejecutarTrigger(tipoTrigger: string, indexTriggerActivado: number){
        var triggerActivo = {}
        switch(tipoTrigger){
            case "region":
                triggerActivo = this.triggerRegion[indexTriggerActivado];
            break;
            default:
                console.error("ERROR Tipo Trigger no declarado en EjecutarTrigger");
            break; 
        }

        console.warn("TRIGGER ACTIVADO: ",triggerActivo);

        // 1) VERIFICANDO CONDICION INICIAL:
        if(triggerActivo["condicionInicial"]["activado"]){
            switch(triggerActivo["condicionInicial"]["operador"]){
                case "==":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        == triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
                case "!=":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        != triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
                case "menor":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        < triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
                case "mayor":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        > triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
                case "menorIgual":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        <= triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
                case "mayorIgual":
                    if(!(this.sesion.variablesMundo[triggerActivo["condicionInicial"]["variable"]]
                        >= triggerActivo["condicionInicial"]["valorComparado"])){
                        return;
                    }
                    break;
            }
        }

        // 2) EJECUTANDO OPERADOR PRE:
        // 3) EJECUTANDO CONDICION CONTADOR:
        // 4) EJECUTANDO EVENTO:
        this.eventosService.ejecutarEvento(triggerActivo["triggerEvento"]["eventoTriggerTrue"]);

  }//Fin Ejecutar Trigger

}

