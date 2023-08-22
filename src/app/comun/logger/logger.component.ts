
import { Component,Input, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import { LoggerService } from './logger.service';
import { MazmorraService } from '../mazmorra/mazmorra.service';

@Component({
  selector: 'appLogger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.sass']
})
export class LoggerComponent {

	@Input() renderMazmorra: any;
	@Input() sesion: any;
	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;

  public heroeHech: any;
  public heroeStat: any;
  public enemigos: any;
  public buff: any;
  public objetos: any;
  public animaciones: any;
  public parametros: any;

  constructor(public loggerService: LoggerService, private mazmorraService: MazmorraService) {}

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

  cerrarLogger():any{
    this.loggerService.toggleLogger(false);
  }

  getParametros():any{
    this.parametros= this.mazmorraService.parametros;
    return this.parametros;
  }



}
