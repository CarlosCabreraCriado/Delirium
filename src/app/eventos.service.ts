
import { Injectable, EventEmitter } from '@angular/core';
import { AppService} from './app.service'
//import { Eventos } from './eventos.class';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EventosService {

	public eventos: any;
	public mostrarEvento:boolean= false;
	private estado:string="default";

	// Observable string sources
  private observarEventos = new Subject<string>();

  // Observable string streams
  observarEventos$ = this.observarEventos.asObservable();

  constructor(private appService: AppService) { }

}

