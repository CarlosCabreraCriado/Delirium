

import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service'
import { DeveloperCombateService } from '../developer-combate/developerCombate.service';

@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.sass']
})
export class CargaComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarPantallaCarga: boolean = false;
  private subtituloCarga: string = "Cargando";
  private progreso:string = "0%";
  private opacidad:any = 0;

  ngOnInit() {
    //Inicio suscripción mostrar carga
    this.appService.mostrarCarga.subscribe(mostrar => {
      if(mostrar){this.opacidad=1; this.mostrarPantallaCarga=true;}else{this.opacidad=0; this.mostrarPantallaCarga=false;}
    });
    //Inicio suscripcion evento progreso Carga
    this.appService.progresoCarga.subscribe(progreso => {
      this.progreso= progreso;
    });
  }// Final OnInit

}
