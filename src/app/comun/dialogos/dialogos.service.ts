
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class DialogoService {

  public mostrarDialogo:boolean=false;

  	constructor(private appService: AppService) { }

  toggleDialogo():void{
    this.mostrarDialogo=!this.mostrarDialogo;
    if(this.mostrarDialogo){
      console.log("Activando Dialogo");
    }else{
      console.log("Desactivando Dialogo");
    }
    return;
  }

}

