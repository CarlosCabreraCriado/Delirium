
import { Component,Input, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {LoggerService} from './logger.service';

@Component({
  selector: 'appLogger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.sass']
})
export class LoggerComponent {

	@Input() renderMazmorra: any;
	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;
	
  constructor(public loggerService: LoggerService) {}

   scrollToBottom(): void {
        try {
            this.contenedorMensajes.nativeElement.scrollTop = this.contenedorMensajes.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

  ngAfterViewChecked() {        
        this.scrollToBottom();        
    } 

  getRenderMazmorra():any{
  	return this.renderMazmorra;
  }

}
