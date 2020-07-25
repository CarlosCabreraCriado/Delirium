

import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service'

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.sass']
})
export class MensajesComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarMensaje: boolean = false;
  private mensaje: string = "Mensaje";
  private opacidad:any = 0;

  ngOnInit() {

    //Inicio suscripcion evento progreso Carga
    this.appService.mensaje.subscribe(mensaje => {
      this.mensaje= mensaje;
      this.opacidad= 1;
      this.mostrarMensaje= true; 
      console.log("Mostrando "+this.mensaje);
    });

  }// Final OnInit

  cerrarMensaje():void{
    this.opacidad= 0;
    this.mostrarMensaje= false;
  }

}
