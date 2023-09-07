
import { Component,Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { LoggerService } from './logger.service';
import { MazmorraService } from '../mazmorra/mazmorra.service';
import { Subscription } from "rxjs";

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
  private scrollFlag: boolean = false;

  //Declara Suscripcion Evento Socket:
  private loggerSubcription: Subscription

  constructor(public loggerService: LoggerService, private mazmorraService: MazmorraService) {}

  ngOnInit(){
        this.loggerSubcription = this.loggerService.subscripcionLogger.subscribe((data) =>{
          this.scrollFlag = true;
        });
  }

   scrollToBottom(): void {
        try {
            this.contenedorMensajes.nativeElement.scrollTop = this.contenedorMensajes.nativeElement.scrollHeight;
        } catch(err) {
          console.error(err)
        }
    }

  ngAfterViewChecked() {
        this.loggerService.setParametros(this.getParametros());
        if(this.scrollFlag){
          this.scrollToBottom();
          this.scrollFlag = false;
        }
        return;
    }

  getRenderMazmorra():any{
  	return this.renderMazmorra;
  }

  cerrarLogger():any{
    this.mazmorraService.estadoControl.estado = "seleccionAccion";
    this.loggerService.toggleLogger(false);
  }

  getParametros():any{
    this.parametros= this.mazmorraService.parametros;
    return this.parametros;
  }



}
