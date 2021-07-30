
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class ConfiguracionService {

  public mostrarConfiguracion:boolean=false;

  	constructor(private appService: AppService) { }

  toggleDialogo():void{
    this.mostrarConfiguracion=!this.mostrarConfiguracion;
    if(this.mostrarConfiguracion){
      console.log("Mostrando Configuración");
    }else{
      console.log("Cerrando Configuración");
    }
    return;
  }

}

