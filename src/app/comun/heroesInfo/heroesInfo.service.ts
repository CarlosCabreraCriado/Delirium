
import { Injectable } from '@angular/core';
import { AppService } from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class HeroesInfoService {

	public mostrarHeroesInfo= false;

	//Variables de datos:
    public perfil:any;

    //Definicion estadisticas generales:
    private heroeHech: any;
    private heroeStat: any;
    private enemigos: any;
    private buff: any;
    private objetos: any;
    private animaciones: any;
    private parametros: any;

    //Render HeroesInfo:
    public renderInfoHeroes: any;

  	constructor(public appService: AppService) { }

  	activarHeroesInfo(val:boolean):void{
  		this.mostrarHeroesInfo=val;
  	}

  	actualizarDatos(){
  		this.perfil= this.appService.getPerfil();
  		this.heroeHech= this.appService.getHeroesHech();
  		this.heroeStat= this.appService.getHeroesStats();
  		this.enemigos= this.appService.getEnemigos();
  		this.buff= this.appService.getBuff();
  		this.objetos= this.appService.getObjetos();
  		this.animaciones= this.appService.getAnimaciones();
  		this.parametros= this.appService.getParametros();
  	}

  	setPersonaje(nombrePersonaje:string){
  		console.log("Set Personaje: "+nombrePersonaje);
  		
  	}

}
