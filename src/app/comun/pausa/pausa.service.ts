
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class PausaService {

  public mostrarPausa:boolean=false;

  	constructor(private appService: AppService) { }

  togglePause():void{
    this.mostrarPausa=!this.mostrarPausa;
    if(this.mostrarPausa){
      console.log("Activando Pause");
    }else{
      console.log("Desactivando Pause");
    }
    return;
  }

  abandonarPartida():void{
    this.appService.abandonarPartida();
    console.log('Abandonando Partida');
    return;
  }
}

