
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class CrearHeroeService {

  public mostrarCrearHeroe:boolean=false;

  	constructor(private appService: AppService) { }

  toggleDialogo():void{
    this.mostrarCrearHeroe=!this.mostrarCrearHeroe;
    if(this.mostrarCrearHeroe){
      console.log("Mostrando Configuración");
    }else{
      console.log("Cerrando Configuración");
    }
    return;
  }

}

