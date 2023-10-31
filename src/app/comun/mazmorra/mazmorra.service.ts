import { Injectable, OnChanges, SimpleChanges, Output, EventEmitter, NgZone } from '@angular/core';
import { AppService } from '../../app.service';
import { LogicService } from '../../logic.service';
import { LoggerService } from '../logger/logger.service';
import { PausaService } from '../pausa/pausa.service';
import { EventosService } from '../../eventos.service';
import { RngService } from '../rng/rng.service';
import { InterfazService } from '../interfaz/interfaz.service';
import { Subject } from 'rxjs';
import * as cloneDeep from 'lodash/cloneDeep';
//import { cloneDeep } from 'lodash/cloneDeep';
import { SocketService } from '../socket/socket.service';
import { Subscription } from "rxjs";

//import { ElectronService } from 'ngx-electron';
import { RenderMazmorra} from './render.class';
 
interface EstadoControl {
      estado: string,
      esTurnoPropio: boolean,
      esTurnoHeroe: boolean,
      esTurnoEnemigo: boolean,
      turnoIndex: number;
      heroePropioIndex: number;
      hechizoId: number,
      tipoObjetivo: string,
      critico: boolean,
      fortuna: boolean,
      fallo: boolean,
      pifia: boolean,
      rngEncadenado: boolean,
      detenerHechizo: boolean,
      objetivosEnemigos: number[],
      objetivosHeroes: number[]
}

interface ConfiguracionHechizo {
      esEnemigo: boolean,
      esHeroe: boolean,
      tipoCaster: "heroes" | "enemigos",
      caster: any,
      indexCaster: number,
      indexHechizo: number,
      nivelCaster: number,
      critico: boolean,
      fortuna: boolean,
      fallo: boolean,
      pifia: boolean,
      objetivosEnemigos: number[],
      objetivosHeroes: number[]
}

@Injectable({
  providedIn: 'root'
})

export class MazmorraService {

  //Variables generales:
  public cuenta: any;
  public perfil: any;
  public sesion: any;
  private hash: number;
  private hashRecibido: number;
  private flagCheckHash: boolean;

  public estadoControl: EstadoControl;

  public sala: any = {};
  public dispositivo= "";
  public partidaIniciada= false;

  //Variables Temporizador:
  public habilitarTemporizador: boolean = true;
  public temporizador: any = false;
  public tiempoMaxTurno: number = 15;
  public tiempoActual: number = 0;

  //Definicion estadisticas generales:
  public clases: any;
  public hechizos: any;
  public enemigos: any;
  public buff: any;
  public objetos: any;
  public animaciones: any;
  public parametros: any;

  public heroeStat: any; //Pendiente Decomision

  //Definicion mazmorra actual:
  public mazmorra: any;
  public guardado: any;
  public mostrarMazmorra: boolean = false;

  //Definicion de autoguardados:
  public autoGuardado = {} as RenderMazmorra;
  public autoGuardado2 = {} as RenderMazmorra;

  //Declaración de estado de render:
  private renderMazmorra = {} as RenderMazmorra;
  public personaje:any //Pendiente Decomision.

  //Parametros de clonfiguracion:
  private velocidadBuff: number = 2500;
  private velocidadHechizo: number = 2500;

  //Musica ambiental:
  public musicaMazmorra = new Audio();

  //Variables internas:
  private turnoModificado: boolean = false;
  private cuentaAplicacionHechizo: number= 0;
  private cuentaLanzamientoHechizo: number= 0;
  private mostrarLogger: boolean= true;
  private mostrarPausa: boolean= false;
  private mostrarRNG: boolean= true;
  public cargaCompleta: boolean = false;
  public sincronizar:boolean= true;
  public emisor:boolean= false;
  public comandoSocketActivo:boolean= false;
  public esHeroe: boolean= false;
  public esEnemigo: boolean= false;
  public seleccionarHeroes: boolean= false;
  public seleccionarEnemigos: boolean= false;

  public activarInterfaz: boolean = true;

  //OPCIONESE DE DEBUG:
  private restringirAcciones = false;
  private restringirRecurso = true;
  private restringirRNG = false;
  private restringirTurno = false;
  private forzarGeneradoRender = true;
  public permitirMultiControl = false;

  //Variables Isometrico:
  public estiloIsometrico: any = {};

  musicaMazmorraPlay(): void{
      this.musicaMazmorra.src = "./assets/musica/musica-mazmorra.mp3";
      this.musicaMazmorra.load();
      this.musicaMazmorra.volume= 0;
      //this.musicaMazmorra.play();
  }

  //Emision de eventos
  @Output() cargarAutoGuardado: EventEmitter<any> = new EventEmitter();

  //Emision de eventos
  @Output() mostrarAnimacionNumero: EventEmitter<any> = new EventEmitter();

  //Emision de eventos
  @Output() subscripcionMazmorra: EventEmitter<string> = new EventEmitter();

    constructor(private logicService: LogicService, private zone: NgZone, private appService: AppService/*, private electronService: ElectronService*/, private loggerService: LoggerService, private pausaService: PausaService,private rngService: RngService, private interfazService: InterfazService,private eventosService: EventosService, private socketService:SocketService) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
  }

  /*  ----------------------------------------------
      ROUTER DE MAZMORRA
  ---------------------------------------------- */
  routerMazmorra(tecla:string):void{

    //Devolver a index si la pagina se ha recargado:
    /*if(this.appService.control=="null"){
          this.appService.setControl("index");
          this.appService.cambiarUrl("/index");
          return;
        }*/

    if(this.appService.control=="null"){this.appService.setControl("mazmorra");}
    if(this.appService.control!="mazmorra"){return;}

    console.log("ESTADO: "+this.estadoControl.estado);

    //Router del Logger:
    if(this.estadoControl.estado=="logger"){
      if(tecla=="Enter"){
        this.loggerService.procesarComando(this.sesion.render,this.sesion, this.estadoControl);
        this.forceRender()
      }else{
        this.loggerService.addComando(tecla);
      }
      if(tecla=="Tab"){
        this.estadoControl.estado="seleccionAccion";
        this.loggerService.toggleLogger(false);
        this.forceRender()
      }
      return;
    }

    switch(tecla){

      /* ----------------------------------------------
            ROUTER SIN RESTRICCION
      ------------------------------------------------- */
      case "Tab":
      if(this.estadoControl.estado=="seleccionAccion"){
        this.estadoControl.estado="logger";
        this.loggerService.toggleLogger(true);
        this.forceRender()
        return;
      }
      break;

      case "ArrowUp":
        if (this.musicaMazmorra.volume <1) {
          this.musicaMazmorra.volume= this.musicaMazmorra.volume+0.1;
        }else{
          this.musicaMazmorra.volume= 1;
        }
      break;

      case "ArrowDown":
        if (this.musicaMazmorra.volume>0) {
          this.musicaMazmorra.volume= this.musicaMazmorra.volume-0.1;
        }else{
          this.musicaMazmorra.volume= 0;
        }
      break;

      /* *************************************************
          ROUTER CON RESTRICCION DE TURNO
      ************************************************* */
      case "ArrowRight":
        if(this.estadoControl.estado=="seleccionObjetivo" || this.estadoControl.estado=="hechizoEncadenado"){
        }
      break;

      case "ArrowLeft":
        if(this.estadoControl.estado=="seleccionObjetivo" || this.estadoControl.estado=="hechizoEncadenado"){
        }
      break;

      case "Enter":
      if(this.estadoControl.estado=="seleccionObjetivo" || this.estadoControl.estado=="hechizoEncadenado"){
        //this.lanzarHechizo();
        this.activarRNG();
        return;
      }
      break;

      case "p":
        this.pasarTurno();
      break;

      /* *************************************************
          ROUTER CON RESTRICCION DE HOST
      ************************************************* */
      case "f":
      console.log("Forzando Sincronización")
      this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
      this.mensajeAccion("Sincronizando...",2000);
      break;

      case "m":
      this.sesion.render = cloneDeep(this.autoGuardado);
      this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarRewind", contenido: this.sesion.render});
      this.cargarAutoGuardado.emit(this.sesion.render);
      this.mensajeAccion("Realizando rewind...",5000);
      break;

      case "n":
      this.sesion.render = cloneDeep(this.autoGuardado2);
      this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarRewind", contenido: this.sesion.render});
      this.cargarAutoGuardado.emit(this.sesion.render);
      this.mensajeAccion("Realizando rewind...",5000);
      break;
    }

    if(this.sesion.render.turno){}

  }

  /*  ----------------------------------------------
      INICIALIZACIÓN DE MAZMORRA
  ----------------------------------------------*/
    async iniciarMazmorra(){

        //CARGA DE DATOS:
    console.log("-------------------------");
    console.log("CARGANDO DATOS DE PARTIDA");
    console.log("-------------------------");

        this.clases= await this.appService.getClases();
        this.objetos= await this.appService.getObjetos();
        this.hechizos= await this.appService.getHechizos();
        this.buff= await this.appService.getBuff();
        this.animaciones= await this.appService.getAnimaciones();
        this.enemigos= await this.appService.getEnemigos();
        this.parametros= await this.appService.getParametros();

        //this.sesion= await this.appService.getSesion();
        this.cuenta= await this.appService.getCuenta();
        this.perfil= await this.appService.getPerfil();
        this.mazmorra= await this.appService.getMazmorra();

        console.log("Mazmorra:")
        console.log(this.mazmorra)

        //COMPROBANDO CARGA DE MAZMORRA:
        if((!this.mazmorra?.nombreId) || (this.sesion.render.mazmorra.nombreIdMazmorra != this.mazmorra.nombreId)){
            this.mazmorra = await this.appService.peticionCargarMazmorra(this.sesion.render.mazmorra.nombreIdMazmorra);
        }

        console.log("Clases:")
        this.clases = this.clases.clases;
        console.log(this.clases);
        console.log("Objetos:")
        console.log(this.objetos);
        console.log("Hechizos:")
        this.hechizos = this.hechizos.hechizos;
        console.log(this.hechizos);
        console.log("Buff:")
        this.buff = this.buff.buff;
        console.log(this.buff);
        console.log("Animaciones:")
        this.animaciones = this.animaciones.animaciones;
        console.log(this.animaciones)
        console.log("Enemigos:")
        this.enemigos = this.enemigos.enemigos;
        console.log(this.enemigos);
        console.log("Parametros:")
        console.log(this.parametros);

        console.log("Sesion:")
        console.log(this.sesion)
        console.log("Cuenta:")
        console.log(this.cuenta)
        console.log("Perfil:")
        console.log(this.perfil)
        console.log("Mazmorra:")
        console.log(this.mazmorra)

        console.log("-------------------------");
        console.log(" CONFIGURANDO MAZMORRA");
        console.log("-------------------------");

        //Inicializa la mazmorra si no se ha iniciado:
        if(!this.sesion.render.mazmorra.iniciada){

            var salaInicialEvento = this.eventosService.getSalaOpenInicio();
            this.sesion.render.mazmorra.interactuado = [];

            //Calcula el nivel de la mazmorra:
            var nivelMedio = 0;
            for(var i = 0; i < this.sesion.render.heroes.length; i++){
                nivelMedio += this.sesion.render.heroes[i].nivel;
            }

            this.sesion.render.mazmorra.nivel = Math.ceil(nivelMedio/this.sesion.render.heroes.length);
            console.warn("Nivel Mazmorra: ", this.sesion.render.mazmorra.nivel);

            if(salaInicialEvento == null){
                this.sesion.render.mazmorra.salasDescubiertas = [];
                for(var i = 0; i < this.mazmorra.salas.length; i++){
                    if(this.mazmorra.salas[i].salaInicial){
                        this.sesion.render.mazmorra.salasDescubiertas.push(this.mazmorra.salas[i].id)
                    }
                }
            }else{
                this.sesion.render.mazmorra.salasDescubiertas = [];
                this.sesion.render.mazmorra.salasDescubiertas.push(salaInicialEvento);
            }
        }
        
         this.estadoControl = {
              estado: "seleccionAccion",
              esTurnoPropio: false,
              esTurnoHeroe: false,
              esTurnoEnemigo: false,
              heroePropioIndex: 0,
              turnoIndex: 0,
              hechizoId: 0,
              tipoObjetivo: "EU",
              critico: false,
              fortuna: false,
              fallo: false,
              pifia: false,
              rngEncadenado: false,
              detenerHechizo: false,
              objetivosEnemigos: [],
              objetivosHeroes: []
        }

        this.estadoControl.heroePropioIndex = this.sesion.jugadores.findIndex(i => i.usuario==this.cuenta.usuario);

        //Inicialización de personaje:
        this.personaje = {
            nombre: "",
            imagenId: 0
        };

        this.personaje.nombre = this.sesion.jugadores.find(i => i.usuario==this.cuenta.usuario).personaje;
        this.personaje.imagenId = this.sesion.jugadores.find(i => i.usuario==this.cuenta.usuario).personaje.id_imagen;

        //Inicializando variables de render:
        this.sesion.render.interfaz = {
          barraAccion: {
            mensajeAccion: "Partida Iniciada",
            mostrar: false,
            nombreTurno: this.sesion.render.heroes[0].nombre,
            claseTurno: "/Clases/"+this.sesion.render.heroes[0].clase.toLowerCase()
          },
          objetivoPredefinido: {
            enemigos: [],
            heroes: []
          },
          heroeMuerto: [],
          enemigoMuerto: []
        }

    //Calcular estadisticas Heroes:
    for (var i = 0; i < this.sesion.jugadores.length; i++) {
      this.sesion.render.heroes[i]["estadisticasBase"] = this.logicService.calcularEstadisticasBaseHeroe(this.sesion.jugadores[i].personaje);
      this.sesion.render.heroes[i].estadisticas=this.sesion.render.heroes[i].estadisticasBase;
      this.actualizarEscudo("heroes", i);
    }

    //Calcular estadisticas Enemigos:
    for (var i = 0; i < this.sesion.render.enemigos.length; i++) {
      this.sesion.render.enemigos[i]["estadisticasBase"] = this.logicService.calcularEstadisticasBaseEnemigo(this.sesion.render.enemigos[i]);
      this.sesion.render.enemigos[i].estadisticas=this.sesion.render.enemigos[i].estadisticasBase;
      this.actualizarEscudo("enemigos", i);
    }

    //Inicializa turno:
    //this.sesion.render.registroTurno= [];
    //this.sesion.render.registroTurno[0]= 0;
    if(this.sesion.render.registroTurno == undefined){
        this.sesion.render.registroTurno= [0];
    }

    this.checkTurno();
    this.checkTurnoPropio();
    this.sesion.render.numHeroes= this.sesion.jugadores.length;

    //Inicializacion de flag de control enemigo:
    if(this.estadoControl.esTurnoEnemigo){
      this.sesion.render.heroes[this.sesion.render.indexActivacionEnemigo].controlEnemigos = true;
    }

    //Inicializar Analisis de estadisticas si no esta inicializado:
    if(this.sesion.render.estadisticas == undefined){
        this.sesion.render.estadisticas = [];
    }

    if(this.sesion.render.estadisticas.length < this.sesion.render.heroes.length){
      this.sesion.render.estadisticas= [];
      for(var i=0; i < this.sesion.render.heroes.length; i++){
        this.sesion.render.estadisticas[i]={
          daño: [],
          heal: [],
          escudo: [],
          agro: []
        }
      }

      //Agregar nuevo registro de analisis:
      for(var i=0; i <this.sesion.render.numHeroes;i++){
        this.sesion.render.estadisticas[i].daño.push(0);
        this.sesion.render.estadisticas[i].heal.push(0);
        this.sesion.render.estadisticas[i].escudo.push(0);
        this.sesion.render.estadisticas[i].agro.push(0);
      }

    }//Fin inicializacion estadisticas.

    if(this.sesion.render.estadisticasTotal == undefined){
        this.sesion.render.estadisticasTotal = [];
    }
        
    if(!this.sesion.render.mazmorra.iniciada){
        this.sesion.render.estadisticasTotal = [];
    }

    if(this.sesion.render.estadisticasTotal.length < this.sesion.render.heroes.length){
      //Inicializar Analisis de estadisticas TOTAL si no esta inicializado:
      this.sesion.render.estadisticasTotal = [];
      for(var i=0; i < this.sesion.render.heroes.length; i++){
          this.sesion.render.estadisticasTotal.push({
              daño: 0,
              heal: 0,
              escudo: 0,
              agro: 0
          })
      }
    }//Fin inicializacion estadisticas Total:

    //Generar Secuenciación de acciones enemigos:
    if(this.sesion.render.indexActivacionEnemigo == undefined){
      console.error("INDEX ACTIVACION UNDEFINED")
      this.sesion.render.indexActivacionEnemigo = 0;
    }

    //Check de cambio de control de personaje:
    //this.cambiarControlPersonaje();

    //Acctivar Temporizador:
    this.tiempoMaxTurno = this.parametros.tiempoMaxTurno;
    this.activarTemporizador();

    //Iniciar logger:
    this.loggerService.log("-----------------------------","yellow");
    this.loggerService.log(" DELIRIUM  -  v"+this.appService.version,"yellow");
    this.loggerService.log("Partida Iniciada...","yellow");
    this.loggerService.log("-----------------------------","yellow");

    for(var i=0; i <this.sesion.render.heroes.length; i++){
      this.loggerService.log(this.sesion.render.heroes[i].nombre+" ---> "+this.sesion.render.heroes[i].clase,"orange");
    }

    //this.musicaMazmorraPlay();
    this.autoGuardado2 = cloneDeep(this.sesion.render);
    this.autoGuardado = cloneDeep(this.sesion.render);

    this.cargaCompleta=true;

    if(this.sesion.render.interfaz.barraAccion.mostrar){
      this.appService.setControl("bloqueoMensaje");
      setTimeout(()=>{
              this.mostrarBarraAccion(false);
              this.appService.setControl("desbloqueoMensaje");
      }, 2000);
    }

    //Inicializar Canvas Isometrico:
    this.appService.renderizarCanvasIsometrico();
    
    //INICIAR SALAS DESCUBIERTAS:
    if(!this.sesion.render.mazmorra.iniciada){
        for(var i = 0; i < this.sesion.render.mazmorra.salasDescubiertas.length; i++){
            this.cambiarSala(this.sesion.render.mazmorra.salasDescubiertas[i], {inicializacion: true});
        }
    }

    this.sesion.render.mazmorra.iniciada = true;

    //Mostrar Mazmorra:
    this.mostrarMazmorra= true;
    this.forceRenderMazmorra();
    this.forceRender()

    //Inicializacion de evento inicial Mazmorra:
    console.warn()
    if(this.mazmorra.general.evento_start_id){
        await this.eventosService.actualizarEventos();
        this.eventosService.ejecutarEvento(this.mazmorra.general.evento_start_id,"General")
    }


    //Centrar Vista Mazmorra:
    setTimeout(()=>{
      this.subscripcionMazmorra.emit("centrarMazmorra");
      for(var i = 0; i < this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].turno){
            console.warn("ACTIVANDO ENEMIGO");
            this.activarEnemigo(i);
            this.subscripcionMazmorra.emit("habilitarInterfaz");
            this.forceRender()
        }
      }
    },1000)

    } //Fin Inicializar Mazmorra:


    mostrarBarraAccion(mostrar: boolean){
      this.sesion.render.interfaz.barraAccion.mostrar = mostrar;
      this.forceRender();
      return;
    }

    forceRender(){
      this.subscripcionMazmorra.emit("forceRender");
    }

    forceRenderMazmorra(){
      this.subscripcionMazmorra.emit("forceRenderMazmorra");
    }

    getRenderMazmorra(): RenderMazmorra{
        return this.renderMazmorra;
    }

    setRenderMazmorra(render): void{
        this.renderMazmorra= Object.assign({},render);
        this.cargarAutoGuardado.emit(render);
        return;
    }

    setRenderSesion(render): void{
        this.sesion.render = Object.assign({},render);
        //this.cargarAutoGuardado.emit(render);
        return;
    }

    setDispositivo(dispositivo){
        this.dispositivo= dispositivo;
        return;
    }

    getDispositivo(){
        return this.dispositivo;
    }

    setEstadoControl(estado):void{
        this.estadoControl.estado= estado;
        return;
    }

    forzarSincronizacion(){
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
        this.mensajeAccion("Sincronizando...",2000);
    }

  /*  ----------------------------------------------
      FUNCIONES BASICAS
  ----------------------------------------------*/

  checkTurno(){

    this.estadoControl.esTurnoHeroe = false;
    this.estadoControl.esTurnoEnemigo = false;

    //Detecta si es turno de algun Heroe:
    for (var i = 0; i < this.sesion.render.heroes.length; i++) {
            if(this.sesion.render.heroes[i].turno){
                this.estadoControl.esTurnoHeroe = true;
                this.estadoControl.turnoIndex = i;
            }
    }


    for (var i = 0; i < this.sesion.render.enemigos.length; i++) {
        if(this.sesion.render.enemigos[i].turno){
          this.estadoControl.esTurnoEnemigo = true;
          this.estadoControl.turnoIndex = i;
        }
    }

    if(this.estadoControl.esTurnoEnemigo == this.estadoControl.esTurnoHeroe){
      console.error("Error de asignación de turno: esTurnoEnemigo == esTurnoHeroe");
      console.error(this.estadoControl);
      console.error("Revistiendo turno a Heroe[0]");
      this.iniciarTurno("heroes",0)
    }

    return;

  }

  checkTurnoPropio(){

    if(this.sesion.render.heroes[this.estadoControl.heroePropioIndex].turno){
      this.estadoControl.esTurnoPropio=true;
      this.interfazService.setTurno(true);
      if(this.sesion.render.heroes[this.estadoControl.heroePropioIndex].vida==0){
          this.interfazService.activarHeroeAbatido(this.estadoControl.turnoIndex);
      }
      return true;
    }else{
      this.estadoControl.esTurnoPropio=false;
      //Per
      if(this.permitirMultiControl && this.estadoControl.heroePropioIndex!=null){
        this.interfazService.setTurno(true);
        if(this.sesion.render.heroes[this.estadoControl.heroePropioIndex].vida==0){
              this.interfazService.activarHeroeAbatido(this.estadoControl.turnoIndex);
        }
      }else{
        this.interfazService.setTurno(false);
      }
      return false;
    }
  }

  recalcularEnergiaFutura(indexHeroe){
    var energiaFutura = 0;
    energiaFutura= this.sesion.render.heroes[indexHeroe].energia + this.parametros.regenEnergiaTurno;
    if(energiaFutura < 0){
      energiaFutura = 0;
    }
    if(energiaFutura > 100){
      energiaFutura = 100;
    }
    this.sesion.render.heroes[indexHeroe].energiaFutura = energiaFutura;
  }

  regenerarEnergia(){
    for(var i = 0; i < this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].vida >0){
          this.sesion.render.heroes[i].energia += (this.parametros.regenEnergiaTurno/this.sesion.render.heroes.length);
        }
      if(this.sesion.render.heroes[i].energia>100){this.sesion.render.heroes[i].energia=100}
    }

  }

  reloadMazmorraService(){
    this.cambiarControlPersonaje();
    this.checkTurno();
    this.checkTurnoPropio();
    this.interfazService.desactivarInterfaz();

    //Activa Monstruos si es su turno:
      for(var i = 0; i < this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].turno){
            console.warn("ACTIVANDO ENEMIGO");
            this.activarEnemigo(i);
        }
      }

  }

  //Funcion principal de paso de turno:
  async pasarTurno() {

        //Restriccion por BLOQUEO:
        if(this.appService.control=="null"){this.appService.setControl("mazmorra");}
        if(this.appService.control!="mazmorra"){return;}

        //Restringir accion por turno incorrecto.
        /*
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){return;}
        }else{
          this.desactivarComandoSocket();
        }
        */

      if(!this.comandoSocketActivo){
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "pasarTurno"});
      }

      console.log("Pasando Turno...");

      if(this.estadoControl.estado=="seleccionObjetivo"){
        this.estadoControl.estado = "seleccionAccion";
        this.estadoControl.hechizoId = 0;
        this.cancelarObjetivo();
      }

      //Pasar turno aplicando buffos:
      this.loggerService.log("-------------- Pasando Turno ------------------");

      var turnoHeroe = false;
      var indexTurnoHeroe = 0;

      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].turno){turnoHeroe=true; indexTurnoHeroe= i;}
      }

      if(turnoHeroe){
        await this.lanzarBuffos();
        console.error("FIN LANZAMIENTO BUFFS");
        this.regenerarEnergia();
      }

      //CHECK TUTORIAL:
      if(this.sesion.variablesMundo.tuto_paso_turno == "true"){
           this.eventosService.ejecutarEvento(7,"General")
      }

      //CHECK TUTORIAL:
      if(this.sesion.variablesMundo.tuto_turno_enemigo == "true"){
           this.eventosService.ejecutarEvento(9,"General")
      }

    //Elimina a los enemigos Muertos:
    this.enemigoMuerto(-1);

    //Actualizar Buffs si es turno si se esta pasando el turno propio:
    if(turnoHeroe){
      for(var i = 0; i < 5; i++){
        if(this.sesion.render.heroes[indexTurnoHeroe].cooldown[i]){
          this.sesion.render.heroes[indexTurnoHeroe].cooldown[i]--;
        }
      }
    }

    
    //Agregar nuevo registro de analisis:
    /*
    for(var i=0; i <this.sesion.render.numHeroes;i++){
      this.sesion.render.estadisticas[i].daño.push(0);
      this.sesion.render.estadisticas[i].heal.push(0);
      this.sesion.render.estadisticas[i].escudo.push(0);
      this.sesion.render.estadisticas[i].agro.push(0);
    }
    */

    //Paso de turno Con modificador por muerte de enemigo:
    if(this.turnoModificado){

      //Los ultimos enemigos han sido eliminados:
      if(this.sesion.render.heroes[0].turno){
        this.iniciarTurno("heroes",0)
        this.checkTurno();
        this.turnoModificado= false;
        this.finalizarSecuenciaPasoTurno()
        return;
      }

      //Paso de turno entre enemigos:
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].turno){
          console.warn("ENEMIGO -> ENEMIGO");
          this.iniciarTurno("enemigos",i+1);
          this.activarEnemigo(i+1);
          this.checkTurno();
          this.turnoModificado= false;
          this.finalizarSecuenciaPasoTurno()
          return;
        }
      }
    } //Fin de modificador por muerte.

    //Paso de turno entre heroes:
    for(var i=0; i <this.sesion.render.heroes.length-1; i++){
      if(this.sesion.render.heroes[i].turno){
        console.warn("HEROE -> HEROE");
        this.iniciarTurno("heroes",i+1)
        this.checkTurno();
        this.finalizarSecuenciaPasoTurno()
        return;
      }
    }

    //Paso de turno entre enemigos:
    for(var i=0; i <this.sesion.render.enemigos.length-1; i++){
      if(this.sesion.render.enemigos[i].turno){
        console.warn("ENEMIGO -> ENEMIGO");
        this.iniciarTurno("enemigos",i+1);
        this.activarEnemigo(i+1);
        this.checkTurno();
        this.finalizarSecuenciaPasoTurno()
        return;
      }
    }
    // Paso de turno Heroe-Enemigo:
    if(this.sesion.render.heroes[this.sesion.render.heroes.length-1].turno){

      if(this.sesion.render.enemigos.length>0){
        console.warn("HEROE -> ENEMIGO");
        this.sesion.render.heroes[this.sesion.render.indexActivacionEnemigo].controlEnemigos = true;
        this.iniciarTurno("enemigos",0);
        this.activarEnemigo(0);
        this.checkTurno();
        //this.sesion.render.interfaz.barraAccion.claseTurno="/Enemigos/"+this.sesion.render.enemigos[0].nombre.toLowerCase();
      }else{
        console.warn("HEROE -> HEROE[0] (Cambio de ronda)");
        this.sesion.render.turno++;
        this.iniciarTurno("heroes",0)
        this.checkTurno();
      }
      this.finalizarSecuenciaPasoTurno()
      return;
    }

    // Paso de turno Enemigo-Heroe:
    if(this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].turno){
      console.warn("ENEMIGO -> HEROE[0] (Cambio de ronda)");
      this.sesion.render.indexActivacionEnemigo++;
      if(this.sesion.render.indexActivacionEnemigo >= this.sesion.render.heroes.length){
        this.sesion.render.indexActivacionEnemigo = 0;
      }
      this.sesion.render.turno++;
      this.iniciarTurno("heroes",0)
      this.checkTurno();
      this.finalizarSecuenciaPasoTurno()
      return;
    }


  }

  iniciarTurno(tipoTurno: "heroes" | "enemigos",indexTurno){

    //Actualización de flags:
    this.eliminarFlagTurno(); //Elimina todos los flags de turno.
    this.sesion.render[tipoTurno][indexTurno].turno = true;

    //Gestión de energia:
    if(tipoTurno=="heroes"){
      this.recalcularEnergiaFutura(indexTurno)
    }

    //Gestión de control de enemigos:
    if(tipoTurno=="heroes"){
      this.eliminarFlagControlTurno();
      this.interfazService.finalizarActivacion(true);
    }

    //Actualizacón de Temporizador:
    if(tipoTurno == "heroes"){
      if(indexTurno == 0){
        this.activarTemporizador()
      }else{
        this.resetTemporizador()
      }
    }
    if(tipoTurno == "enemigos" && indexTurno == 0){
      this.desactivarTemporizador();
    }

    //Actualización de metadatos:
    this.sesion.render.turno++;
    if(tipoTurno == "heroes"){
      this.sesion.render.registroTurno.push(indexTurno);
    }else{
      this.sesion.render.registroTurno.push(-1);
    }

    //Servicios de mensajes y loggs:
    this.mensajeAccion("Turno de "+this.sesion.render[tipoTurno][indexTurno].nombre,2000);
    this.loggerService.log("-------------- Turno de "+this.sesion.render[tipoTurno][indexTurno].nombre+" ------------------");
    this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render[tipoTurno][indexTurno].nombre;

    return;
  } //Fin iniciarTurno

    finalizarSecuenciaPasoTurno(){
        //Gestion de datos y sincronización:
        this.autoGuardado2 = cloneDeep(this.autoGuardado);
        this.autoGuardado = cloneDeep(this.sesion.render);
        this.cambiarControlPersonaje();
        this.checkTurno();
        this.checkTurnoPropio();
        this.hash = this.hashCode(JSON.stringify(this.sesion.render));
        if(!this.comandoSocketActivo){
          this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
          this.socketService.enviarSocket("checkSinc",{peticion: "checkSinc", comando: "checkSinc", contenido: this.hash});
        }

        //Si se ha recibido hash hacer comprobació:
        if(this.hashRecibido){
          this.checkHash(this.hashRecibido);
        }else{
          this.flagCheckHash = true;
        }

        console.warn("PASO TERMINADO")
        this.forceRender();
    }

    hashCode(str: string): number {
      //console.warn(str)
      var h: number = 0;
      for (var i = 0; i < str.length; i++) {
          h = h + (str.charCodeAt(i)+(i%10));
      }
      return h & 0xFFFFFFFF
    }

    checkHash(hashRecibido){
      this.hashRecibido = undefined;
      this.flagCheckHash = false;
      if(this.hash == hashRecibido){
        console.log("---> HASH OK <---");
      }else{
        console.error("HASH ERROR --> Actual: ",this.hash," Recibido: ",hashRecibido);
        console.error("LOCAL: ",this.sesion)
        this.socketService.enviarSocket("getSinc",{peticion: "getSinc", comando: "getSinc", contenido: this.hash});

      }
      return;
    }

    setHashRecibido(hash){
      this.hashRecibido = hash;
      if(this.flagCheckHash){
        this.checkHash(this.hashRecibido);
      }
      return;
    }

  eliminarFlagTurno(){
    for(var i=0; i < this.sesion.render.heroes.length; i++){
      this.sesion.render.heroes[i].turno = false;
    }
    for(var i=0; i < this.sesion.render.enemigos.length; i++){
      this.sesion.render.enemigos[i].turno = false;
    }
    return;
  }

  eliminarFlagControlTurno(){
    for(var i=0; i < this.sesion.render.heroes.length; i++){
      this.sesion.render.heroes[i].controlEnemigos = false;
    }
    return;
  }

  //Muestra mensaje en barra de acción y bloquea input:
  mensajeAccion(mensaje: string, tiempoMensaje: number):void{
    this.sesion.render.interfaz.barraAccion.mensajeAccion = mensaje;
    this.mostrarBarraAccion(true);
    this.appService.setControl("bloqueoMensaje");
    setTimeout(()=>{
        this.mostrarBarraAccion(false);
        this.appService.setControl("desbloqueoMensaje");
    }, tiempoMensaje);
  }

  //Cambiar Control Personaje:
  cambiarControlPersonaje(){

    var turnoHeroe = false;
    var indexTurnoHeroe = null;

    //Verifica de quien es el turno:
    for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].turno){
            turnoHeroe=true
            indexTurnoHeroe=i;
        }
    }

    if(turnoHeroe){
        this.estadoControl.turnoIndex = indexTurnoHeroe;
    }else{
        //this.estadoControl.heroePropioIndex = null;
    }

    //CAMBIAR PERSONAJE CONTROL SI PERMITE MULTI CONTROL:
    if(this.permitirMultiControl){
      console.log("Cambiando control personaje (Multicontrol)");
      console.log(this.personaje)
      //Buscar si el turno es de un Heroe y seleccionar como control:
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].turno){
          //this.sesion.render.personajeIndex = i;
          this.personaje.nombre = this.sesion.render.heroes[i].nombre;
          this.personaje.clase = this.sesion.render.heroes[i].clase;;
        }
      }
    }

  }

  toggleMultiControl(){
    this.permitirMultiControl = !this.permitirMultiControl;
    if(this.permitirMultiControl){
        this.cambiarControlPersonaje();
    }
  }

  //Gestiona el cambio de sala:
  addEnemigo(idEnemigo:number):void{

    //Añade los enemigos de la nueva sala a la instancia:
    var enemigoAdd= this.enemigos.find(j => j.id == idEnemigo);
    //var enemigoAdd= this.enemigos.find(j => j.id == idEnemigo);

    console.log(enemigoAdd);
    this.loggerService.log("--------------Añadiendo Enemigo-----------------");
    this.loggerService.log("Añadiendo: "+enemigoAdd.nombre);

    //Asignación de Color:
    var coloresAsignables = ["white","yellow","purple","grey"];
    var colorSeleccionado = "white";
    var flagEncontrado = false;
    for(var j = 0; j < coloresAsignables.length; j++){
      for(var i = 0; i < this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].color==coloresAsignables[j]){flagEncontrado=true;break;}
      }
      if(!flagEncontrado){colorSeleccionado=coloresAsignables[j];break;}
    }

    if(enemigoAdd.nombre=="0"){
      enemigoAdd.nombre = this.enemigos.find(j => j.id == idEnemigo);
    }

      this.sesion.render.enemigos.push({
        nombre: enemigoAdd.nombre,
        enemigo_id: enemigoAdd.id,
        tipo_enemigo_id: enemigoAdd.tipo_enemigo_id,
        familia: this.enemigos.find(k => k.id === enemigoAdd.enemigo_id).familia.toLowerCase(),
        turno: false,
        color: colorSeleccionado,
        vida: 100,
        puntosVida: 100,
        escudo: 0,
        agro: [],
        buff:[],
        
        estadisticas: {
          armadura: enemigoAdd.armadura,
          vitalidad: enemigoAdd.vitalidad,
          fuerza: enemigoAdd.fuerza,
          intelecto: enemigoAdd.intelecto,
          precision: enemigoAdd.precision,
          ferocidad: enemigoAdd.ferocidad,
          general: 0
        },
        estadisticasBase: {
          armadura: enemigoAdd.armadura,
          vitalidad: enemigoAdd.vitalidad,
          fuerza: enemigoAdd.fuerza,
          intelecto: enemigoAdd.intelecto,
          precision: enemigoAdd.precision,
          ferocidad: enemigoAdd.ferocidad,
          general: 0
        },
        objetivo: false,
        acciones: enemigoAdd.acciones,
        objetivoAuxiliar: false,
        hechizos: enemigoAdd.hechizos_id,
        mostrarAnimacion: false,
        animacion: {
          id: 1,
          nombre: "Basico",
          duracion: "1",
          subanimaciones: [],
          sonidos: []
        }
      });

      //Inicializacion de Agro:
      for(var j= 0; j <this.sesion.render.numHeroes;j++){
        this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].agro.push(0);
      }

      this.loggerService.log("Agregando enemigo: "+this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].nombre);


    //Calcular estadisticas Enemigos:

    //this.calcularEstadisticas(false,this.sesion.render.enemigos[this.sesion.render.enemigos.length-1]);

    console.log(this.sesion.render.enemigos);
    this.loggerService.log("----------------------------------------------");
  }

  //Gestiona el cambio de sala:

  cambiarSala(sala:number,config?: any):void{

      console.warn(sala,config);

      if(!this.comandoSocketActivo && !config?.inicializacion){
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "cambiarSala", valor: sala});
        //this.emisor=false;
      }

    //Añade los enemigos de la nueva sala a la instancia:
        console.log("CAMBIANDO SALA: ")
        console.log(this.mazmorra)
        console.log("ENEMIGOS:")
        console.log(this.enemigos)

    var enemigosAdd= this.mazmorra.salas.find(j => j.id == sala).enemigos;
    console.warn("EnemigosAdd: ",enemigosAdd)

    this.loggerService.log("--------------Cambiando Sala------------------");
    this.loggerService.log("Cambiando de sala: "+sala);

    //Revelar salas:
    if(!config?.inicializacion){
        this.sesion.render.mazmorra.salasDescubiertas.push(sala);
    }

    if(config?.inicializacion){
        this.sesion.render.enemigos = [];
    }

    console.log(enemigosAdd)

    for(var i=0; i <enemigosAdd.length;i++){

    //Asignación de Color:
    var coloresAsignables = ["white","yellow","purple","grey"];
    var colorSeleccionado = "white";
    var flagEncontrado = false;
    for(var j = 0; j < coloresAsignables.length; j++){
      flagEncontrado=false;
      for(var k = 0; k < this.sesion.render.enemigos.length; k++){
        if(this.sesion.render.enemigos[k].color==coloresAsignables[j]){flagEncontrado=true;break;}
      }
      if(!flagEncontrado){colorSeleccionado=coloresAsignables[j];break;}
    }

      if(enemigosAdd[i].nombre=="0"){
        enemigosAdd[i].nombre = this.enemigos.find(j => j.id == enemigosAdd[i].tipo_enemigo_id).nombre;
      }
            //Rellenar Hechizos:
            var hechizos_id = [];
            hechizos_id = this.enemigos.find(k => k.id === enemigosAdd[i].tipo_enemigo_id).hechizos;

            var hechizos_objeto = [];
            for(var j=0; j < hechizos_id.length; j++){
               hechizos_objeto.push(this.hechizos.find(k => k.id == hechizos_id[j]));
      }

      this.sesion.render.enemigos.push({
        nombre: enemigosAdd[i].nombre,
        enemigo_id: enemigosAdd[i].enemigo_id,
        tipo_enemigo_id: enemigosAdd[i].tipo_enemigo_id,
        nivel: this.sesion.render.mazmorra.nivel+enemigosAdd[i].nivel,
        familia: this.enemigos.find(k => k.id === enemigosAdd[i].tipo_enemigo_id).familia.toLowerCase(),
        turno: false,
        color: colorSeleccionado,
        vida: 100,
        energia: 100,
        puntosVida: 1,
        escudo: 0,
        agro: [],
        buff:[],
        evento_muerte_id: enemigosAdd[i]["evento_muerte_id"],
        evento_spawn_id: enemigosAdd[i]["evento_spawn_id"],
        estadisticas: {
          armadura: 0,
          vitalidad: 0,
          resistenciaMagica: 0,
          pa: 0,
          ap: 0,
          ad: 0,
          critico: 0,
        },
        estadisticasBase: {
          armadura: 0,
          vitalidad: 0,
          resistenciaMagica: 0,
          pa: 0,
          ap: 0,
          ad: 0,
          critico: 0,
        },
        objetivo: false,
        acciones: this.enemigos.find(k => k.id === enemigosAdd[i].tipo_enemigo_id).acciones,
        objetivoAuxiliar: false,
        hechizos: hechizos_objeto,
        mostrarAnimacion: false,
        animacion: {
          id: 1,
          nombre: "Basico",
          duracion: "1",
          subanimaciones: [],
          sonidos: []
        }
      });

      //Inicializacion de Agro:
      for(var j= 0; j <this.sesion.render.numHeroes;j++){
        this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].agro.push(0);
      }

      this.loggerService.log("Agregando enemigo: "+this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].nombre);
    }

    //Calcular estadisticas Enemigos:
    for (var i = 0; i < this.sesion.render.enemigos.length; i++) {
      this.sesion.render.enemigos[i]["estadisticasBase"] = this.logicService.calcularEstadisticasBaseEnemigo(this.sesion.render.enemigos[i]);
      this.sesion.render.enemigos[i].estadisticas=this.sesion.render.enemigos[i].estadisticasBase;
    }

    console.log(this.sesion.render.enemigos);
    this.loggerService.log("----------------------------------------------");

    this.forceRenderMazmorra();
    this.forceRender();
    this.appService.setMazmorra(this.mazmorra);
    this.subscripcionMazmorra.emit("centrarMazmorra");

  }//Fin Cambiar Sala

  /*  ----------------------------------------------
      MANEJO DE OBJETIVOS
  ----------------------------------------------*/

  //Selecciona los objetivos del hechizo indicado segun de quien sea el turno:
  seleccionObjetivo(numHechizo: number):void{

    console.log(this.sesion.render.interfaz.objetivoPredefinido.enemigos);

    //Si hay objetivos predefinidos Lanza el hechizo automaticamente
    if(this.sesion.render.interfaz.objetivoPredefinido.enemigos.length!=0){
      //this.lanzarHechizo();
      this.activarRNG()
      return;
    }

    if(this.sesion.render.interfaz.objetivoPredefinido.heroes.length!=0){
      //this.lanzarHechizo();
      this.activarRNG()
      return;
    }

    var clase;
    //Detectar de quien es el turno (Heroes):
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      if(this.sesion.render.heroes[i].turno){

        //Turno del heroe[i]:
        clase= this.sesion.render.heroes[i].clase.toLowerCase();
        this.estadoControl.tipoObjetivo = this.hechizos.find(j => j.id==numHechizo).objetivo;

        //Si el caster es heroe y el objetivo es AL:
        if(this.estadoControl.tipoObjetivo=="AL"){
          this.estadoControl.objetivosHeroes = [this.estadoControl.turnoIndex]
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es heroe y el objetivo es EU:
        if(this.estadoControl.tipoObjetivo=="EU"){
          if(this.sesion.render.enemigos[0]==undefined){
              return;
          }
        }

        //Si el caster es heroe y el objetivo es AU:
        if(this.estadoControl.tipoObjetivo=="AU"){
        }

        //Si el caster es heroe y el objetivo es EM:
        if(this.estadoControl.tipoObjetivo=="EM"){
          if(this.sesion.render.enemigos[0]==undefined){
              return;
          }
        }

        //Si el caster es heroe y el objetivo es AM:
        if(this.estadoControl.tipoObjetivo=="AM"){
        }

        //Si el caster es heroe y el objetivo es AA: (All alies)
        if(this.estadoControl.tipoObjetivo=="AA"){
          this.estadoControl.objetivosHeroes = [];
          for(var j=0; j <this.sesion.render.heroes.length; j++){
            this.estadoControl.objetivosHeroes.push(j)
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es heroe y el objetivo es AE (All enemies):
        if(this.estadoControl.tipoObjetivo=="AE"){
          if(this.sesion.render.enemigos[0]==undefined){
              return;
          }
          this.estadoControl.objetivosEnemigos = []
          for(var j=0; j <this.sesion.render.enemigos.length; j++){
            this.estadoControl.objetivosEnemigos.push(j);
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

      }
    }

    //Detectar de quien es el turno (Enemigos):
    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      if(this.sesion.render.enemigos[i].turno){
        //Turno del enemigo[i]:
        clase= this.sesion.render.enemigos[i].nombre;
        //var hechizosEnemigos = this.enemigos.enemigos_hech.find(j => j.id==this.sesion.render.enemigos[i].hechizos);
        this.estadoControl.tipoObjetivo = this.enemigos.enemigos_hech.find(j => j.id==numHechizo).objetivo;

        //Si el caster es enemigo y el objetivo es AL:
        if(this.estadoControl.tipoObjetivo=="AL"){
          //this.sesion.render.enemigos[i].objetivo = true;
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es enemigo y el objetivo es EU:
        if(this.estadoControl.tipoObjetivo=="EU"){
          //this.sesion.render.heroes[0].objetivo = true;
        }

        //Si el caster es enemigo y el objetivo es AU:
        if(this.estadoControl.tipoObjetivo=="AU"){
          //this.sesion.render.enemigos[0].objetivo = true;
        }

        //Si el caster es enemigo y el objetivo es EM:
        if(this.estadoControl.tipoObjetivo=="EM"){
          //this.sesion.render.heroes[0].objetivoAuxiliar = true;
        }

        //Si el caster es enemigo y el objetivo es AM:
        if(this.estadoControl.tipoObjetivo=="AM"){
          //this.sesion.render.enemigos[0].objetivoAuxiliar = true;
        }

        //Si el caster es enemigo y el objetivo es AA:
        if(this.estadoControl.tipoObjetivo=="AA"){
          for(var j=0; j <this.sesion.render.enemigos.length; j++){
            //this.sesion.render.enemigos[j].objetivo = true;
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es enemigo y el objetivo es EE:
        if(this.estadoControl.tipoObjetivo=="EE"){
          for(var j=0; j <this.sesion.render.heroes.length; j++){
            //this.sesion.render.heroes[j].objetivo = true;
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

      }
    }

        //Seleccionar Objetivos:
    this.estadoControl.estado = "seleccionObjetivo";
    this.estadoControl.hechizoId = numHechizo;

  }

  //Cancela la selecion de objetivos:
  cancelarObjetivo(): void{

    //Elimina objetivos en heroes:
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      if(this.sesion.render.heroes[i].objetivoAuxiliar){
        this.sesion.render.heroes[i].objetivoAuxiliar= false;
      }
      if(this.sesion.render.heroes[i].objetivo){
        this.sesion.render.heroes[i].objetivo= false;
      }
    }

    //Elimina objetivos en enemigos:
    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      if(this.sesion.render.enemigos[i].objetivoAuxiliar){
        this.sesion.render.enemigos[i].objetivoAuxiliar= false;
      }
      if(this.sesion.render.enemigos[i].objetivo){
        this.sesion.render.enemigos[i].objetivo= false;
      }
    }

    this.estadoControl.objetivosHeroes = [];
    this.estadoControl.objetivosEnemigos = [];
    this.estadoControl.estado = "seleccionAccion";
  }

  //Selecciona el objetivo desde un objetivo auxiliar:
  seleccionarObjetivo(): void{
    //Evalua objetivos Auxiliares en heroes: (Invierte el objetivo en el objetivo auxiliar)
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].objetivoAuxiliar){
          //this.sesion.render.heroes[i].objetivo= !this.sesion.render.heroes[i].objetivo;
          return;
        }
      }
      //Evalua objetivos Auxiliares en enemigos: (Invierte el objetivo en el objetivo auxiliar)
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].objetivoAuxiliar){
          //this.sesion.render.enemigos[i].objetivo= !this.sesion.render.enemigos[i].objetivo;
          return;
        }
      }
  }

  resetObjetivos(): void{
    //Eliminamos los objetivos:
      //Elimina objetivos en heroes:
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].objetivoAuxiliar){
          this.sesion.render.heroes[i].objetivoAuxiliar= false;
        }
        if(this.sesion.render.heroes[i].objetivo){
          this.sesion.render.heroes[i].objetivo= false;
        }

      }
      //Elimina objetivos en enemigos:
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].objetivoAuxiliar){
          this.sesion.render.enemigos[i].objetivoAuxiliar= false;
        }
        if(this.sesion.render.enemigos[i].objetivo){
          this.sesion.render.enemigos[i].objetivo= false;
        }
      }
  }

  /*  ----------------------------------------------
      GESTION DE HECHIZOS
  ----------------------------------------------*/

    //------------------------
    // 1) VERIFICAR CASTEO
    //-----------------------
  verificarCasteo(numHechizo:number):boolean{
    var resultado= true;

    //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
    var indiceCaster;
    this.esHeroe = false;
    this.esEnemigo = false;
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      if(this.sesion.render.heroes[i].turno){
        this.esHeroe= true;
        indiceCaster = i;
          break;
      }
    }

    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      if(this.sesion.render.enemigos[i].turno){
        this.esEnemigo= true;
        indiceCaster= i;
        break;
      }
    }

    if(this.esHeroe){
      if(this.sesion.render.heroes[indiceCaster].recurso < this.hechizos.find(j => j.id==numHechizo).recurso){
        if(this.restringirRecurso){
          this.mensajeAccion("Recurso Insuficiente", 1000);
          resultado = false;
        }
      }

      if(this.sesion.render.heroes[indiceCaster].energia < this.hechizos.find(j => j.id==numHechizo).recurso){
        if(this.restringirRecurso){
          this.mensajeAccion("Energia Insuficiente", 1000);
          resultado = false;
        }
      }

      if(this.sesion.render.heroes[indiceCaster].recursoEspecial < this.hechizos.find(j => j.id==numHechizo).poder){
        if(this.restringirRecurso){
          this.mensajeAccion("Poder Insuficiente", 1000);
          resultado = false;
        }
      }

      if(this.sesion.render.heroes[indiceCaster].acciones < this.hechizos.find(j => j.id==numHechizo).acciones){
        if(this.restringirAcciones){
          this.mensajeAccion("Acciones Insuficientes", 1000);
          resultado = false;
        }
      }
    }

    if(this.esEnemigo){
      if(this.sesion.render.enemigos[indiceCaster].acciones < this.enemigos.enemigos_hech.find(i => i.id==this.sesion.render.enemigos[indiceCaster].hechizos).acciones){
        if(this.restringirAcciones){
          this.mensajeAccion("Acciones Insuficientes", 1000);
          resultado = false;
        }
      }
    }
    return resultado
  }

    //------------------------
    // 2) CONFIGURAR Y LANZAR HECHIZO
    //-----------------------
  configurarHechizo():ConfiguracionHechizo{
    var tipoCaster: "heroes" | "enemigos";
    if(this.estadoControl.esTurnoHeroe){
      tipoCaster= "heroes"
    }
    if(this.estadoControl.esTurnoEnemigo){
      tipoCaster= "enemigos"
    }
    var indexHechizo = this.hechizos.findIndex(i => i.id == this.estadoControl.hechizoId);
    //if(indexHechizo == -1){console.error("ERROR EJECUTANDO HECHIZO: indexHechizo == -1"); return;}
    var configuracionHechizo: ConfiguracionHechizo = {
      esEnemigo: this.estadoControl.esTurnoEnemigo,
      esHeroe: this.estadoControl.esTurnoHeroe,
      tipoCaster: tipoCaster,
      caster: this.sesion.render[tipoCaster][this.estadoControl.turnoIndex],
      indexCaster: this.estadoControl.turnoIndex,
      indexHechizo: indexHechizo,
      nivelCaster: this.sesion.render[tipoCaster][this.estadoControl.turnoIndex].nivel,
      critico: this.estadoControl.critico,
      fortuna: this.estadoControl.fortuna,
      fallo: this.estadoControl.fallo,
      pifia: this.estadoControl.pifia,
      objetivosEnemigos: this.estadoControl.objetivosEnemigos,
      objetivosHeroes: this.estadoControl.objetivosHeroes
    }
    return configuracionHechizo;
  }

  fallarHechizo(consumoEnergia: number){
        //Consume energia:
        var indexHeroeTurno = -1;
        for(var i = 0; i < this.sesion.render.heroes.length; i++){
            if(this.sesion.render.heroes[i].turno){
                indexHeroeTurno = i;
                break;
            }
        }

        this.sesion.render.heroes[indexHeroeTurno].energia -= consumoEnergia;

        if(this.sesion.render.heroes[indexHeroeTurno].energia <0){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia>100){
            this.sesion.render.heroes[indexHeroeTurno].energia = 100;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia==undefined
        || this.sesion.render.heroes[indexHeroeTurno].energia==null){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }

        this.sesion.render.heroes[indexHeroeTurno].energiaFutura = this.sesion.render.heroes[indexHeroeTurno].energia + this.parametros.regenEnergiaTurno;

        //Verificar valores de energiaFutura en los rangos:
        if(this.sesion.render.heroes[indexHeroeTurno].energiaFutura < 0){
            this.sesion.render.heroes[indexHeroeTurno].energiaFutura = 0;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energiaFutura > 100){
            this.sesion.render.heroes[indexHeroeTurno].energiaFutura = 100;
        }
  }

  lanzarHechizo(configuracionHechizo?: ConfiguracionHechizo){

    return new Promise((resolve) => {

    //Reinicia el contador de lanzamiento de hechizo:
    this.cuentaAplicacionHechizo=0;

    //Bloquea los inputs:
    this.appService.setControl("bloqueoHechizo");
    this.sesion.render.interfaz.barraAccion.mensajeAccion = "Procesando...";
    this.mostrarBarraAccion(true);

    //Construccion de Configuración de Hechizo:
    if(!configuracionHechizo){
      configuracionHechizo = this.configurarHechizo();
      if(!configuracionHechizo){return;}
    }

    console.warn("CONFIGURANDO HECHIZO: ", configuracionHechizo)

    //------------------------------------
    // 1) Obtiene propiedades del Hechizo:
    //------------------------------------
    var hechizo={
        id: this.hechizos[configuracionHechizo.indexHechizo].id,
        nombre: this.hechizos[configuracionHechizo.indexHechizo].nombre,
        tipo: this.hechizos[configuracionHechizo.indexHechizo].tipo_daño,
        recurso: this.hechizos[configuracionHechizo.indexHechizo].recurso,
        poder: this.hechizos[configuracionHechizo.indexHechizo].poder,
        cooldown: this.hechizos[configuracionHechizo.indexHechizo].cooldown,
        acciones: this.hechizos[configuracionHechizo.indexHechizo].acciones,

        daño_dir: this.hechizos[configuracionHechizo.indexHechizo].daño_dir,
        daño_esc_AD: this.hechizos[configuracionHechizo.indexHechizo].daño_esc_AD,
        daño_esc_AP: this.hechizos[configuracionHechizo.indexHechizo].daño_esc_AP,
        heal_dir: this.hechizos[configuracionHechizo.indexHechizo].heal_dir,
        heal_esc_AD: this.hechizos[configuracionHechizo.indexHechizo].heal_esc_AD,
        heal_esc_AP: this.hechizos[configuracionHechizo.indexHechizo].heal_esc_AP,
        escudo_dir: this.hechizos[configuracionHechizo.indexHechizo].escudo_dir,
        escudo_esc_AD: this.hechizos[configuracionHechizo.indexHechizo].escudo_esc_AD,
        escudo_esc_AP: this.hechizos[configuracionHechizo.indexHechizo].escudo_esc_AP,
        duracion_escudo: this.hechizos[configuracionHechizo.indexHechizo].duracion_escudo,
        mod_amenaza: this.hechizos[configuracionHechizo.indexHechizo].mod_amenaza,
        buff_id: this.hechizos[configuracionHechizo.indexHechizo].buff_id,
        funcion: this.hechizos[configuracionHechizo.indexHechizo].funcion,
        objetivo: this.hechizos[configuracionHechizo.indexHechizo].objetivo,
        animacion: this.hechizos[configuracionHechizo.indexHechizo].animacion_id,
        tipoCaster: configuracionHechizo.tipoCaster,
        nivelCaster: configuracionHechizo.nivelCaster,
        indexCaster: configuracionHechizo.indexCaster,
        triggerHechizo: this.hechizos[configuracionHechizo.indexHechizo].triggerHechizo,
        hechizo_encadenado_id: this.hechizos[configuracionHechizo.indexHechizo].hech_encadenado_id,
        critico: configuracionHechizo.critico,
        fallo: configuracionHechizo.fallo,
        fortuna: configuracionHechizo.fortuna,
        pifia: configuracionHechizo.pifia
    }

    console.log("Lanzando hechizo:");
    console.log(hechizo);

    this.estadoControl.estado = "lanzandoHechizo";

    //---------------------------------------------------------------
    //  2) Verifica y consume recurso del hechizo:
    //----------------------------------------------------------------
    if(configuracionHechizo.tipoCaster == "heroes"){

      //Consume la energia y actualiza la energia Futura:
      this.sesion.render.heroes[configuracionHechizo.indexCaster].energia -= hechizo.recurso;
      this.sesion.render.heroes[configuracionHechizo.indexCaster].energiaFutura = this.sesion.render.heroes[configuracionHechizo.indexCaster].energia + this.parametros.regenEnergiaTurno;

    //Actualiza el Cooldown:
    var indexHechizoCooldown = this.sesion.jugadores[this.estadoControl.turnoIndex].personaje.hechizos.equipados.indexOf(hechizo.id)
    //console.warn("INDEX HECHIZO: ",indexHechizoCooldown);
    this.sesion.render.heroes[configuracionHechizo.indexCaster].cooldown[indexHechizoCooldown] = hechizo.cooldown;

    //Verificar valores de energiaFutura en los rangos:
    if(this.sesion.render.heroes[configuracionHechizo.indexCaster].energiaFutura < 0){
        this.sesion.render.heroes[configuracionHechizo.indexCaster].energiaFutura = 0;
    }
    if(this.sesion.render.heroes[configuracionHechizo.indexCaster].energiaFutura > 100){
        this.sesion.render.heroes[configuracionHechizo.indexCaster].energiaFutura = 100;
    }

    //Verificar valores de energia en los rangos:
    if(this.sesion.render.heroes[configuracionHechizo.indexCaster].energia <0){
       this.sesion.render.heroes[configuracionHechizo.indexCaster].energia = 0;
    }
    if(this.sesion.render.heroes[configuracionHechizo.indexCaster].energia >100){
       this.sesion.render.heroes[configuracionHechizo.indexCaster].energia = 100;
    }
    if(this.sesion.render.heroes[configuracionHechizo.indexCaster].energia==undefined
    || this.sesion.render.heroes[configuracionHechizo.indexCaster].energia==null){
        this.sesion.render.heroes[configuracionHechizo.indexCaster].energia = 0;
    }

    }

    //---------------------------------------------------------------
    // Obtenemos los Objetivos del Hechizo:
    //----------------------------------------------------------------
    var objetivosEnemigos=[];
    var objetivosHeroes=[];

    objetivosEnemigos = configuracionHechizo.objetivosEnemigos;
    objetivosHeroes = configuracionHechizo.objetivosHeroes;

    //Si hay objetivos predefinidos Remplaza los objetivos por los predefinidos:
    if(this.sesion.render.interfaz.objetivoPredefinido.enemigos.length!=0){
      objetivosEnemigos = this.sesion.render.interfaz.objetivoPredefinido.enemigos;
    }

    if(this.sesion.render.interfaz.objetivoPredefinido.heroes.length!=0){
      objetivosHeroes = this.sesion.render.interfaz.objetivoPredefinido.heroes;
    }

    //Logger
    this.loggerService.log("--- HECHIZO ("+hechizo.nombre+")--- ","lightblue");

    //Aplicamos el hechizo en los objetivos:
    this.aplicarHechizos(configuracionHechizo.tipoCaster, configuracionHechizo.indexCaster, hechizo, objetivosEnemigos, objetivosHeroes, resolve);

  });
    } //FIN LANZAR HECHIZO

  //Aplica de forma iterativa el hechizo sobre los objetivos:
    //------------------------
    // 3) APLICAR HECHIZO
    //-----------------------
  aplicarHechizos(tipoCaster: "heroes"|"enemigos",indexCaster:number,hechizo: any, objetivoEnemigos: any, objetivoHeroes: any, resolve?):void{

    //Añadir cuenta aplicacion hechizo:
    this.cuentaAplicacionHechizo++;

    //Condicion de desbloqueo (No encontrar hechizos por aplicar):
    var desbloqueo=true;

    //Guarda una copia del hechizo original para relanzamientos:
    var hechizoOriginal= Object.assign({},hechizo);

    console.log("Aplicando Hechizo: "+hechizo.nombre);

        //Identificacion de Objetivo:
        var tipoObjetivo;
        var indexObjetivo;
        var objetivo;
        var caster = tipoCaster;

    if(objetivoEnemigos.length>0){
            tipoObjetivo = "enemigos";
            objetivo = "enemigos";
            indexObjetivo= objetivoEnemigos.slice(-1);
        }else if(objetivoHeroes.length>0){
            tipoObjetivo = "heroes";
            objetivo = "heroes";
            indexObjetivo= objetivoHeroes.slice(-1);
        }
            indexObjetivo= indexObjetivo[0];

        //-----------------------------------------
        // (RECURSIVO) EJECUCIÓN SOBRE UN OBJETIVO
        //-----------------------------------------
        if(objetivo){

        //LOGGER:
    this.loggerService.log("*** "+this.sesion.render[caster][indexCaster].nombre+ " --> "+this.sesion.render[objetivo][indexObjetivo].nombre,"pink");

        //---------------------------
        // 1)  INICIA ANIMACION:
        //---------------------------
        var animacion = this.animaciones.find(i => i.id== hechizo.animacion);
        if(typeof animacion == "undefined"){
            console.warn("No se puede reproducir la animación porque no se encuentra el id asociado")
        }else{

            //Activa Animacion:
            this.sesion.render[objetivo][indexObjetivo].animacion= animacion;
            this.sesion.render[objetivo][indexObjetivo].mostrarAnimacion= true;

            //Desactivar Animacion:
            var indexObjetivoProvisional = indexObjetivo;
            var objetivoProvisional = objetivo;
            setTimeout(()=>{
                this.sesion.render[objetivoProvisional][indexObjetivoProvisional].mostrarAnimacion= false;
            }, 1000*(this.sesion.render[objetivo][indexObjetivoProvisional].animacion.duracion));
        }//Fin Animacion

        //---------------------------
        // 2) MODIFICACIÓN DE SALIDA:
        //---------------------------
        hechizo =  this.modificacionHechizoSalida(tipoCaster,indexCaster,hechizo)

        //---------------------------
        // 3) MODIFICACIÓN DE ENTRADA:
        //---------------------------
        hechizo = this.modificacionHechizoEntrada(tipoObjetivo,indexObjetivo,hechizo);

        //-------------------------
        // 4) ADD BUFF
        //-------------------------
        var arrayBuff = this.addBuffHechizo(tipoObjetivo,indexObjetivo,hechizo);
        for(var i = 0; i < arrayBuff.length; i++){
          this.sesion.render[objetivo][indexObjetivo].buff.push(arrayBuff[i])
        }

        //-------------------------
        // 5) AGREGAR ESCUDO COMO BUFF:
        //-------------------------
        if(hechizo["escudo_salida"] > 0){
          console.warn("APLICANDO ESCUDO BUFF: ", hechizo["escudo_salida"])
          console.warn(hechizo);
          var buffEscudo = Object.assign({},this.buff.find(i => i.id==28))
          console.warn("BUFF ESCUDO", buffEscudo);
          buffEscudo["duracion"]= hechizo["duracion_escudo"]*this.sesion.jugadores.length;
          buffEscudo["critico"]= hechizo.critico;
          buffEscudo["fortuna"]= hechizo.fortuna;
          buffEscudo["nivelCaster"]= hechizo.nivelCaster;
          buffEscudo["tipoCaster"]= hechizo.tipoCaster;
          buffEscudo["indexCaster"]= hechizo.indexCaster;
          buffEscudo["escudo_valor"]= hechizo["escudo_salida"]
          buffEscudo["daño_t_entrante"]= 0
          buffEscudo["heal_t_entrante"]= 0
          buffEscudo["escudo_t_entrante"]= 0
          this.sesion.render[objetivo][indexObjetivo].buff.push(buffEscudo)
          this.actualizarEscudo(tipoObjetivo, indexObjetivo);
        }

        //-------------------------
        // 6) PROCESADO FUNCIONES
        //-------------------------
        this.ejecutarFuncionHechizo(hechizo.funcion,hechizo,objetivoEnemigos,objetivoHeroes);

        //-------------------------
        // 7) APLICACION FINAL
        //-------------------------

        switch(tipoObjetivo){
            case "heroes":
            this.aplicarHechizosFinal(tipoObjetivo, objetivoHeroes[objetivoHeroes.length-1],hechizo);
            break;
            case "enemigos":
            this.aplicarHechizosFinal(tipoObjetivo, objetivoEnemigos[objetivoEnemigos.length-1],hechizo);
            break;
        }

        //---------------------------------------
        // 8) ELIMINACION ELEMENTO LISTA OBJETIVO
        //---------------------------------------
        switch(tipoObjetivo){
            case "heroes":
            objetivoHeroes.splice(objetivoHeroes.length-1, 1);
            break;
            case "enemigos":
            objetivoEnemigos.splice(objetivoEnemigos.length-1, 1);
            break;
        }

        //---------------------------------------
        // 9) RENDERIZAR LANZAMIENTO
        //---------------------------------------
        this.forceRender();

        }//EJECUCIÓN SOBRE UN OBJETIVO

    console.log("HECHIZO LANZADO:");
    console.log(hechizo);

    //Verifica si quedan objetivos por efectuar y relanza el hechizo:
    if(objetivoEnemigos.length>0){
      setTimeout(()=>{
            this.aplicarHechizos(tipoCaster, indexCaster, hechizoOriginal, objetivoEnemigos, objetivoHeroes);
      }, this.velocidadHechizo);
    }else if(objetivoHeroes.length>0){
      setTimeout(()=>{
            this.aplicarHechizos(tipoCaster, indexCaster, hechizoOriginal, objetivoEnemigos, objetivoHeroes);
      }, this.velocidadHechizo);
    }else{
      setTimeout(()=>{
        if(hechizo.hechizo_encadenado_id != 0 && !this.estadoControl.detenerHechizo){ //Si hay hechizo encadenado
          this.appService.setControl("desbloqueoHechizo");
          this.estadoControl.estado = "hechizoEncadenado";
          this.estadoControl.hechizoId = hechizo.hechizo_encadenado_id;
          this.mostrarBarraAccion(false);
          this.cuentaLanzamientoHechizo++;
          this.loggerService.log("--> Iniciando Hechizo encadenado (ID: "+hechizo.hechizo_encadenado_id+")","yellow");

          this.seleccionObjetivo(hechizo.hechizo_encadenado_id);
        }else{
          //Desbloquea y termina la aplicación de Hechizos:
          this.appService.setControl("desbloqueoHechizo");
          this.estadoControl.estado = "seleccionAccion";
          this.estadoControl.hechizoId = 0;
          this.estadoControl.rngEncadenado= false;
          this.mostrarBarraAccion(false);
          this.cuentaLanzamientoHechizo=1;
          this.estadoControl.detenerHechizo=false;
          this.sesion.render.interfaz.objetivoPredefinido.enemigos= [];
          this.sesion.render.interfaz.objetivoPredefinido.heroes= [];
          this.enemigoMuerto();
          if(resolve){ resolve(true) } //Devuelve promesa de finalización de hechizo
        }

      }, this.velocidadHechizo);
      return;
    }
  } //FIN APLICAT HECHIZOS

    //------------------------
    // MODIFICACIONES SALIDA
    //-----------------------
    modificacionHechizoSalida(tipoCaster:"enemigos"|"heroes",indexCaster:number,hechizo:any):any{

        if(tipoCaster!="heroes" && tipoCaster!="enemigos"){console.error("tipoCaster no valido: "+tipoCaster);return}

        //CREA DATOS DE SALIDA:
        var potenciaCritico = 1;
        var potenciaFortuna = 1;
        hechizo["daño_salida"]= 0;
        hechizo["heal_salida"]= 0;
        hechizo["escudo_salida"]= 0;

        //Modificaciones por tipoCaster:
        switch(tipoCaster){
            case "heroes":
                hechizo["daño_salida"]= (hechizo.daño_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.daño_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.daño_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                hechizo["heal_salida"]= (hechizo.heal_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.heal_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.heal_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                hechizo["escudo_salida"]= (hechizo.escudo_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.escudo_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.escudo_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                potenciaCritico = this.sesion.render.heroes[indexCaster].estadisticas["potenciaCritico"];
                potenciaFortuna = 1.5;
                break;
            case "enemigos":
                hechizo["daño_salida"]= (hechizo.daño_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.daño_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.daño_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                hechizo["heal_salida"]= (hechizo.heal_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.heal_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.heal_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                hechizo["escudo_salida"]= (hechizo.escudo_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.escudo_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.escudo_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                break;
        }

        hechizo["daño_salida"] *= this.parametros.ratioDano;
        hechizo["heal_salida"] *= this.parametros.ratioHeal;
        hechizo["escudo_salida"] *= this.parametros.ratioEscudo;

    //Modificación por critico:
      if(hechizo.critico && tipoCaster == "heroes"){
        console.warn("MODIFICANDO POR CRITICO");
        if(hechizo.tipo == "Mágico"){
            potenciaCritico = this.sesion.render.heroes[indexCaster].estadisticas["potenciaCriticoMagico"];
        }else{
            potenciaCritico = this.sesion.render.heroes[indexCaster].estadisticas["potenciaCriticoFisico"];
        }
        hechizo["daño_salida"] = hechizo["daño_salida"]*potenciaCritico;
        hechizo["heal_salida"] = hechizo["heal_salida"]*potenciaCritico;
        hechizo["escudo_salida"] = hechizo["escudo_salida"]*potenciaCritico;
      }

    //Modificación por Fortuna:
      if(hechizo.fortuna && tipoCaster == "heroes"){
        console.warn("MODIFICANDO POR FORTUNA");
        hechizo["daño_salida"] = hechizo["daño_salida"]*potenciaFortuna;
        hechizo["heal_salida"] = hechizo["heal_salida"]*potenciaFortuna;
        hechizo["escudo_salida"] = hechizo["escudo_salida"]*potenciaFortuna;
      }

        hechizo["daño_salida"] = this.logicService.redondeo(hechizo["daño_salida"]);
        hechizo["heal_salida"] = this.logicService.redondeo(hechizo["heal_salida"]);
        hechizo["escudo_salida"] = this.logicService.redondeo(hechizo["escudo_salida"]);

    var statusHechizo = "(NORMAL)"
    if(hechizo.critico || hechizo.fortuna){
      if(hechizo.critico && !hechizo.fortuna){
        statusHechizo = "(CRITICO)"
      }else if(!hechizo.critico && hechizo.fortuna){
        statusHechizo = "(FORTUNA)"
      }else{
        statusHechizo = "(FORTUNA + CRITICO)"
      }
    }

    //Logger:
    if(hechizo.daño_salida>0){
      this.loggerService.log("[Salida] -----> Daño "+statusHechizo+": "+ hechizo["daño_salida"],"orangered");
    }
    if(hechizo.heal_salida>0){
      this.loggerService.log("[Salida] -----> Heal "+statusHechizo+": "+hechizo["heal_salida"],"lawngreen");
    }
    if(hechizo.escudo_salida>0){
      this.loggerService.log("[Salida] -----> Escudo "+statusHechizo+": "+hechizo["escudo_salida"]);
    }

        return hechizo;
    }

    setStatIncreaseBuff(buff:any, tipoObjetivo: "enemigos"|"heroes", indexObjetivo: number){

      if(buff.stat_inc==undefined){return buff}
      if(buff.stat_inc==0){return buff}

      //Añadir campo Stat increase:
      buff["statIncrease"]={}

      var vectorInstrucciones = buff.stat_inc.split("/");
      var primerTipoStat;
      var segundoTipoStat;
      var operador;
      var valorStat;

      //APLICACION POR INSTRUCCION:
      for(var i=0; i <vectorInstrucciones.length;i++){

            console.log("Analizando la primera Instrucción: ");
            console.log(vectorInstrucciones[i]);

            primerTipoStat= vectorInstrucciones[i].slice(0,2);
            operador=null;
            segundoTipoStat=null;
            valorStat= vectorInstrucciones[i].slice(2);

            if(vectorInstrucciones[i].slice(-1)=="%"){
              operador="%";
              valorStat= vectorInstrucciones[i].slice(2,-1);
            }

            var parametroSeleccionado;
            var estadisticas= this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas;

            for(var j=0; j <2;j++){
              if(j==0){parametroSeleccionado= primerTipoStat}else{parametroSeleccionado= segundoTipoStat};
              switch(parametroSeleccionado){
                case "VT":
                  if(j==0){primerTipoStat= "vitalidad"}else{segundoTipoStat= "vitalidad"};
                break;
                case "AD":
                  if(j==0){primerTipoStat= "ad"}else{segundoTipoStat= "ad"};
                break;
                case "AP":
                  if(j==0){primerTipoStat= "ap"}else{segundoTipoStat= "ap"};
                break;
                case "CR":
                  if(j==0){primerTipoStat= "critico"}else{segundoTipoStat= "critico"};
                break;
                case "AR":
                  if(j==0){primerTipoStat= "armadura"}else{segundoTipoStat= "armadura"};
                break;
                case "EN":
                  if(j==0){primerTipoStat= "energia"}else{segundoTipoStat= "energia"};
                break;
                case "VF":
                  if(j==0){primerTipoStat= "vidaFaltante"}else{segundoTipoStat= "vidaFaltante"};
                break;
                case "TH":
                  if(j==0){primerTipoStat= "vidaTotal"}else{segundoTipoStat= "vidaTotal"};
                break;
              }
            }

            //Modificar valores:

            //Operador Nulo
            if(operador==null){
              buff["statIncrease"][primerTipoStat] = parseFloat(valorStat);
            }

            //Operador %
            if(operador=="%"){
              buff["statIncrease"][primerTipoStat] = estadisticas[primerTipoStat]*parseFloat(valorStat)/100;
            }

            //Añadir valores a stats:
            this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas[primerTipoStat] += buff["statIncrease"][primerTipoStat];

            this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas["reduccionArmadura"] = this.logicService.calcularReduccionArmadura(tipoObjetivo, this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas["armadura"], this.sesion.render[tipoObjetivo][indexObjetivo].nivel);

            this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas["reduccionResistencia"] = this.logicService.calcularReduccionResistencia(tipoObjetivo, this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas["resistenciaMagica"], this.sesion.render[tipoObjetivo][indexObjetivo].nivel);

        }//FIN FOR EJECUCION POR INSTRUCCION DE STAT INC
        return buff;
    }//FIN SetStatIncreaseBuff

    modificacionBuffSalida(tipoCaster:"heroes"|"enemigos",indexCaster:number,buff:any):any{

        //CREA DATOS DE SALIDA:
        var potenciaCritico = 1;
        var potenciaFortuna = 1;
        //CREA DATOS DE SALIDA:
        buff["daño_t_salida"]= 0;
        buff["heal_t_salida"]= 0;
        buff["escudo_t_salida"]= 0;

        //Modificaciones por tipoCaster:
        switch(tipoCaster){
            case "heroes":
                buff["daño_t_salida"]= (buff.daño_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.daño_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.daño_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                buff["heal_t_salida"]= (buff.heal_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.heal_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.heal_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                buff["escudo_t_salida"]= (buff.escudo_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.escudo_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.escudo_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                potenciaFortuna = 1.5;
                break;
            case "enemigos":
                buff["daño_t_salida"]= (buff.daño_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.daño_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.daño_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                buff["heal_t_salida"]= (buff.heal_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.heal_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.heal_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                buff["escudo_t_salida"]= (buff.escudo_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.escudo_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.escudo_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                break;
        }

    //Ajustar valores por duracion:(El numero de jugadores ya se está considerando)
    buff["daño_t_salida"]= buff["daño_t_salida"]/buff["duracion"];
    buff["heal_t_salida"]= buff["heal_t_salida"]/buff["duracion"];
    buff["escudo_t_salida"]= buff["escudo_t_salida"]/buff["duracion"];

    buff["daño_t_salida"] *= this.parametros.ratioDanoBuff;
    buff["heal_t_salida"] *= this.parametros.ratioHealBuff;
    buff["escudo_t_salida"] *= this.parametros.ratioEscudoBuff;

    //Modificación por critico:
      if(buff.critico && tipoCaster == "heroes"){
        console.warn("MODIFICANDO BUFF POR CRITICO");
        if(buff.tipo == "Mágico"){
            potenciaCritico = this.sesion.render.heroes[indexCaster].estadisticas["potenciaCriticoMagico"];
        }else{
            potenciaCritico = this.sesion.render.heroes[indexCaster].estadisticas["potenciaCriticoFisico"];
        }
        buff["daño_t_salida"] = buff["daño_t_salida"]*potenciaCritico;
        buff["heal_t_salida"] = buff["heal_t_salida"]*potenciaCritico;
        buff["escudo_t_salida"] = buff["escudo_t_salida"]*potenciaCritico;
      }

    //Modificación por Fortuna:
      if(buff.fortuna && tipoCaster == "heroes"){
        console.warn("MODIFICANDO BUFF POR FORTUNA");
        buff["daño_t_salida"] = buff["daño_t_salida"]*potenciaFortuna;
        buff["heal_t_salida"] = buff["heal_t_salida"]*potenciaFortuna;
        buff["escudo_t_salida"] = buff["escudo_t_salida"]*potenciaFortuna;
      }

        buff["daño_t_salida"] = this.logicService.redondeo(buff["daño_t_salida"]);
        buff["heal_t_salida"] = this.logicService.redondeo(buff["heal_t_salida"]);
        buff["escudo_t_salida"] = this.logicService.redondeo(buff["escudo_t_salida"]);

    //Logger:
    var statusBuff = "(NORMAL)"
    if(buff.critico || buff.fortuna){
      if(buff.critico && !buff.fortuna){
        statusBuff = "(CRITICO)"
      }else if(!buff.critico && buff.fortuna){
        statusBuff = "(FORTUNA)"
      }else{
        statusBuff = "(FORTUNA + CRITICO)"
      }
    }

    if(buff.daño_t_salida>0){
      this.loggerService.log("[Salida] -----> Daño "+statusBuff+": "+ buff["daño_t_salida"],"orangered");
    }
    if(buff.heal_t_salida>0){
      this.loggerService.log("[Salida] -----> Heal "+statusBuff+": "+buff["heal_t_salida"],"lawngreen");
    }
    if(buff.escudo_t_salida>0){
      this.loggerService.log("[Salida] -----> Escudo "+statusBuff+": "+buff["escudo_t_salida"]);
    }

        return buff;
    }

    //------------------------
    // MODIFICACIONES ENTRADA
    //-----------------------
    modificacionHechizoEntrada(objetivo:"enemigos"|"heroes",indexObjetivo:number,hechizo:any):any{

        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armadura = 0;
        var resistencia = 0;
        var min = 0;
        var max = 0;

        switch(objetivo){

            //(CUALQUIERA) --> HEROE
            case "heroes":
                armadura = this.sesion.render.heroes[indexObjetivo].estadisticas.armadura;
                resistencia = this.sesion.render.heroes[indexObjetivo].estadisticas.resistenciaMagica;
                break;

            //(CUALQUIERA) --> ENEMIGO
            case "enemigos":
                armadura = this.sesion.render.enemigos[indexObjetivo].estadisticas.armadura;
                resistencia = this.sesion.render.enemigos[indexObjetivo].estadisticas.resistenciaMagica;
                break;
        }
        

        var reduccionArmadura = this.logicService.calcularReduccionArmadura(objetivo, armadura, hechizo.nivelCaster);
        var reduccionResistencia = this.logicService.calcularReduccionResistencia(objetivo, resistencia, hechizo.nivelCaster);

        var reduccionAplicada = 0;
        console.warn("HECHIZO", hechizo)

        if(hechizo.tipo == "Mágico"){
            reduccionAplicada = reduccionResistencia;
        }else{
            reduccionAplicada = reduccionArmadura;
        }


        hechizo["daño_bloqueado"] = hechizo["daño_salida"] * (reduccionAplicada);
        hechizo["daño_entrante"] = hechizo["daño_salida"] * (1-reduccionAplicada);
        hechizo["heal_entrante"] = hechizo["heal_salida"];
        hechizo["escudo_entrante"] = hechizo["escudo_salida"];

        hechizo["daño_bloqueado"] = this.logicService.redondeo(hechizo["daño_bloqueado"]);
        hechizo["daño_entrante"] = this.logicService.redondeo(hechizo["daño_entrante"]);
        hechizo["heal_entrante"] = this.logicService.redondeo(hechizo["heal_entrante"]);
        hechizo["escudo_entrante"] = this.logicService.redondeo(hechizo["escudo_entrante"]);

        //Evitar daño negativo:
        if(hechizo["daño_entrante"] < 0){
          hechizo["daño_entrante"] = 0;
        }

        if(hechizo["daño_entrante"]){
        this.loggerService.log("[Entrada] -----> Daño Entrante: "+ hechizo["daño_entrante"]+" ("+hechizo["daño_bloqueado"]+" Bloqueado)["+(reduccionAplicada*100)+"%]","orangered");
        }
        if(hechizo["heal_entrante"]){
        this.loggerService.log("[Entrada] -----> Heal Entrante: "+ hechizo["heal_entrante"],"orangered");
        }
        if(hechizo["escudo_entrante"]){
        this.loggerService.log("[Entrada] -----> Escudo Entrante: "+ hechizo["escudo_entrante"],"orangered");
        }
        return hechizo;

    }

    modificacionBuffEntrada(tipoObjetivo:"enemigos"|"heroes",indexObjetivo:number,buff:any):any{

        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armadura = 0;
        var resistencia = 0;
        var min = 0;
        var max = 0;

        switch(tipoObjetivo){

            //(CUALQUIERA) --> HEROE
            case "heroes":
                armadura = this.sesion.render.heroes[indexObjetivo].estadisticas.armadura;
                resistencia = this.sesion.render.heroes[indexObjetivo].estadisticas.resistenciaMagica;
                break;

            //(CUALQUIERA) --> ENEMIGO
            case "enemigos":
                armadura = this.sesion.render.enemigos[indexObjetivo].estadisticas.armadura;
                resistencia = this.sesion.render.enemigos[indexObjetivo].estadisticas.resistenciaMagica;
                break;
        }

        var reduccionArmadura = this.logicService.calcularReduccionArmadura(tipoObjetivo, armadura, buff.nivelCaster);
        var reduccionResistencia = this.logicService.calcularReduccionResistencia(tipoObjetivo, resistencia, buff.nivelCaster);

        var reduccionAplicada = 0;
        console.warn("BUFF", buff)

        if(buff.tipo == "Mágico"){
            reduccionAplicada = reduccionResistencia;
        }else{
            reduccionAplicada = reduccionArmadura;
        }

        buff["daño_t_bloqueado"] = buff["daño_t_salida"] * (reduccionAplicada);
        buff["daño_t_entrante"] = buff["daño_t_salida"] * (1-reduccionAplicada);
        buff["heal_t_entrante"] = buff["heal_t_salida"];
        buff["escudo_t_entrante"] = buff["escudo_t_salida"];

        buff["daño_t_bloqueado"] = this.logicService.redondeo(buff["daño_t_bloqueado"]);
        buff["daño_t_entrante"] = this.logicService.redondeo(buff["daño_t_entrante"]);
        buff["heal_t_entrante"] = this.logicService.redondeo(buff["heal_t_entrante"]);
        buff["escudo_t_entrante"] = this.logicService.redondeo(buff["escudo_t_entrante"]);

        if(buff["daño_t_entrante"]){
            this.loggerService.log("[Entrada Buff] -----> Daño_T (TOTAL): "+ buff["daño_t_entrante"]+" ("+buff["daño_t_bloqueado"]+" Bloqueado)["+(reduccionAplicada*100)+"%]","orangered");
        }

        if(buff["heal_t_entrante"]){
            this.loggerService.log("[Entrada Buff] -----> Heal_T (TOTAL): "+ buff["heal_t_entrante"],"lawngreen");
        }

        if(buff["escudo_t_entrante"]){
            this.loggerService.log("[Entrada Buff] -----> Escudo_T (TOTAL): "+ buff["escudo_t_entrante"]);
        }

        return buff;

    }

    //---------------------------
    // APLICACION FINAL (HECHIZO)
    //---------------------------
  aplicarHechizosFinal(tipoObjetivo:"heroes"|"enemigos",indexObjetivo:number,hechizo:any):any{

    console.log("APLICANDO HECHIZO FINAL: ")
    console.log(hechizo)

    //Verificación del caster:
    var indexCaster = hechizo.indexCaster;
    var tipoCaster = hechizo.tipoCaster;

    console.log(indexCaster,tipoCaster,tipoObjetivo,indexObjetivo)

    //Calculo Vida Total del objetivo:
    var vidaTotalObjetivo = this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas.vidaMaxima;

    //Añadir Escudos: ESCUDO
    /*
    if(this.sesion.render[tipoObjetivo][indexObjetivo].vida > 0){
      this.sesion.render[tipoObjetivo][indexObjetivo].escudo += (hechizo.escudo_entrante / vidaTotalObjetivo*100);
    }
    */

    //Añadir Vida:
    if(this.sesion.render[tipoObjetivo][indexObjetivo].vida > 0){
        this.sesion.render[tipoObjetivo][indexObjetivo].vida += (hechizo.heal_entrante/vidaTotalObjetivo*100);
    }

    var dañoRestante = hechizo.daño_entrante;

    //Efectuar Daños en escudo:
    for(var i = 0; i < this.sesion.render[tipoObjetivo][indexObjetivo].buff.length; i++){
      if(this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"] > 0){
        //Si el daño rompe el escudo:
        if(this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"] <= dañoRestante){
          dañoRestante -= this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"];
          this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"] = 0;
          break;
        //Si el daño NO rompe el escudo:
        }else{
          this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"] -= dañoRestante;
          dañoRestante = 0;
        }
      }
    }

    // Actualizar valor Escudo :
    this.actualizarEscudo(tipoObjetivo, indexObjetivo);

    // Efectuar Daños en vida:
    this.sesion.render[tipoObjetivo][indexObjetivo].vida -= (dañoRestante/vidaTotalObjetivo*100);

    //AplicarAgro:
    if(tipoObjetivo=="enemigos"){
      this.sesion.render.enemigos[indexObjetivo].agro[hechizo.indexCaster] += hechizo.daño_entrante;
    }

    //Redondeo de vida:
    this.sesion.render[tipoObjetivo][indexObjetivo].vida = Math.round(this.sesion.render[tipoObjetivo][indexObjetivo].vida * 100) / 100;

      if(this.sesion.render[tipoObjetivo][indexObjetivo].vida==NaN){
        console.error("VIDA NAN");
      }

    //Mantener rango de vida:
    if(this.sesion.render[tipoObjetivo][indexObjetivo].vida > 100){
      this.sesion.render[tipoObjetivo][indexObjetivo].vida = 100;
    }
    if(this.sesion.render[tipoObjetivo][indexObjetivo].vida < 0){
      this.sesion.render[tipoObjetivo][indexObjetivo].vida = 0;
    }

    //Reset critico:
    this.estadoControl.critico=false;

    //LOGGER && ANALITICS
    
    //this.loggerService.log("------ ENTRADA ------- ","teal");
    if(hechizo.daño_entrante>0){
      //this.loggerService.log("-----> Daño: "+ hechizo.daño_entrante,"orangered");
      if(tipoCaster=="heroes"){
          this.sesion.render.estadisticasTotal[indexCaster]["daño"] += hechizo.daño_entrante;
      }
    }

    if(hechizo.heal_entrante>0){
      //this.loggerService.log("-----> Heal: "+hechizo.heal_entrante,"lawngreen");
      if(tipoCaster=="heroes"){
        this.sesion.render.estadisticasTotal[indexCaster]["heal"] += hechizo.heal_entrante;
      }
    }

    if(hechizo.escudo_entrante>0){
      //this.loggerService.log("-----> Escudo: "+hechizo.escudo_entrante);
      if(tipoCaster=="heroes"){
        this.sesion.render.estadisticasTotal[indexCaster]["escudo"] += hechizo.escudo_entrante;
      }
    }

    //Elimina al enemigo si esta muerto:
        if(tipoObjetivo=="enemigos"){
            if(this.sesion.render.enemigos[indexObjetivo].vida <=0){
                this.sesion.render.enemigos[indexObjetivo].vida= 0;
                this.enemigoMuerto(indexObjetivo);
                console.log("Enemigo Muerto: "+indexObjetivo);
                //Logger:
                this.loggerService.log("Enemigo Muerto:"+ indexObjetivo);
            }
        }

  }

    //-------------------------------
    // FUNCION HECHIZO
    //-------------------------------
  ejecutarFuncionHechizo(funcion: string, hechizo: any, objetivoEnemigos: any, objetivoHeroes:any): void{

    //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
    var caster;
    var esHeroe = false;
    var esEnemigo = false;
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      if(this.sesion.render.heroes[i].turno){
        esHeroe= true;
        caster= this.sesion.render.heroes[i];
          break;
      }
    }

    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      if(this.sesion.render.enemigos[i].turno){
        esEnemigo= true;
        caster= this.sesion.render.enemigos[i];
        break;
      }
    }

    //Ejecuto acciones en función de la función:
    switch(funcion){
    }

  }

    //-------------------------------
    // FUNCION BUFF
    //-------------------------------
  ejecutarFuncionBuffEnemigo(funcion,indiceEnemigo,Buff): void{

    //Ejecuto acciones en función de la función:
    switch(funcion){
      case "GenerarEsencia":
        var indice;
        indice= parseInt(Buff.origen.slice(1));
        this.sesion.render.heroes[indice].recursoEspecial++;
      break
    }
  }

  /*  ----------------------------------------------
      GESTION DE BUFFOS
  ----------------------------------------------*/

    //-------------------------------
    // ACTUALIZAR ESCUDO
    //-------------------------------
    actualizarEscudo(tipoObjetivo: "heroes"|"enemigos", indexObjetivo: number){

          var escudoTotalValor = 0
          var escudoTotalPercent = 0

          //Iteramos por Buffs para determinar valor de escudo:
          for(var i = 0; i < this.sesion.render[tipoObjetivo][indexObjetivo].buff.length; i++){
            escudoTotalValor += this.sesion.render[tipoObjetivo][indexObjetivo].buff[i]["escudo_valor"];
          }

          //Calculo de escudo Percent:
          if(escudoTotalValor > 0){
            escudoTotalPercent = escudoTotalValor / this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas.vidaMaxima;
          }else{
            escudoTotalPercent = 0;
          }

          //Redondeo Escudo:
          escudoTotalPercent = escudoTotalPercent * 100;
          escudoTotalPercent = Math.round( escudoTotalPercent * 100) / 100;

          //Asignar Escudo:
          this.sesion.render[tipoObjetivo][indexObjetivo].escudo = escudoTotalPercent;

          return;
    }

    //-------------------------------
    //ADD BUFF LANZADO POR HECHIZO
    //-------------------------------
    addBuffHechizo(tipoObjetivo: "heroes"|"enemigos",indexObjetivo: number,hechizo:any):any{

        //Aplicacion de Buffos:
        if(!hechizo.buff_id){return false;}
        if(hechizo.buff_id==0){return false;}

        var arrayBuff = [];
        var buff = {};

        for(var i = 0; i < hechizo.buff_id.length; i++){

        this.loggerService.log("Aplicando BUFF/DEBUFF (ID: "+hechizo.buff_id[i]+")...","yellow");

        buff = Object.assign({}, this.buff.find(j => j.id == Number(hechizo.buff_id[i])))

        buff["duracion"]= buff["duracion"]*this.sesion.jugadores.length;
        buff["critico"]= hechizo.critico;
        buff["fortuna"]= hechizo.fortuna;
        buff["nivelCaster"]= hechizo.nivelCaster;
        buff["tipoCaster"]= hechizo.tipoCaster;
        buff["indexCaster"]= hechizo.indexCaster;
        buff["escudo_valor"]= 0;

        //--------------------------------
        // 1) MODIFICACIÓN DE SALIDA BUFF
        //--------------------------------
        buff = this.modificacionBuffSalida(hechizo.tipoCaster,hechizo.indexCaster,buff);

        console.warn("BUFF SALIDA: ",buff)
        //--------------------------------
        // 2) MODIFICACIÓN DE ENTRADA BUFF
        //--------------------------------
        buff = this.modificacionBuffEntrada(tipoObjetivo,indexObjetivo,buff)
        console.warn("BUFF ENTRADA: ",buff)

        //--------------------------------
        // 3) APLICAR STAT INCREASE
        //--------------------------------
        buff = this.setStatIncreaseBuff(buff,tipoObjetivo,indexObjetivo)

        arrayBuff.push(buff)

        }

        console.warn("ArrayBuffs: ",arrayBuff)
        return arrayBuff;

    } //FIN ADD BUFF POR HECHIZO

    //-------------------------------
    // LANZAR BUFF
    //-------------------------------
    async lanzarBuffos(){

    return new Promise(async (resolve) => {
    //Bloquea los inputs:
    this.appService.setControl("bloqueoBuff");
    this.sesion.render.interfaz.barraAccion.mensajeAccion = "Procesando...";
    this.mostrarBarraAccion(true);

    //Mensaje de palicación de buffos:

    //Genera el array de buffos a aplicar
    var aplicarBuffos={
      enemigos: [],
      heroes: []
    }

    //Itera entre los enemigos:
    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      aplicarBuffos.enemigos[i]= [];
      for(var j=0; j <this.sesion.render.enemigos[i].buff.length; j++){
        aplicarBuffos.enemigos[i][j] = this.sesion.render.enemigos[i].buff[j].id;
      }
    }

    //Itera entre los Heroes:
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      aplicarBuffos.heroes[i]= [];
      for(var j=0; j <this.sesion.render.heroes[i].buff.length; j++){
        aplicarBuffos.heroes[i][j] = this.sesion.render.heroes[i].buff[j].id;
      }
    }

    await this.aplicarBuffos(aplicarBuffos);
    resolve(true)

    })

  }

    //-------------------------------
    // APLICAR BUFF
    //-------------------------------
    async aplicarBuffos(aplicarBuffos: any, resolveGlobal?: any){


    return new Promise((resolve) => {

      if(resolveGlobal === undefined){
        resolveGlobal = resolve;
      }

    //Condicion de desbloqueo (No encontrar buffos por aplicar):
    var desbloqueo=true;

    //Aplicar buffos en los enemigos:
    for(var i=0; i < aplicarBuffos.enemigos.length; i++){

      //Enemigo con buffos pendientes:
      if(aplicarBuffos.enemigos[i].length>0){

        //Salta la aplicación Si el objetivo está abatido:
        if(this.sesion.render.enemigos[i].vida==0){continue;}

        //Verificar el indice del Buff:
        var indiceBuff = aplicarBuffos.enemigos[i].length-1;

        //Iniciar Animacion Buffo:
        //---------------------------
        // 1)  INICIA ANIMACION:
        //---------------------------
        var animacionId =this.buff.find(j => j.id==aplicarBuffos.enemigos[i][aplicarBuffos.enemigos[i].length-1]).animacion_id;
        var animacion = this.animaciones.find(i => i.id== animacionId);
        if(typeof animacion == "undefined"){
            console.warn("No se puede reproducir la animación porque no se encuentra el id asociado")
        }else{

            //Activa Animacion:
            this.sesion.render["enemigos"][i].animacion= animacion;
            this.sesion.render["enemigos"][i].mostrarAnimacion= true;

            //Desactivar Animacion:
            var indexObjetivoProvisional = i;
            setTimeout(()=>{
                this.sesion.render["enemigos"][indexObjetivoProvisional].mostrarAnimacion= false;
                this.forceRender()
            }, 1000*(this.sesion.render["enemigos"][indexObjetivoProvisional].animacion.duracion));
        }//Fin Animacion

        //Ejecuta FUNCION al Buffo:
        this.ejecutarFuncionBuffEnemigo(this.buff.find(j => j.id==aplicarBuffos.enemigos[i][aplicarBuffos.enemigos[i].length-1]).funcion,i,this.sesion.render.enemigos[i].buff[indiceBuff]);

        //Aplica efectos finales BUFF al ENEMIGO:
        this.aplicaBuffFinalEnemigo(i,indiceBuff);

        //Reducir duracion y eliminar si la duración es 0:
        if(this.sesion.render.enemigos[i].buff[indiceBuff].duracion.toString().slice(-1)=="T" && this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1]==-(i+1)){
          //Reducir la duración por T:
          if(this.sesion.render.enemigos[i].buff[indiceBuff].duracion.toString().slice(0,-1)=="0"){
            this.eliminarBuff("enemigos",i,indiceBuff);
          }else{
            this.sesion.render.enemigos[i].buff[indiceBuff].duracion = (parseInt(this.sesion.render.enemigos[i].buff[indiceBuff].duracion.toString().slice(0,-1))-1)+"T";
          }

        }else{
          //Reduce la duración por PT:
          if(this.sesion.render.enemigos[i].buff[indiceBuff].duracion>0){
            this.sesion.render.enemigos[i].buff[indiceBuff].duracion--;
          }else{
            this.eliminarBuff("enemigos",i,indiceBuff);
          }
        }

        //Si el enemigo muere elimina la cola de Buff:
        if(this.sesion.render.enemigos[i].vida <=0){
          this.sesion.render.interfaz.enemigoMuerto.push(i);
          aplicarBuffos.enemigos[i] = [];
        }else{
          //Elimina el ultimo Buff aplicado de la cola de aplicación:
          aplicarBuffos.enemigos[i].splice(aplicarBuffos.enemigos[i].length-1, 1);
        }
          this.forceRender()
      }

    }

    //Aplicar buffos en los heroes:
    for(var i=0; i <aplicarBuffos.heroes.length; i++){

      //Heroe con buffos pendientes:
      if(aplicarBuffos.heroes[i].length>0){

        //Salta la aplicación Si el objetivo está abatido:
        if(this.sesion.render.heroes[i].vida==0){
            aplicarBuffos.heroes[i] = [];
            this.sesion.render.heroes[i].buff = [];
            continue;
        }

        //Verificar el indice del Buff:
        var indiceBuff = aplicarBuffos.heroes[i].length-1;

        //Iniciar Animacion Buffo:
        //---------------------------
        // 1)  INICIA ANIMACION:
        //---------------------------
        var animacionId =this.buff.find(j => j.id==aplicarBuffos.heroes[i][aplicarBuffos.heroes[i].length-1]).animacion_id;
        var animacion = this.animaciones.find(i => i.id== animacionId);
        if(typeof animacion == "undefined"){
            console.warn("No se puede reproducir la animación porque no se encuentra el id asociado")
        }else{

            //Activa Animacion:
            this.sesion.render["heroes"][i].animacion= animacion;
            this.sesion.render["heroes"][i].mostrarAnimacion= true;

            //Desactivar Animacion:
            var indexObjetivoProvisional = i;
            setTimeout(()=>{
                this.sesion.render["heroes"][indexObjetivoProvisional].mostrarAnimacion= false;
                this.forceRender()
            }, 1000*(this.sesion.render["heroes"][indexObjetivoProvisional].animacion.duracion));
        }//Fin Animacion


        //Ejecutar FUNCION al Buffo:
        this.ejecutarFuncionBuffHeroe(this.buff.find(j => j.id==aplicarBuffos.heroes[i][aplicarBuffos.heroes[i].length-1]).funcion,i,this.sesion.render.heroes[i].buff[indiceBuff]);

        //Aplica efectos finales BUFF al ENEMIGO:
        this.aplicaBuffFinalHeroe(i,indiceBuff);

        //Reducir duracion y eliminar si la duración es 0:
        if(this.sesion.render.heroes[i].buff[indiceBuff].duracion.toString().slice(-1)=="T" && this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1]==i){
          //Reducir la duración por T:
          if(this.sesion.render.heroes[i].buff[indiceBuff].duracion.toString().slice(0,-1)=="0"){
            this.eliminarBuff("heroes",i,indiceBuff);
          }else{
            this.sesion.render.heroes[i].buff[indiceBuff].duracion = (parseInt(this.sesion.render.heroes[i].buff[indiceBuff].duracion.toString().slice(0,-1))-1)+"T";
          }

        }else{
          //Reduce la duración por PT:
          if(this.sesion.render.heroes[i].buff[indiceBuff].duracion>0){
            this.sesion.render.heroes[i].buff[indiceBuff].duracion--;
          }else{
            this.eliminarBuff("heroes",i,indiceBuff);
          }
        }

        //Si el heroe muere elimina la cola de Buff:
        if(this.sesion.render.heroes[i].vida <=0){
          this.sesion.render.interfaz.heroeMuerto.push(i);
          aplicarBuffos.heroes[i] = [];
          this.heroeAbatido(i);
        }else{
          //Elimina el ultimo Buff aplicado:
          aplicarBuffos.heroes[i].splice(aplicarBuffos.heroes[i].length-1, 1);
        }
        this.forceRender()
      }
    }

    //Verifica si quedan objetivos Enemigos por aplicar buffos:
    for(var i=0; i <aplicarBuffos.enemigos.length; i++){
      if(aplicarBuffos.enemigos[i].length>0){
        //Enemigo con buffos pendientes:
        var desbloqueo= false;
      }
    }

    //Verifica si quedan objetivos Aliados por aplicar buffos:
    for(var i=0; i <aplicarBuffos.heroes.length; i++){
      if(aplicarBuffos.heroes[i].length>0){
        //Heroe con buffos pendientes:
        var desbloqueo= false;
      }
    }

    if(!desbloqueo){
      setTimeout(async ()=>{
            await this.aplicarBuffos(aplicarBuffos, resolveGlobal);
      }, this.velocidadBuff);
    }else{
        
      //Elimina a los enemigos que hayan muerto por buff:
      this.enemigoMuerto(-1);

      //Desbloquea y termina la aplicación de buffos:
      this.appService.setControl("desbloqueoBuff");
      this.mostrarBarraAccion(false);

      if(resolveGlobal){
         resolveGlobal(true)
         console.error("RESOLVE GLOBAL")
      }else{
        //resolve(true)
      }
    }

    })

  }//Fin aplicar Buff

  //---------------------------
  // APLICACION FINAL (BUFF)
  //---------------------------
  //Aplica efectos FINAL BUFF al HEROE:
  aplicaBuffFinalHeroe(indiceHeroe,indiceBuff):void{

    //Calculo Vida Total del objetivo:
    var vidaTotalObjetivo = this.sesion.render.heroes[indiceHeroe].estadisticas.vidaMaxima;

    var abatido = false;
    if(this.sesion.render.heroes[indiceHeroe].vida <= 0){
        abatido = true;
    }

    //Añadir Escudos:
    /*
    if(!abatido){
        this.sesion.render.heroes[indiceHeroe].escudo += (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t_entrante/vidaTotalObjetivo*100);
    }
    */

    //Añadir Vida:
    if(!abatido){
        this.sesion.render.heroes[indiceHeroe].vida += (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t_entrante/vidaTotalObjetivo*100);
    }

    //Efectuar Daños:
    this.sesion.render.heroes[indiceHeroe].vida -= (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].daño_t_entrante/vidaTotalObjetivo*100);

    //Redondeo de vida:
    this.sesion.render.heroes[indiceHeroe].vida = Math.round(this.sesion.render.heroes[indiceHeroe].vida * 100) / 100;

    //Mantener rango de vida:
    if(this.sesion.render.heroes[indiceHeroe].vida <= 0){
      this.sesion.render.heroes[indiceHeroe].vida= 0;
    }

    if(this.sesion.render.heroes[indiceHeroe].vida > 100){
      this.sesion.render.heroes[indiceHeroe].vida = 100;
    }

    //Redondeo de vida:
    //this.sesion.render.heroes[indiceHeroe].vida = Math.round(this.sesion.render.heroes[indiceHeroe].vida * 100) / 100;

    //Mantener rango de recurso:
    if(this.sesion.render.heroes[indiceHeroe].recurso > 100){
      this.sesion.render.heroes[indiceHeroe].recurso = 100;
    }

    //LOGGER && ANALITICS:
    this.loggerService.log("------ BUFF/DEBUFF (ID: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].id+", Objetivo: "+this.sesion.render.heroes[indiceHeroe].nombre+") ------- ","violet");
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].dano_t>0){
      this.loggerService.log("-----> Daño: "+ this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].dano_t,"orangered");
    }
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t>0){
      this.loggerService.log("-----> Heal: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t,"lawngreen");
      if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){

        this.sesion.render.estadisticasTotal[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))]["heal"] += this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t;

      }
    }
        //this.sesion.render.estadisticas[parseInt(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].daño[this.sesion.render.estadisticas[parseInt(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].daño.length-1]+= this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t_entrante;
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t>0){
      this.loggerService.log("-----> Escudo: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t);
      if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){
        this.sesion.render.estadisticasTotal[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))]["escudo"] += this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t;
      }
    }


  }//Fin aplicar buff Final heroe

  //Aplica efectos FINAL BUFF al ENEMIGO:
  aplicaBuffFinalEnemigo(indiceEnemigo,indiceBuff):void{

        var buff = this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff];

    //Calculo Vida Total del objetivo:
    var vidaTotalObjetivo = this.sesion.render.enemigos[indiceEnemigo].estadisticas.vidaMaxima;

    //Añadir Escudos:
    this.sesion.render.enemigos[indiceEnemigo].escudo += (this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t_entrante/vidaTotalObjetivo*100);

    //Añadir Vida:
    this.sesion.render.enemigos[indiceEnemigo].vida += (this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].heal_t_entrante/vidaTotalObjetivo*100);

    //Efectuar Daños:
    this.sesion.render.enemigos[indiceEnemigo].vida -= (this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t_entrante/vidaTotalObjetivo*100);


    //AplicarAgro:
    this.sesion.render.enemigos[indiceEnemigo].agro[buff.indexCaster] += buff.daño_t_entrante;

    //Aplicar Agro:
        /*
    if(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(0,1)=="H"){
      this.sesion.render.enemigos[indiceEnemigo].agro[parseInt(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))] += this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t;
    }
        */

    //Redondeo de vida:
    this.sesion.render.enemigos[indiceEnemigo].vida = Math.round(this.sesion.render.enemigos[indiceEnemigo].vida * 100) / 100;

    //Mantener rango de vida:
    if(this.sesion.render.enemigos[indiceEnemigo].vida > 100){
      this.sesion.render.enemigos[indiceEnemigo].vida = 100;
    }

    if(this.sesion.render.enemigos[indiceEnemigo].vida < 0){
      this.sesion.render.enemigos[indiceEnemigo].vida = 0;
    }

    //LOGGER:
    this.loggerService.log("------ BUFF/DEBUFF (ID: "+buff.id+", Objetivo: "+this.sesion.render.enemigos[indiceEnemigo].nombre+") ------- ","violet");

        //LOG DAÑO
    if(buff.daño_t_entrante>0){
      this.loggerService.log("-----> Daño (Buffo): "+ this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t_entrante,"orangered");

            //Guardar en estadisticas de daño:
      if(buff.tipoCaster=="heroes"){

                this.sesion.render.estadisticasTotal[buff.indexCaster]["daño"] += buff.daño_t_entrante;
      }
    }

        //LOG HEAL
    if(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].heal_t_entrante>0){
      this.loggerService.log("-----> Heal (Buffo): "+this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].heal_t_entrante,"lawngreen");
    }

        //LOG ESCUDO
    if(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t_entrante>0){
      this.loggerService.log("-----> Escudo (Buffo): "+this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].escudo_t_entrante);
    }


    //Evaluar enemigo muerto:
    if(this.sesion.render.enemigos[indiceEnemigo].vida <0){
      this.sesion.render.enemigos[indiceEnemigo].vida= 0;
      console.log("Enemigo Muerto: "+indiceEnemigo);
      this.loggerService.log("Enemigo muerto: "+this.sesion.render.enemigos[indiceEnemigo].nombre,"red");
    }
  }

    //-------------------------------
    // FUNCION BUFF
    //-------------------------------
  //Ejecutar FUNCION de BUFF sobre HEROE:
  ejecutarFuncionBuffHeroe(funcion,indiceHeroe,Buff): void{

    //Ejecuto acciones en función de la función:
    switch(funcion){
      case "":
      break
    }
  }

    //-------------------------------
    // ELIMINAR BUFF
    //-------------------------------

  eliminarBuff(tipoObjetivo:"heroes"|"enemigos",indexObjetivo:number,indiceBuff:number):void{

    var buff = this.sesion.render[tipoObjetivo][indexObjetivo].buff[indiceBuff];

    //Evita eliminación si queda duracion:
    if(buff.duracion > 0){
      return;
    }

    //Si tiene efectos de Stat_INC:
    //Elimina efectos de stat increase:
    if(buff.stat_inc!=0 && buff.stat_inc!=undefined && buff["statIncrease"]!=undefined){
      console.warn("Eliminando Efectos Stat_INC: ",buff)
      //Devolver los valores modificados:
      for(const stat in buff["statIncrease"]){
        this.sesion.render[tipoObjetivo][indexObjetivo].estadisticas[stat] -= buff["statIncrease"][stat];
      }
    }

    this.sesion.render[tipoObjetivo][indexObjetivo].buff.splice(indiceBuff,1);

    //Actualización de escudos:
    this.actualizarEscudo(tipoObjetivo, indexObjetivo);

    return;
  }

  /*  ----------------------------------------------
      GESTION DE MUERTES
  ----------------------------------------------*/

  //Elimina la instancia del enemigo con el indice seleccionado y todos los que estan en cola:
  enemigoMuerto(indiceEnemigo?):void{


    //Agregar indice de enemigo a la cola de eliminacion:
    if(indiceEnemigo >= 0 && indiceEnemigo != undefined){
      this.sesion.render.interfaz.enemigoMuerto.push(indiceEnemigo);

      //EJECUTAR EVENTO ENEMIGO MUERTO:
      if(this.sesion.render.enemigos[indiceEnemigo]?.evento_muerte_id){
               this.eventosService.ejecutarEvento(this.sesion.render.enemigos[indiceEnemigo]?.evento_muerte_id,"Mazmorra");
      }

    }


    if(this.sesion.render.interfaz.enemigoMuerto.length==0){return;}
    if(this.estadoControl.estado!="seleccionAccion"){return;}


    console.log("Eliminando enemigos:");
    console.log(this.sesion.render.interfaz.enemigoMuerto);

    //Ordenar el vector:
    this.sesion.render.interfaz.enemigoMuerto.sort(function(a,b){return a - b;});

    //Eliminar instancia de enemigos muertos:
    for (var i = this.sesion.render.interfaz.enemigoMuerto.length -1; i >= 0; i--){

      //Eliminar Objetivo Predefinido si el enemigo ha muerto:
      for(var j=0; j <this.sesion.render.interfaz.objetivoPredefinido.enemigos.length;j++){
        if(this.sesion.render.interfaz.objetivoPredefinido.enemigos[j]==this.sesion.render.interfaz.enemigoMuerto[i]){
          this.sesion.render.interfaz.objetivoPredefinido.enemigos.splice(j,1);

          if(this.sesion.render.interfaz.objetivoPredefinido.enemigos.length==0){
            this.estadoControl.detenerHechizo= true;
          }else{
            //WARNING MEJORA: RESTARLE 1 AL RESTO DE OBJETIVOS PREDEFINIDOS POR ENCIMA DEL QUE SE QUITA.
          }

        }
      }

      //Verfica si el enemigo a eliminar tiene el turno:
      if(this.sesion.render.enemigos[this.sesion.render.interfaz.enemigoMuerto[i]].turno){

        if(this.sesion.render.interfaz.enemigoMuerto[i] != this.sesion.render.enemigos.length -1){
          //Activa el turno del siguiente enemigo que siga vivo:
          console.log(this.sesion.render.enemigos[this.sesion.render.interfaz.enemigoMuerto[i]+1]);
          if(this.sesion.render.enemigos[this.sesion.render.interfaz.enemigoMuerto[i]+1]){
            this.sesion.render.enemigos[this.sesion.render.interfaz.enemigoMuerto[i]+1].turno = true;
            this.sesion.render.registroTurno.push(-(this.sesion.render.interfaz.enemigoMuerto[i]+2));
            this.sesion.render.enemigos[this.sesion.render.interfaz.enemigoMuerto[i]+1].acciones = 2;
            this.turnoModificado=true;
          }else{
            //Activa el turno del primer heroe:
            console.log("Paso primer heroe por muerte de todos los enemigos restantes...");
            this.sesion.render.heroes[0].turno = true;
            this.sesion.render.heroes[0].acciones = 2;
            this.turnoModificado=true;
            this.activarTemporizador();
          }
        }else{  //El ultimo enemigo ha muerto:
            //Activa el turno del primer heroe:
            console.log("Paso primer heroe por muerte del ultimo...");
            this.sesion.render.heroes[0].turno = true;
            this.sesion.render.heroes[0].acciones = 2;
            this.turnoModificado=true;
            this.activarTemporizador();
        }
      }
      //Eliminar el enemigo:
      this.sesion.render.enemigos.splice(this.sesion.render.interfaz.enemigoMuerto[i],1);
    }

    //Resetea el vector de enemigos para eliminar:
    this.sesion.render.interfaz.enemigoMuerto = [];
    this.forceRender();
  }

  /*  ----------------------------------------------
      GESTION DE RNG
  ----------------------------------------------*/

  activarRNG(){

    if(this.estadoControl.rngEncadenado){
      //this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: this.sesion.render, emisor: this.sesion.render.personaje});
            console.log("RNG ENCADENADO");
            this.lanzarHechizo();
            return;
        }

    //this.estadoControl.estado="rng";
    //this.estadoControl.rng=0;
    //this.estadoControl.rngEncadenado=true;

    console.log("MOSTRANDO RNG")
    this.interfazService.activarInterfazRNG(this.sesion.render.heroes[this.estadoControl.heroePropioIndex].estadisticas.probabilidadCritico);

  }

  desactivarRNG(){
    this.rngService.desactivarRng();
  }

  //Función de administración RNG:
  evaluarRNG(valorRng):any{
    var multiplicador= 1;
    multiplicador= 1+ valorRng / 6;
    if(valorRng==6){
      this.estadoControl.critico= true;
    }
    if(valorRng==1){multiplicador=0}
    return multiplicador;
  }

  /*  ----------------------------------------------
      GESTION DE LOGGER
  ----------------------------------------------*/

  loggerObs(comando):void{

    console.log("Evento Logger: "+comando.comando);
    console.log("Valor: "+comando.valor);


    switch(comando.comando){
      case "activar evento":
        //this.eventosService.activarEvento(comando.valor);
        this.loggerService.log("-------------- Pasando Turno ------------------");
      break;

      case "console enemigos":
        console.log("ENEMIGOS: ");
        console.log(this.enemigos);
      break;

      case "console buff":
        console.log("BUFF: ");
        console.log(this.buff);
      break;

      case "console heroes hech":
        console.log("HEROES HECH: ");
        console.log(this.hechizos);
      break;

      case "cambiar sala":
        this.cambiarSala(comando.valor);
        this.estadoControl.estado="seleccionAccion";
        this.loggerService.toggleLogger(false);
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
      break;

      case "add enemigo":
        this.addEnemigo(comando.valor);
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
      break;

      case "eliminar enemigo":
        this.enemigoMuerto(comando.valor-1);
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
      break;

      case "restringir accion false":
        this.restringirAcciones= false;
      break;

      case "restringir accion true":
        this.restringirAcciones= true;
      break;

      case "reset":
        this.socketService.enviarSocket("resetMazmorra",{peticion: "resetMazmorra", comando: "resetMazmorra", contenido: this.sala.nombre});
      break;
    }

        //Si toggle Logger:
        if(comando.toggle){
            this.loggerService.toggleLogger(false);
            this.estadoControl.estado="seleccionAccion";
        }

  }

  /*  ----------------------------------------------
      MANEJO DE COMANDOS
    ----------------------------------------------*/

  activarComandoSocket():void{
    this.comandoSocketActivo = true;
    return;
  }

  desactivarComandoSocket():void{
    this.comandoSocketActivo = false;
    return;
  }

  comprobarConectado():void{
  }

  /*  ----------------------------------------------
      GESTION DE EVENTOS
    ----------------------------------------------*/

  eventosObs(comando): void{
  }


  /*  ----------------------------------------------
      GESTION DE INTERFAZ
    ----------------------------------------------*/

  interfazObs(comando):void{

    switch(comando.comando){
      case "cancelar":
        this.estadoControl.estado="seleccionAccion";
        this.seleccionarEnemigos = false;
        this.seleccionarHeroes = false;
        this.cancelarObjetivo();
      break;

      case "realizarMovimiento":
        this.realizarMovimiento(comando.valor);
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "realizarMovimiento", contenido: comando.valor});
      break;

      case "seleccionarHechizo":

        console.log("Seleccionando Hechizo: "+comando.valor);

        if(this.verificarCasteo(comando.valor)){

          this.seleccionObjetivo(comando.valor);

          switch(this.estadoControl.tipoObjetivo){
            case "EU":
              if(this.sesion.render.enemigos[0]==undefined){
                  this.appService.mostrarDialogo("Informativo",{titulo: "No se puede lanzar el hechizo",contenido: "No hay objetivos posibles para lanzar el hechizo. Cancelando lanzamiento..."})
                this.interfazService.cancelarHechizo();
                return;
              }
              this.seleccionarEnemigos = true;
              console.log("SELECCIONANDO ENEMIGOS")
              this.interfazService.setPantallaInterfaz("seleccionObjetivoEnemigo");
            break;
            case "EM":
              if(this.sesion.render.enemigos[0]==undefined){
                  this.appService.mostrarDialogo("Informativo",{titulo: "No se puede lanzar el hechizo",contenido: "No hay objetivos posibles para lanzar el hechizo. Cancelando lanzamiento..."})
                  this.interfazService.cancelarHechizo();
                  return;
              }
              this.seleccionarEnemigos = true;
              this.interfazService.setPantallaInterfaz("seleccionObjetivoEnemigo");
            break;
            case "AU":
              this.seleccionarHeroes = true;
              this.interfazService.setPantallaInterfaz("seleccionObjetivoAliado");
            break;
            case "AM":
              this.seleccionarHeroes = true;
              this.interfazService.setPantallaInterfaz("seleccionObjetivoAliado");
            break;
          }

        }
      break;

      case "checkFortuna":
        this.seleccionarEnemigos = false;
        this.seleccionarHeroes = false;
        this.activarRNG();
      break;

      case "lanzarHechizo":
        var critico = comando.valor.critico
        var fortuna = comando.valor.fortuna
        this.lanzarRng(critico,fortuna);
        this.forceRender();

        //CHECK TUTORIAL:
        if(this.sesion.variablesMundo.tuto_ataque == "true"){
            this.eventosService.ejecutarEvento(6,"General")
        }

      break;

      case "lanzarHechizoEnemigo":
        this.seleccionarEnemigos = false;
        this.seleccionarHeroes = false;

        //this.sesion.render.heroes[comando.valor["indexHeroe"]].objetivo = true;
        var configuracionHechizo: ConfiguracionHechizo = this.configurarHechizo()
        console.warn("HECHIZO ID: ", comando)
        var indexHechizo = this.hechizos.findIndex(i => i.id == comando.valor.hechizo_id);
        //if(!configuracionHechizo){console.error("ERROR EJECUTANDO HECHIZO: indexHechizo == -1"); return;}
        configuracionHechizo.indexHechizo = indexHechizo;
        configuracionHechizo.indexCaster = comando.valor.indexEnemigo;
        configuracionHechizo.objetivosHeroes = [comando.valor.indexHeroe]

        console.warn("CONFIGURACION ENEMIGO: ",configuracionHechizo)
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizoEnemigo", contenido: configuracionHechizo});

        this.lanzarHechizo(configuracionHechizo).then(() => {
          //Timeout para esperar al socket de los jugadores:
          setTimeout(()=> {
            this.activarEnemigo(comando.valor["indexEnemigo"])
          },1500)
        });

        //this.activarRNG();
      break;

      case "fallarHechizo":

        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "fallarHechizo", contenido: comando.valor.energia});
        this.fallarHechizo(comando.valor.energia);
        this.cancelarObjetivo();

        //CHECK TUTORIAL:
        if(this.sesion.variablesMundo.tuto_ataque == "true"){
            this.eventosService.ejecutarEvento(6,"General")
        }

      break;

      case "finalizarActivacionEnemigo":
        this.pasarTurno();
      break;

      case "reanimar":
        var indexHeroe = comando.valor["heroeIndex"];
        if(indexHeroe>=0){
            this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "reanimarHeroe", contenido: indexHeroe});
            this.reanimarHeroe(indexHeroe);
        }
      break;

    }
  }

  seleccionEnemigo(indexEnemigo):void{

    console.log("Selecionando Enemigo "+indexEnemigo);

    if(this.estadoControl.estado=="seleccionAccion"){
        console.log("Mostrando Detalle");
        this.interfazService.activarInterfazDetalle("enemigo",this.sesion.render.enemigos[indexEnemigo]);
        return;
    }

    //Si castea heroe:
    if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoEnemigo"){

      if(this.estadoControl.tipoObjetivo=="EU"){
        this.estadoControl.objetivosEnemigos = [indexEnemigo];
      }else{

        //Ver si el objetivo ya esta seleccionado para hacer toggle:
        var posicionArray = this.estadoControl.objetivosEnemigos.indexOf(indexEnemigo);
        if(posicionArray==-1){
          //El objetivo no esta seleccionado --> Se añade al array:
          this.estadoControl.objetivosEnemigos.push(indexEnemigo);
        }else{
          //El objetivo está seleccionado --> Se añade elimina del array:
          this.estadoControl.objetivosEnemigos.splice(posicionArray,1);
        }
      }

      //Check de objetivo Seleccionado para habilitar interfaz Service:
      this.interfazService.setObjetivoSeleccionado(false);
      if(this.estadoControl.objetivosEnemigos.length > 0){
        this.interfazService.setObjetivoSeleccionado(true);
      }

    } //Fin pantalla "seleccionObjetivoEnemigo"

    return;
  }

  seleccionarHeroe(indexHeroe):void{

    console.log("Heroe seleccionado: ");

    if(this.estadoControl.estado=="seleccionAccion"){
      console.warn("Mostrando Detalle",this.sesion.render.heroes[indexHeroe]);
      this.interfazService.activarInterfazDetalle("heroe",this.sesion.render.heroes[indexHeroe]);
    }

    //Si castea un heroe:
    if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoAliado"&& (this.estadoControl.esTurnoHeroe)){


      if(this.estadoControl.tipoObjetivo=="AU"){
        this.estadoControl.objetivosHeroes = [indexHeroe];
      }else{

        //Ver si el objetivo ya esta seleccionado para hacer toggle:
        var posicionArray = this.estadoControl.objetivosHeroes.indexOf(indexHeroe);
        if(posicionArray==-1){
          //El objetivo no esta seleccionado --> Se añade al array:
          this.estadoControl.objetivosHeroes.push(indexHeroe);
        }else{
          //El objetivo está seleccionado --> Se añade elimina del array:
          this.estadoControl.objetivosHeroes.splice(posicionArray,1);
        }
      }

      //Check de objetivo Seleccionado para habilitar interfaz Service:
      this.interfazService.setObjetivoSeleccionado(false);
      if(this.estadoControl.objetivosHeroes.length > 0){
        this.interfazService.setObjetivoSeleccionado(true);
      }
    } //Fin pantall "seleccionObjetivoAliado"

    return;
  }

  /*  ----------------------------------------------
      GESTION CONTROLES TACTILES
  ----------------------------------------------*/

  routerInterfaz(pantalla): void{

    switch(pantalla){
      case "elegirHechizo":
        //this.estadoControl.estado="eligiendoHechizo";

        //Inicializar interfazService con datos de hechizos:
        this.interfazService.setHechizos(this.hechizos);
        this.interfazService.setBuffs(this.buff);
        this.interfazService.setEnemigos(this.enemigos);

                //Detecta de quien es el turno:
                var indexHeroeControlado = -1;
                if(this.permitirMultiControl){
                    for(var i = 0; i < this.sesion.render.heroes.length; i++){
                        if(this.sesion.render.heroes[i].turno){
                            indexHeroeControlado = i;
                            break;
                        }
                    }
                }else{
                    indexHeroeControlado = this.estadoControl.heroePropioIndex;
                }

                //SI ERROR
                if(indexHeroeControlado < 0 || indexHeroeControlado > 4 || indexHeroeControlado == undefined){ console.error("Turno de heroe no encontrado en 'routerInterfaz' (elegirHechizo)"); return; }

                var energiaDisponible= this.sesion.render.heroes[indexHeroeControlado].energia;

                //Rellenar vector de imagenes de hechizos:
                var hechizosEquipadosID = this.sesion.jugadores[indexHeroeControlado].personaje.hechizos.equipados
                var hechizosEquipadosImagenID = [0,0,0,0,0];
                var hechizosEquipadosEnergia = [0,0,0,0,0];
                var hechizosEquipadosCooldown = this.sesion.render.heroes[indexHeroeControlado].cooldown;
                var hechizosEquipados= [];

                for(var i=0; i < hechizosEquipadosID.length; i++){
                    hechizosEquipadosImagenID[i]= this.hechizos.find(j => j.id == hechizosEquipadosID[i])["imagen_id"];
                    hechizosEquipadosEnergia[i]= this.hechizos.find(j => j.id == hechizosEquipadosID[i])["recurso"];
                    hechizosEquipados.push(this.hechizos.find(j => j.id == hechizosEquipadosID[i]));
                }
        this.interfazService.activarInterfazHechizos(hechizosEquipadosID, hechizosEquipadosImagenID,hechizosEquipadosEnergia,energiaDisponible,hechizosEquipados,hechizosEquipadosCooldown,this.sesion.render.heroes[indexHeroeControlado]);
      break;

      case "elegirMovimiento":
                //Detecta de quien es el turno:
                var indexHeroeTurno = -1;
                for(var i = 0; i < this.sesion.render.heroes.length; i++){
                    if(this.sesion.render.heroes[i].turno){
                        indexHeroeTurno = i;
                        break;
                    }
                }
        console.log("MOVIMIENTO")
        this.interfazService.activarInterfazMovimiento(5,this.sesion.render.heroes[indexHeroeTurno].energia);
      break;
    }

    return;
  }

  //Se lanza el hechizo despues del Rol de fortuna y Critico:
  lanzarRng(critico:boolean, fortuna: boolean):void{

    this.estadoControl.critico= critico;
    this.estadoControl.fortuna= fortuna;

    var configuracionHechizo = this.configurarHechizo();
    if(!configuracionHechizo){return;}
    this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: configuracionHechizo});
    this.lanzarHechizo(configuracionHechizo);
    //this.forceRender();
    return;
  }

    activarEnemigo(indexEnemigoActivado:number){

        this.checkTurno();
        console.warn("ACTIVACION: ", this.estadoControl,this.sesion.render.indexActivacionEnemigo,this.permitirMultiControl)

      //Evita la activación si no es turno de enemigo:
        if(!this.estadoControl.esTurnoEnemigo){
            return;}
        if(this.estadoControl.esTurnoHeroe){
            return;}

      //Evita la activación si no le toca la activación al heroe:
      if( this.estadoControl.heroePropioIndex!=this.sesion.render.indexActivacionEnemigo && !this.permitirMultiControl){ 
          return; }

        console.warn("Activando Enemigos: ",indexEnemigoActivado,"(Index)",this.sesion.render.indexActivacionEnemigo,"(IndexActivacion)");
        if(this.sesion.render.enemigos[indexEnemigoActivado]){
            this.interfazService.setRender(this.sesion.render)
            this.interfazService.activarInterfazAccionesEnemigo(this.sesion.render.enemigos,this.sesion.render.heroes,indexEnemigoActivado);
        }else{
            console.warn("Enemigos con index ",indexEnemigoActivado," no encontrado. Evitando activar acciones de enemigo");
        }

        this.forceRender();

    }

    activarDialogo(){
    //this.appService.mostrarDialogo("Informativo",{contenido:"Opción no disponible"})
    this.appService.mostrarDialogo("Mision",{titulo: "Esto es un titulo",contenido:["El usuario o la contraseña no son validos.","que tal"],opciones:["Hola","adios"]});
    }

    realizarMovimiento(costeEnergia){
        //Detecta de quien es el turno:
        var indexHeroeTurno = -1;
        for(var i = 0; i < this.sesion.render.heroes.length; i++){
            if(this.sesion.render.heroes[i].turno){
                indexHeroeTurno = i;
                break;
            }
        }

        this.sesion.render.heroes[indexHeroeTurno].energia -= costeEnergia;

        if(this.sesion.render.heroes[indexHeroeTurno].energia < 0){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia > 100){
            this.sesion.render.heroes[indexHeroeTurno].energia = 100;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia==undefined
        || this.sesion.render.heroes[indexHeroeTurno].energia==null){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }

        this.sesion.render.heroes[indexHeroeTurno].energiaFutura = this.sesion.render.heroes[indexHeroeTurno].energia + this.parametros.regenEnergiaTurno;

        //Verificar valores de energiaFutura en los rangos:
        if(this.sesion.render.heroes[indexHeroeTurno].energiaFutura < 0){
            this.sesion.render.heroes[indexHeroeTurno].energiaFutura = 0;
        }

        if(this.sesion.render.heroes[indexHeroeTurno].energiaFutura > 100){
            this.sesion.render.heroes[indexHeroeTurno].energiaFutura = 100;
        }

        //CHECK TUTORIAL:
        if(this.sesion.variablesMundo.tuto_movimiento == "true"){
            this.eventosService.ejecutarEvento(5,"General")
        }
    }

  heroeAbatido(indexHeroe: number){

    console.log("HEROE ABATIDO: ",indexHeroe);
    //Eliminar buffos del heroe abatido:
    this.sesion.render.heroes[indexHeroe].buff = [];

    //Reduce la energia y energia Futura a 0:
    this.sesion.render.heroes[indexHeroe].energia = 0;
    this.sesion.render.heroes[indexHeroe].energiaFutura = 0;

    //Enviar Evento Heroe abatido:
    if(!this.comandoSocketActivo){
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "heroeAbatido", contenido: indexHeroe});
    }

  }//FIN HEROE ABATIDO

  reanimarHeroe(indexHeroe:number){
    //RESTAURAR VIDA HEROE:
    this.sesion.render.heroes[indexHeroe].vida = this.parametros.vidaReanimar;

    //RESTAURAR ENERGIA HEROE:
    this.sesion.render.heroes[indexHeroe].energia = this.parametros.energiaReanimar;
    this.sesion.render.heroes[indexHeroe].energiaFutura = this.parametros.energiaReanimar+this.parametros.regenEnergiaTurno;
    this.forceRender();

  }//FIN REANIMAR HEROE

  mostrarEstadisticas(){
    this.interfazService.activarEstadisticas(this.sesion.render.estadisticasTotal, this.sesion.jugadores);
    return;
  }


  activarTemporizador(){
    if(!this.habilitarTemporizador){return;}
    this.tiempoActual = this.tiempoMaxTurno;
    console.warn("Activando Temporizador: ",this.tiempoMaxTurno)
    if(!this.temporizador){

     this.zone.runOutsideAngular(() => {
        this.temporizador = setInterval(() => {
          this.tiempoActual--;
          if(this.tiempoActual == 0){
            this.tiempoActual = this.tiempoMaxTurno;
            this.pasarTurno();
          }
        },1000)
      });

    }
  }

  resetTemporizador(){
    this.tiempoActual = this.tiempoMaxTurno;
  }

  desactivarTemporizador(){
    this.tiempoActual = this.tiempoMaxTurno;
    clearInterval(this.temporizador);
    this.temporizador = false;
  }

    lanzarEventoMazmorra(tipo,mensaje,eventoId,elementoId){
        
        const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: mensaje,contenido: "Para realizar esta accion tienes que estar adyacente a la ubicación y ser tu turno.", deshabilitado: !this.estadoControl.esTurnoPropio});

        dialogo.afterClosed().subscribe(async (result) => {
          console.log(result);
          if(result){
                await this.eventosService.actualizarEventos();
                if(!this.sesion.render.mazmorra["interactuado"]){
                    this.sesion.render.mazmorra["interactuado"] = [];
                }
                this.sesion.render.mazmorra["interactuado"].push(elementoId);
                this.eventosService.ejecutarEvento(eventoId,"Mazmorra");
                this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "actualizarInteractuado", contenido: this.sesion.render.mazmorra["interactuado"]});
          }
        })

    }

    actualizarInteractuado(arrayInteractuado){
        this.sesion.render.mazmorra["interactuado"] = arrayInteractuado;
        return;
    }

    abandonarMazmorra(){
        this.sesion.estadoSesion = "inmap";
        var alguienTieneTurno = false;
        for(var i = 0; i < this.sesion.render.heroes.length; i++){
            if(this.sesion.render.heroes[i].turno){
                alguienTieneTurno = true;
            }
        }
        if(!alguienTieneTurno){
            this.sesion.render.heroes[0].turno = true;
        }
        this.sesion.render.mazmorra.iniciada = false;
        this.appService.setSesion(this.sesion);
        //this.socketService.enviarSocket("abandonarMazmorra",{});
        this.appService.setPantallaApp("inmap");
    }

}






