
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InterfazService {

    //GENERAL:
    public mostrarInterfaz: boolean= false;
    private pantallaInterfaz: string= "Hechizos";
    private bloquearInterfaz: boolean= true;
    public esTurno: boolean = false;

    //Detalle:
    public tipoDetalle: "heroe"|"enemigo";
    public renderDetalle: any;

    //HEROE ABATIDO:
    public indexHeroeAbatido: number;

    //ESTADISTICAS:
    public estadisticas: any;
    public jugadores: any;

    //HECHIZOS:
    private hechizos:any;
    private buff:any;
    public renderHeroeHechizo: any;
    private hechizosEquipadosImagenID = [0,0,0,0,0];
    private hechizosEquipadosID = [0,0,0,0,0];
    public indexHechizoSeleccionado = null;
    public idHechizoSeleccionado = null;
    public imagenHechHorizontal= [0,0,0,0,0];
    public imagenHechVertical= [0,0,0,0,0];
    public hechizosEquipadosEnergia = [0,0,0,0,0];
    public hechizosEquipadosCooldown = [0,0,0,0,0];
    public energiaHechizo: number = 0;
    public hechizoEquipados: any = null;
    public objetivoSeleccionado: boolean = false;
    public mostrarDetalleHechizo: boolean = false;

    //MOVIMIENTO:
    private costePorMovimiento: number = 5;
    private puntosMovimiento: number = 3;
    private energiaMovimiento: number = 15;
    private energiaDisponible: number = 0;

    //RNG
    private valorTirada:any = 0;
    public critico:boolean = false;
    private noCritico:boolean = false;
    public probabilidadCritico: number = 0;
    public probabilidadCriticoPercent: number = 0;

    //MAZMORRA:
    private enemigos: any;
    private renderMazmorra: any;

    //ACCIONES ENEMIGO:
    private tipoAccion: string = "ataque";
    private renderEnemigos: any;
    private renderHeroes: any;
    private indexEnemigoAccion: number = 0;
    public indexHeroeAccion: number = 0;
    private indexAccion: number = undefined;
    private valorAccion: number = 0;
    //variable de accion enemigos:
    private objetivoDefinido = undefined;
    private ultimaAccion = undefined;
    private primeraAcctivacion = true;
    private energiaAccion = 100;
    private esAdyacente = false;
    private tieneAlcance = false;
    public  hechizoEnemigoImagenId:number = 0;
    private indexHechizoAccion: number = 0;

    // Observable string sources
    private observarInterfaz = new Subject<any>();

    // Observable string streams
    observarInterfaz$ = this.observarInterfaz.asObservable();

    constructor() { }

    setPantallaInterfaz(val):void{
        this.pantallaInterfaz= val;
        this.mostrarInterfaz = true;
      return;
    }

    setHechizos(val){
      this.hechizos= val;
      return;
    }

    setBuffs(val){
      this.buff= val;
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

    setTurno(val: boolean){
      this.esTurno = val;
      return;
    }

    getPantallaInterfaz():any{
      return this.pantallaInterfaz;
    }

    activarInterfazAccionesEnemigo(renderEnemigos:any, renderHeroes:any, indexEnemigoActivado:number):void{

        //Acciones:
        console.log("Iniciando Acciones: ");
        console.log(renderEnemigos[indexEnemigoActivado]);

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
            var arrayAgro = Object.assign({},this.renderEnemigos[indexEnemigoActivado].agro);
            var arrayPuestos = Array(this.renderHeroes.length);

            var puesto = 0;
            for(var i = 0; i < this.renderHeroes.length; i++){
                puesto = 0;
                for(var j = 0; j < this.renderHeroes.length; j++){
                    if(arrayAgro[i] < arrayAgro[j]){
                        puesto++;
                    }
                }
                arrayPuestos[i]=puesto;
            }

            //Seleccion Candidatos:
            var candidatoValido = null;
            var arrayCandidatos = [];
            var indexAleatorio = 0;
            var candidatoEmpatado = false;
            for(var i = 0; i < this.renderHeroes.length; i++){
                //Determina candidatos de puesto i:
                arrayCandidatos = []
                candidatoEmpatado = false;
                for(var j = 0; j < this.renderHeroes.length; j++){
                   if(arrayPuestos[j]==i){
                       arrayCandidatos.push(j);
                   }
                }


                //Itera entrando aleatoriamente por los candidatos:
                if(arrayCandidatos.length < 1){candidatoEmpatado=true}
                for(var j = 0; j < arrayCandidatos.length; j++){
                    indexAleatorio = this.getRandomInt(arrayCandidatos.length);
                    if(this.checkObjetivoAgroValido(arrayCandidatos[indexAleatorio])){
                        candidatoValido=arrayCandidatos[indexAleatorio];
                        break;
                    }else{
                        arrayCandidatos.splice(indexAleatorio,1);
                        j--;
                    }
                }

                //Verifica si se ha encontrado un valido:
                if(candidatoValido != null){
                    if(candidatoEmpatado){
                        this.renderEnemigos[indexEnemigoActivado].agro[this.indexHeroeAccion]=this.renderEnemigos[indexEnemigoActivado].agro[this.indexHeroeAccion]+0.1;
                    }
                    break;
                }

            }//fin for i

            //Verifica que haya objetivos posibles:
            if(candidatoValido==null){
                console.warn("NO HAY OBJETIVOS POSIBLES")
                this.finalizarActivacion();
            }

            this.indexHeroeAccion = candidatoValido;
            this.objetivoDefinido = candidatoValido;
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
        var primeraAccion = 0;

        do{
            //Asigna accion aleatoria:
            indexAccion= this.getRandomInt(this.renderEnemigos[indexEnemigoActivado].acciones.length)
            flagCumple=true;

            //CONDICIÓN DE PRIMERA ACCION (LA PRIMERA ACCION ES SIEMPRE UN ATAQUE):
            if(this.ultimaAccion == undefined &&
               this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo !="ataque"){
                flagCumple=false;
            }

            //Si MOVIO no volverá a MOVER:
            if(this.ultimaAccion == "mover" &&
               this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].tipo =="movimiento"){
                flagCumple=false;
            }
            //Si ES ADYACENTE no volverá a MOVER:
            if(this.esAdyacente == true &&
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
                this.indexHechizoAccion = this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].hechizo_id;
                this.hechizoEnemigoImagenId= this.renderEnemigos[indexEnemigoActivado].acciones[indexAccion].hechizo_imagen_id;
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
            hechizo_id: this.indexHechizoAccion
        }

        this.ultimaAccion = tipoAccion;
        switch(tipoAccion){
            case "mover":
                this.energiaAccion -= this.renderEnemigos[this.indexEnemigoAccion].acciones[this.indexAccion].energia;
                this.desactivarInterfaz();
                this.activarInterfazAccionesEnemigo(this.renderEnemigos, this.renderHeroes, this.indexEnemigoAccion);
                console.log("ENERGIA: ",this.energiaAccion)
                break;
            case "adyacente":
                this.esAdyacente = true
            case "sinRango":
                this.desactivarInterfaz();
                this.activarInterfazAccionesEnemigo(this.renderEnemigos, this.renderHeroes, this.indexEnemigoAccion);
                break;
            case "atacar":
                this.energiaAccion -= this.renderEnemigos[this.indexEnemigoAccion].acciones[this.indexAccion].energia;
                console.log("ENERGIA: ",this.energiaAccion)
                this.desactivarInterfaz();
                this.observarInterfaz.next({comando: "lanzarHechizoEnemigo",valor: accion});
                break;
        }
    }

    finalizarActivacion(evitarPasoTurno?: boolean){
        this.objetivoDefinido = undefined;
        this.ultimaAccion = undefined;
        this.energiaAccion = 100;
        this.primeraAcctivacion = true;
        this.esAdyacente = false;
        this.tieneAlcance = false;
        this.desactivarInterfaz();
        if(!evitarPasoTurno){
          this.observarInterfaz.next({comando: "finalizarActivacionEnemigo",valor: ""});
        }
    }

    getRandomInt(max) {
          return Math.floor(Math.random() * max);
    }

    checkObjetivoAgroValido(indexHeroe:number){
        if(this.renderHeroes[indexHeroe].vida==0){
            return false;
        }
        return true;
    }

    activarInterfazHechizos(hechizosEquipadosID:any, hechizosEquipadosImagenID, hechizosEquipadosEnergia, energiaDisponible, hechizoEquipados, hechizosEquipadosCooldown,renderHeroe:any):void{
        this.hechizoEquipados = hechizoEquipados;
        this.energiaDisponible = energiaDisponible;
        this.renderHeroeHechizo = renderHeroe;
        this.hechizosEquipadosImagenID = hechizosEquipadosImagenID;
        this.hechizosEquipadosID = hechizosEquipadosID;
        this.hechizosEquipadosEnergia = hechizosEquipadosEnergia;
        this.hechizosEquipadosCooldown = hechizosEquipadosCooldown;
        this.pantallaInterfaz= "Hechizos";
        this.mostrarInterfaz = true;
        console.warn("REnder: ",this.renderHeroeHechizo)
        return;
    }


    activarInterfazMovimiento(costeMovimiento:number,energiaDisponible:number):void{
        this.costePorMovimiento = costeMovimiento;
        this.energiaDisponible = energiaDisponible;
        this.pantallaInterfaz= "movimiento";
        this.mostrarInterfaz = true;
        return;
    }

    activarInterfazRNG(probabilidadCritico):void{
        this.probabilidadCritico = probabilidadCritico;
        this.probabilidadCriticoPercent = Math.round(this.probabilidadCritico*100);
        console.warn("PROBABILIDAD: ",probabilidadCritico)
        this.pantallaInterfaz= "fortuna";
        this.mostrarInterfaz = true;
        return;
    }

    activarInterfazDetalle(tipo: "enemigo"|"heroe",renderDetalle:any):void{
        console.warn("RENDER DETALLE: ",renderDetalle);
        this.tipoDetalle = tipo;
        this.renderDetalle = Object.assign({},renderDetalle);
        this.renderDetalle.estadisticas.probabilidadCriticoPercent = Math.round(this.renderDetalle.estadisticas.probabilidadCritico*100);
        this.pantallaInterfaz= "detalle";
        this.mostrarInterfaz = true;
        return;
    }

    finalizarFortuna(resultadoFortuna:string):void{

      if(resultadoFortuna=="normal"){
        this.iniciarCritico(false);
        this.mostrarInterfaz = true;
      }

      if(resultadoFortuna=="fallo"){
        this.observarInterfaz.next({comando: "fallarHechizo",valor: {energia: this.energiaHechizo}});
        this.desactivarInterfaz();
      }

      if(resultadoFortuna=="fortuna"){
        this.iniciarCritico(true);
        this.mostrarInterfaz = true;
      }

        return;
    }

    iniciarCritico(fortuna?):void{
        this.pantallaInterfaz= "critico";
            if(Math.random() < this.probabilidadCritico){
                this.critico = true;
                this.noCritico = false;
            }else{
                this.noCritico = true;
                this.critico = false;
            }
            setTimeout(()=> {
                this.observarInterfaz.next({comando: "lanzarHechizo",valor: { critico: this.critico, fortuna: fortuna}});
                this.critico= false;
                this.noCritico= false;
                this.desactivarInterfaz();
            },4000)
    }

    desactivarInterfaz():void{
      this.mostrarInterfaz = false;
      return;
    }

    cancelarHechizo(){
       this.setObjetivoSeleccionado(false)
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
       return;
    }

    realizarMovimiento(){
       this.observarInterfaz.next({comando: "realizarMovimiento",valor: this.energiaMovimiento});
       this.desactivarInterfaz();
       return;
    }

    cancelarMovimiento(){
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
       return;
    }

    cancelar(){
       this.indexHechizoSeleccionado = null;
       this.idHechizoSeleccionado = null;
       this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
       this.desactivarInterfaz();
       return;
    }

    setInterfaz(interfaz):void{
      this.pantallaInterfaz = interfaz;
      return;
    }

    selectHechizo(indexHechizo:number){
        this.indexHechizoSeleccionado = indexHechizo;
        this.idHechizoSeleccionado = this.hechizosEquipadosID[this.indexHechizoSeleccionado];
        this.energiaHechizo = this.hechizosEquipadosEnergia[indexHechizo];
    }

    seleccionarHechizo(numHechizo):void{
        this.indexHechizoSeleccionado = numHechizo;
        this.idHechizoSeleccionado = this.hechizosEquipadosID[this.indexHechizoSeleccionado];
        this.observarInterfaz.next({comando: "seleccionarHechizo",valor: this.hechizosEquipadosID[this.indexHechizoSeleccionado]});
        return;
    }

    setObjetivoSeleccionado(val: boolean){
        this.objetivoSeleccionado= val;
    }

    lanzarHechizo():void{
        this.setObjetivoSeleccionado(false)
        this.observarInterfaz.next({comando: "checkFortuna",valor: ""});
        //this.desactivarInterfaz();
        return;
    }

    detalleHechizo(indexHechizo):void{
        this.selectHechizo(indexHechizo);
        this.mostrarDetalleHechizo= true;
        return;
    }

    setBloquearInterfaz(val:boolean){
        this.bloquearInterfaz = val;
    }

    modificarMovimiento(cantidad){
        this.puntosMovimiento += cantidad;
        this.energiaMovimiento = this.puntosMovimiento * this.costePorMovimiento;
        if(this.puntosMovimiento <= 0){
            this.puntosMovimiento = 0;
            this.energiaMovimiento = 0;
        }
    }

    activarHeroeAbatido(indexHeroeAbatido){
        this.indexHeroeAbatido = indexHeroeAbatido;
        this.pantallaInterfaz= "Abatido";
        this.mostrarInterfaz = true;
        return;
    }

    activarEstadisticas(estadisticas,jugadores){
        this.estadisticas = estadisticas;
        this.jugadores = jugadores;
        this.pantallaInterfaz= "Estadisticas";
        this.mostrarInterfaz = true;
        return;
    }

    finalizarEstadisticas():void{
        this.desactivarInterfaz();
        return;
    }

    finalizarAbatido(reanimar:boolean):void{

      if(reanimar){
        this.observarInterfaz.next({comando: "reanimar",valor: {heroeIndex: this.indexHeroeAbatido}});
        this.desactivarInterfaz();
      }else{
        this.desactivarInterfaz();
      }

      return;
    }

}

