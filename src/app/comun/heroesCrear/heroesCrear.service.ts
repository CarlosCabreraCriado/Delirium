
import { Injectable } from '@angular/core';
import { AppService } from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class HeroesCrearService {

	public mostrarHeroesCrear= false;

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
    private personajes: any;

    //Render HeroesCrear:
    public renderCrearHeroes: any= {};
    public imagenHechHorizontal: any= [0,0,0,0,0,0];
    public imagenHechVertical: any= [0,0,0,0,0,0];

  	constructor(public appService: AppService) { }

  	activarHeroesCrear(val:boolean):void{
  		this.mostrarHeroesCrear=val;
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
      //this.personajes= this.appService.getPersonajes()
  	}

    

  	setPersonaje(indexPersonaje:number){
      this.actualizarDatos();
  		console.log("Set Personaje: "+this.perfil.heroes[indexPersonaje].nombre);

      //Inicialización de Render Crear Heroes

      this.renderCrearHeroes.nombre= this.perfil.heroes[indexPersonaje].nombre;
      this.renderCrearHeroes.clase= this.perfil.heroes[indexPersonaje].clase;

      //Inicialización de Hechizos: 
      this.renderCrearHeroes.hechizos = this.heroeHech[this.renderCrearHeroes.clase.toLowerCase()];
      this.renderImagenHech();

      console.log(this.perfil)
  		console.log(this.heroeHech)
      console.log(this.renderCrearHeroes)
  	}

    renderImagenHech(){

      //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
      var indexHorizontal=0;
      var indexVertical= 0;

        for(var i=0; i< 6; i++){
          indexVertical= Math.floor(this.heroeHech[this.renderCrearHeroes.clase.toLowerCase()][i].imagen_id/18);
          indexHorizontal= this.heroeHech[this.renderCrearHeroes.clase.toLowerCase()][i].imagen_id-indexVertical*18;

          console.log(indexHorizontal+","+indexVertical);
          
          this.imagenHechHorizontal[i]= 0.4+5.84*indexHorizontal;
          this.imagenHechVertical[i]= 19.8*indexVertical;
        }

      return;
    }

}











