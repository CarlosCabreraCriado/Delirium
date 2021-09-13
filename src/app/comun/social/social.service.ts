
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class SocialService {

  public mostrarSocial:boolean=false;

  	constructor(private appService: AppService) { }

  toggleDialogo():void{
    this.mostrarSocial=!this.mostrarSocial;
    if(this.mostrarSocial){
      console.log("Mostrando Panel Social");
    }else{
      console.log("Cerrando Panel social");
    }
    return;
  }

}

