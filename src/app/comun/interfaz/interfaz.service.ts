
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InterfazService {

	private valorTirada:any = 0;
	public mostrarInterfaz: boolean= false;
	private pantallaInterfaz: string= "Hechizos";
	public idImagenHechizo= [1,1,2,3,4];
	public imagenHechHorizontal= [0,0,0,0,0];
	public imagenHechVertical= [0,0,0,0,0];

  private heroesHech:any;
  private enemigos: any;
  private renderMazmorra: any;

  // Observable string sources
  private observarInterfaz = new Subject<any>();

  // Observable string streams
  observarInterfaz$ = this.observarInterfaz.asObservable();

  constructor() { }

	//FUNCIÓN RENDER DE SPRITE:
	/*
    renderImagenHech(){

      //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
      var caster;
      var esHeroe = false;
      var esEnemigo = false;
      var indexHorizontal=0;
      var indexVertical= 0;

      for(var i=0; i<this.renderMazmorra.heroes.length; i++){
        if(this.renderMazmorra.heroes[i].turno){
          esHeroe= true;
          caster= this.renderMazmorra.heroes[i];
          break;
         }
      }

      for(var i=0; i<this.renderMazmorra.enemigos.length; i++){
        if(this.renderMazmorra.enemigos[i].turno){
          esEnemigo= true;
          caster= this.renderMazmorra.enemigos[i];
          break;
        }
      }

      if(esHeroe){

        for(var i=0; i< 5; i++){
          indexVertical= Math.floor(this.heroesHech[caster.clase.toLowerCase()][i+1].imagen_id/18);
          indexHorizontal= this.heroesHech[caster.clase.toLowerCase()][i+1].imagen_id-indexVertical*18;

          console.log(indexHorizontal+","+indexVertical);
          
          this.imagenHechHorizontal[i]= 0.4+5.84*indexHorizontal;
          this.imagenHechVertical[i]= 19.8*indexVertical;
        }

      }else{
        //RENDER PARA ENEMIGOS:
      }
      return;
    }
	*/

    renderImagenHech(){

	}

    setPantallaInterfaz(val):void{
      this.pantallaInterfaz= val;
      return;
    }

    setHeroesHech(val){
      this.heroesHech= val;
      return;
    }

    setEnemigos(val){
      this.enemigos= val;
      return;
    }

    setRender(val){
      this.renderMazmorra= val;
      return;
    }

    getPantallaInterfaz():any{
      return this.pantallaInterfaz;
    }

    activarInterfaz(hechizosSeleccionados:any):void{
      this.mostrarInterfaz = true;
	  this.idImagenHechizo = hechizosSeleccionados;
	  console.log("Hechizos: ")
	  console.log(this.idImagenHechizo)
      this.renderImagenHech();
    }

    desactivarInterfaz():void{
      this.mostrarInterfaz = false;
      this.pantallaInterfaz="Hechizos";
    }

    cancelarHechizo(){
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
    }

    setInterfaz(interfaz):void{
      this.pantallaInterfaz = interfaz;
      return;
    }

    seleccionarHechizo(numHechizo):void{
      this.observarInterfaz.next({comando: "selecionarHechizo",valor: numHechizo});
      return;
    }

    lanzarHechizo():void{
      this.observarInterfaz.next({comando: "lanzarHechizo",valor: ""});
      this.desactivarInterfaz();
      return;
    }
}

