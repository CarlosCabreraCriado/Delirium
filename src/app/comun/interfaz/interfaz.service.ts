
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InterfazService {

	//GENERAL:
	public mostrarInterfaz: boolean= false;
	private pantallaInterfaz: string= "Hechizos";

	//HECHIZOS:
	private hechizos:any;
	private hechizosEquipadosImagenID = [0,0,0,0,0];
	private hechizosEquipadosID = [0,0,0,0,0];
	private indexHechizoSeleccionado = 0;
	public imagenHechHorizontal= [0,0,0,0,0];
	public imagenHechVertical= [0,0,0,0,0];

	//MOVIMIENTO:
	private costeMovimiento: number = 0;

	//RNG
	private valorTirada:any = 0;

	//MAZMORRA:
	private enemigos: any;
	private renderMazmorra: any;

    //ACCIONES ENEMIGO:
    private renderEnemigos: any;
    private renderHeroes: any;

	// Observable string sources
	private observarInterfaz = new Subject<any>();

	// Observable string streams
	observarInterfaz$ = this.observarInterfaz.asObservable();

	constructor() { }

    setPantallaInterfaz(val):void{
      this.pantallaInterfaz= val;
      return;
    }

    setHeroesHech(val){
      this.hechizos= val;
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

    activarInterfazAccionesEnemigo(renderEnemigos:any, renderHeroes:any):void{
	  this.pantallaInterfaz= "AccionesEnemigo";
      this.mostrarInterfaz = true;
	  return;
    }

    activarInterfazHechizos(hechizosEquipadosID:any, hechizosEquipadosImagenID):void{
	  this.pantallaInterfaz= "Hechizos";
      this.mostrarInterfaz = true;
	  this.hechizosEquipadosImagenID = hechizosEquipadosImagenID;
	  this.hechizosEquipadosID = hechizosEquipadosID;
	  return;
    }

    activarInterfazMovimiento(costeMovimiento:number):void{
		this.pantallaInterfaz= "movimiento";
		this.mostrarInterfaz = true;
		return;
    }

    desactivarInterfaz():void{
      this.mostrarInterfaz = false;
      this.pantallaInterfaz="Hechizos";
	  return;
    }

    cancelarHechizo(){
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
	   return;
    }
    
    cancelarMovimiento(){
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
	   return;
    }

    setInterfaz(interfaz):void{
      this.pantallaInterfaz = interfaz;
      return;
    }

    seleccionarHechizo(numHechizo):void{
		this.indexHechizoSeleccionado = numHechizo-1;
		this.observarInterfaz.next({comando: "seleccionarHechizo",valor: this.hechizosEquipadosID[this.indexHechizoSeleccionado]});
		return;
    }

    lanzarHechizo():void{
      this.observarInterfaz.next({comando: "lanzarHechizo",valor: ""});
      this.desactivarInterfaz();
      return;
    }

}

