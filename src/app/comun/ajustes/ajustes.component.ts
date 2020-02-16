

import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service'

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.sass']
})

export class AjustesComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarAjustes: boolean = false;
  private mensaje: string = "Mensaje";
  private opacidad:any = 0;

  ngOnInit() {

    //Inicio suscripcion evento progreso Carga
    this.appService.ajustes.subscribe(mensaje => {
      this.mensaje= "BUG LOG";
      this.opacidad= 1;
      this.mostrarAjustes= true; 
      console.log("Mostrando "+this.mensaje);
    });
  }// Final OnInit

  cerrarAjustes():void{
    this.opacidad= 0;
    this.mostrarAjustes= false;
  }

}
