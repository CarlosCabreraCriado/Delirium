
import { Component,Input, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {LoggerService} from './logger.service';
import {DeveloperCombateService} from '../developer-combate/developerCombate.service';

@Component({
  selector: 'appLogger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.sass']
})
export class LoggerComponent {

	@Input() renderMazmorra: any;
	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;

  public heroeHech: any;
  public heroeStat: any;
  public enemigos: any;
  public buff: any;
  public objetos: any;
  public animaciones: any;
  public parametros: any;

  constructor(public loggerService: LoggerService,private developerCombateService: DeveloperCombateService) {}

   scrollToBottom(): void {
        try {
            this.contenedorMensajes.nativeElement.scrollTop = this.contenedorMensajes.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

  ngAfterViewChecked() {        
        this.scrollToBottom();      
        this.loggerService.setParametros(this.getParametros());  
    } 

  getRenderMazmorra():any{
  	return this.renderMazmorra;
  }

  getParametros():any{
    this.parametros= this.developerCombateService.parametros;
    return this.parametros;
  }

  

}
