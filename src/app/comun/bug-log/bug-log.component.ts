

import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service'

@Component({
  selector: 'app-bug-log',
  templateUrl: './bug-log.component.html',
  styleUrls: ['./bug-log.component.sass']
})

export class BugLogComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarMensaje: boolean = false;
  private mensaje: string = "Mensaje";
  private opacidad:any = 0;

  ngOnInit() {

    //Inicio suscripcion evento progreso Carga
    this.appService.bugLog.subscribe(mensaje => {
      this.mensaje= "BUG LOG";
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
