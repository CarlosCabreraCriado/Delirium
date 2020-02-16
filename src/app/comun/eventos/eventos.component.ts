

import {Component,Input, ViewChild, ElementRef, AfterViewChecked, OnInit} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service'
import {EventosService} from './eventos.service';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.sass']
})

export class EventosComponent{

	//Declara Suscripción para imput de teclado:
	private tecla: string;
	private teclaSuscripcion: Subscription = null;

	@Input() eventos: any;

  constructor(public eventosService: EventosService, private appService: AppService) { }


  	ngOnInit(){
  		this.teclaSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.eventosService.routerEventos(val);
        });
  	}
  

}
