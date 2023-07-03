
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
    private tipoAccion: string = "ataque";
    private renderEnemigos: any;
    private renderHeroes: any;
    private indexEnemigoAccion: number = 0;
    private indexHeroeAccion: number = 0;
    private indexAccion: number = undefined;
    private valorAccion: number = 0;
    //variable de accion enemigos:
    private objetivoDefinido = undefined;
    private ultimaAccion = undefined;
    private primeraAcctivacion = true;
    private energiaAccion = 100;
    private esAdyascente = false;
    private tieneAlcance = false;

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

    activarInterfazAccionesEnemigo(renderEnemigos:any, renderHeroes:any, indexEnemigoActivado:number):void{

        //Acciones:
        console.log("Iniciando Acciones: ");
        console.log(renderEnemigos[indexEnemigoActivado].acciones);

        //Inicializacion:
        this.pantallaInterfaz= "AccionesEnemigo";
        this.renderEnemigos = renderEnemigos;
        this.renderHeroes = renderHeroes;
        this.indexEnemigoAccion = indexEnemigoActivado;
        this.primeraAcctivacion = false;

        //----------------------------------
        // SELECCIÓN DE OBJETIVO
        // ---------------------------------
        
        if(typeof this.objetivoDefinido === "undefined"){
            //Determina Objetivo Segun Agro:
            var indexObjetivo = 0;
            var flagIgual = true;
            for(var i = 1; i < this.renderHeroes.length; i++){
               if(this.renderEnemigos[indexEnemigoActivado].agro[i] >this.renderEnemigos[indexEnemigoActivado].agro[i-1]){
                   flagIgual = false;
                   indexObjetivo = i; 
               //Detecta si son distintos:
               }else if(this.renderEnemigos[indexEnemigoActivado].agro[i] != this.renderEnemigos[indexEnemigoActivado].agro[i-1]){
                   flagIgual = false;
               }
            }

            //Si el agro es igual determina el index del objetivo aleatorio:
            if(flagIgual){
                indexObjetivo = this.getRandomInt(this.renderHeroes.length);
            }
            this.indexHeroeAccion = indexObjetivo;
            this.objetivoDefinido = indexObjetivo;
        }else{

            //Si el objetivo está predefinido:
            this.indexHeroeAccion = this.objetivoDefinido

        }

        //----------------------------------
        // SELECCIÓN DE ACCIÓN
        // ---------------------------------
        var indexAccion = 0;
        var flagCumple = true;
        var iteracion = 0;
        do{
            //Asigna accion aleatoria:
            indexAccion= this.getRandomInt(this.renderEnemigos[indexEnemigoActivado].acciones.length)
            flagCumple=true;

            //Si MOVIO no volverá a MOVER:
            if(this.ultimaAccion == "mover" && 
               this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo =="movimiento"){
                flagCumple=false;
            }
            //Si ES ADYASCENTE no volverá a MOVER:
            if(this.esAdyascente == true && 
               this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo =="movimiento"){
                flagCumple=false;
            }
            //Si no tuvo RANGO no volverá a ATACAR:
            if(this.ultimaAccion == "sinRango" && 
               this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo =="ataque"){
                flagCumple=false;
            }

            iteracion++;
        //Repite la asignación si no se ha cumplido alguna condicion
        }while(!flagCumple && iteracion < 100);
        this.indexAccion = indexAccion;

        if(iteracion >= 100){
            console.warn("SALIDA POR ITERACIÓN")
            this.finalizarActivacion();
            return;
        }

        //----------------------------------
        // CHECK DE ENERGIA
        // ---------------------------------
        if(this.energiaAccion -  this.renderEnemigos[this.indexEnemigoAccion].acciones[this.indexAccion].energia < 0){
            this.finalizarActivacion();
            return;
        }
        
        //----------------------------------
        // EJECUCION DE ACCIÓN
        // ---------------------------------
        this.tipoAccion = this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo;
        switch(this.tipoAccion){
            case "movimiento":
                this.valorAccion = this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].movimiento;
            break;
            case "ataque":
                var indexHechizo= this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].hechizo_id;
                this.tieneAlcance = true; 
                this.valorAccion = this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].alcance;
            break;
        }

        this.mostrarInterfaz = true;

        return;
    }


    accion(tipoAccion:string){

        console.log("Ejecutando Accion:")
        console.log(tipoAccion)

        var accion = {
            indexEnemigo: this.indexEnemigoAccion,
            indexHeroe: this.indexHeroeAccion,
            hechizo_id: 1
        }

        this.ultimaAccion = tipoAccion;
        switch(tipoAccion){
            case "mover":
                this.energiaAccion -= this.renderEnemigos[this.indexEnemigoAccion].acciones[this.indexAccion].energia;
                this.desactivarInterfaz();
                this.activarInterfazAccionesEnemigo(this.renderEnemigos, this.renderHeroes, this.indexEnemigoAccion);
                console.log("ENERGIA: ",this.energiaAccion)
                break;
            case "adyascente":
                this.esAdyascente = true
            case "sinRango":
                this.desactivarInterfaz();
                this.activarInterfazAccionesEnemigo(this.renderEnemigos, this.renderHeroes, this.indexEnemigoAccion);
                break;
            case "atacar":
                this.desactivarInterfaz();
                this.energiaAccion -= this.renderEnemigos[this.indexEnemigoAccion].acciones[this.indexAccion].energia;
                console.log("ENERGIA: ",this.energiaAccion)
                this.observarInterfaz.next({comando: "lanzarHechizoEnemigo",valor: accion});
                break;
        }
    }

    finalizarActivacion(){
        this.energiaAccion = 100;
        this.primeraAcctivacion = true;
        this.esAdyascente = false;
        this.tieneAlcance = false;
        this.desactivarInterfaz();
    }

    getRandomInt(max) {
          return Math.floor(Math.random() * max);
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

    cancelar(){
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

