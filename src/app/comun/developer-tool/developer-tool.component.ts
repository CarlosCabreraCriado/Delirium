

import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service'

@Component({
  selector: 'app-developer-tool',
  templateUrl: './developer-tool.component.html',
  styleUrls: ['./developer-tool.component.sass']
})

export class DeveloperToolComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarDeveloperTool: boolean = false;
  private mensaje: string = "Mensaje";
  private opacidad:any = 0;

  ngOnInit() {

    //Inicio suscripcion evento progreso Carga
    this.appService.developerTool.subscribe(mensaje => {
      this.mensaje= "Developer Tool";
      this.opacidad= 1;
      this.mostrarDeveloperTool= true; 
      console.log("Mostrando "+this.mensaje);
    });
  }// Final OnInit

  cerrarDeveloperTool():void{
    this.opacidad= 0;
    this.mostrarDeveloperTool= false;
  }

}
