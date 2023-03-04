
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
    public renderInfoHeroes: any= {};
    public imagenHechHorizontal: any= [0,0,0,0,0,0];
    public imagenHechVertical: any= [0,0,0,0,0,0];

  	constructor(public appService: AppService) { }

  	activarHeroesInfo(val:boolean):void{
  		this.mostrarHeroesInfo=val;
  	}

  	actualizarDatos(){
  		this.perfil= this.appService.getPerfil();
  		this.heroeHech= this.appService.getHechizos();
  		this.enemigos= this.appService.getEnemigos();
  		this.buff= this.appService.getBuff();
  		this.objetos= this.appService.getObjetos();
  		this.animaciones= this.appService.getAnimaciones();
  	}

    

  	setPersonaje(indexPersonaje:number){
      this.actualizarDatos();
  		console.log("Set Personaje: "+this.perfil.heroes[indexPersonaje].nombre);

      //Inicialización de Render Info Heroes

      this.renderInfoHeroes.nombre= this.perfil.heroes[indexPersonaje].nombre;
      this.renderInfoHeroes.clase= this.perfil.heroes[indexPersonaje].clase;

      //Inicialización de equipo: 
      this.renderInfoHeroes.equipo = [];
      for (var i = this.perfil.objetos.length - 1; i >= 0; i--) {
        if(this.perfil.objetos[i].portador_nombre===this.renderInfoHeroes.nombre){
          this.renderInfoHeroes.equipo.push(this.perfil.objetos[i]);
        }
      }

      //Inicialización de Hechizos: 
      this.renderInfoHeroes.hechizos = this.heroeHech[this.renderInfoHeroes.clase.toLowerCase()];
      this.renderImagenHech();

      console.log(this.perfil)
  		console.log(this.heroeHech)
      console.log(this.renderInfoHeroes)
  	}

    renderImagenHech(){

      //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
      var indexHorizontal=0;
      var indexVertical= 0;

        for(var i=0; i< 6; i++){
          indexVertical= Math.floor(this.heroeHech[this.renderInfoHeroes.clase.toLowerCase()][i].imagen_id/18);
          indexHorizontal= this.heroeHech[this.renderInfoHeroes.clase.toLowerCase()][i].imagen_id-indexVertical*18;

          console.log(indexHorizontal+","+indexVertical);
          
          this.imagenHechHorizontal[i]= 0.4+5.84*indexHorizontal;
          this.imagenHechVertical[i]= 19.8*indexVertical;
        }

      return;
    }

}











