
import { Injectable, EventEmitter } from '@angular/core';
//import { Eventos } from './eventos.class';
import { Subject } from 'rxjs';
import { EventosService } from "./eventos.service";

@Injectable({
  providedIn: 'root'
})

export class TriggerService {

    public triggersRegion: any;
    public mostrarEvento:boolean= false;
    private estado:string="default";

    // Observable string sources
  private observarEventos = new Subject<string>();

  // Observable string streams
  observarEventos$ = this.observarEventos.asObservable();

  constructor(private eventosService: EventosService) { }

  setTriggerRegion(triggersRegion: any){
    console.warn("CARGANDO TRIGGERS REGIÓN: ",triggersRegion); 
    this.triggersRegion = triggersRegion;
  }

  checkTrigger(activacion: string){
      //Validar la activación: 
      switch(activacion){
          case "entrarCasilla":
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
      

  }

}

