
import { Injectable, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../app.service';
import { LoggerService } from '../logger/logger.service';
import { PausaService } from '../pausa/pausa.service';
import { EventosService } from '../eventos/eventos.service';
import { RngService } from '../rng/rng.service';
import { InterfazService } from '../interfaz/interfaz.service';
import { Subject } from 'rxjs';
import * as cloneDeep from 'lodash/cloneDeep';
//import { cloneDeep } from 'lodash/cloneDeep';
import { HttpClient } from "@angular/common/http"
import { SocketService } from '../socket/socket.service';
import { Subscription } from "rxjs";

//import { ElectronService } from 'ngx-electron';
import { RenderMazmorra} from './render.class';

@Injectable({
  providedIn: 'root'
})

export class MazmorraService implements OnInit{

  //Variables generales:
  public cuenta: any;
  public perfil: any;
  public sesion: any;
  public heroeIndex: number;
  public esTurnoPropio: boolean = false;

  public sala: any = {};
  public dispositivo= "";
  public partidaIniciada= false;

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
  private personaje:any //Pendiente Decomision.

  //Parametros de clonfiguracion:
  private velocidadBuff: number = 2000;
  private velocidadHechizo: number = 2000;

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

  //OPCIONESE DE DEBUG:
  private restringirAcciones = false;
  private restringirRecurso = true;
  private restringirRNG = false;
  private restringirTurno = false;
  private forzarGeneradoRender = true;
  public permitirMultiControl = false;

  //Variables Isometrico:
  public estiloIsometrico: any = {};

  //Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription

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

    constructor(private appService: AppService/*, private electronService: ElectronService*/, private loggerService: LoggerService, private pausaService: PausaService,private rngService: RngService, private interfazService: InterfazService,private eventosService: EventosService, private http:HttpClient,private socketService:SocketService) {

  }

  ngOnInit(){

    //Suscripcion Socket:
        /*
        this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
          if(data.emisor== this.appService.getCuenta().then((result) => {return result.nombre}) && this.appService.getCuenta().then((result) => {return result.tipo})==data.tipoEmisor){console.log("EVITANDO "+data.peticion);return;}
          switch(data.peticion){
            case "log":
              console.log("Peticion: "+data.peticion);
                console.log("Contenido: ");
                console.log(data.contenido);
            break;
            //case "estadoSala":
            //  console.log("Peticion: "+data.peticion);
              //  console.log("Contenido: ");
              //  console.log(data.contenido);
              //  this.sala = data.contenido;
              //  console.log("SALA: ")
              //  console.log(this.sala);
              //
            //break;
            case "cerrarSala":
              console.log("Peticion: "+data.peticion);
                console.log("Contenido: ");
                console.log(data.contenido);
                this.appService.setSala(this.sala);
                console.log(this.sala);
            break;
          }
        });
        */

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

        console.log("ESTADO: "+this.sesion.render.estadoControl.estado);

    //Router del Logger:
    if(this.sesion.render.estadoControl.estado=="looger"){
      if(tecla=="Enter"){
        this.loggerService.procesarComando(this.sesion.render,this.sesion);
      }else{
        this.loggerService.addComando(tecla);
      }
      if(tecla=="Tab"){
        this.sesion.render.estadoControl.estado="seleccionAccion";
        this.loggerService.toggleLogger(false);
      }
      return;
    }

    switch(tecla){

      /* ----------------------------------------------
            ROUTER SIN RESTRICCION
      ------------------------------------------------- */

      case "Tab":
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        this.sesion.render.estadoControl.estado="looger";
        this.loggerService.toggleLogger(true);
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

      case "Escape":
        this.pausaService.togglePause();
      break;

      /* *************************************************
          ROUTER CON RESTRICCION DE TURNO
      ************************************************* */

      case "ArrowRight":
        if(this.sesion.render.estadoControl.estado=="seleccionObjetivo" || this.sesion.render.estadoControl.estado=="hechizoEncadenado"){
          this.moverObjetivo(1);
        }

      break;

      case "ArrowLeft":
        if(this.sesion.render.estadoControl.estado=="seleccionObjetivo" || this.sesion.render.estadoControl.estado=="hechizoEncadenado"){
          this.moverObjetivo(-1);
        }
      break;

      case "Backspace":
      if(this.sesion.render.estadoControl.estado=="seleccionObjetivo"){
        this.cancelarObjetivo();
      }
      break;

      case "s":
        if(this.sesion.render.estadoControl.estado=="seleccionObjetivo" || this.sesion.render.estadoControl.estado=="hechizoEncadenado"){
          this.seleccionarObjetivo();
        }
      break;

      case "Enter":
      if(this.sesion.render.estadoControl.estado=="seleccionObjetivo" || this.sesion.render.estadoControl.estado=="hechizoEncadenado"){
        //this.lanzarHechizo();
        this.activarRNG();
        return;
      }
      break;

      case "p":
        this.pasarTurno();
      break;

      case "0":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }

      console.log("Hechizo 1:");
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(1)){this.seleccionObjetivo(1);}
        return;
      }
      break;

      case "1":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }

      console.log("Hechizo 2:");
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(2)){this.seleccionObjetivo(2);}
      }
      break;

      case "2":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }

      console.log("Hechizo 3:");
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(3)){this.seleccionObjetivo(3);}
      }
      break;

      case "3":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }

      console.log("Hechizo 4:");
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(4)){this.seleccionObjetivo(4);}
      }
      break;

      case "4":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }

      console.log("Hechizo 5:");
      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(5)){this.seleccionObjetivo(5);}
      }
      break;

      case "5":
        //Restringir accion por turno incorrecto.
        if(!this.comandoSocketActivo){
          if(this.personaje.heroeIndex!= this.sesion.render.registroTurno[this.sesion.render.registroTurno.length-1] && this.restringirTurno){break;}
        }else{
          this.desactivarComandoSocket();
        }
      console.log("Hechizo 6:");

      if(this.sesion.render.estadoControl.estado=="seleccionAccion"){
        if(this.verificarCasteo(6)){this.seleccionObjetivo(6);}
      }
      break;

      /* *************************************************
          ROUTER CON RESTRICCION DE HOST
      ************************************************* */
      case "+":
      this.sesion.render.estadoControl.estado="seleccionSala";
      this.mensajeAccion("Selecciona una sala...",1000);
      break;

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

    if(this.sesion.render.estadoControl.estado=="seleccionSala"){

      switch(tecla){
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        this.cambiarSala(parseInt(tecla));
        this.sesion.render.salaActual=parseInt(tecla);
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
        this.mensajeAccion("Cambiando Sala...",2000);
        this.sesion.render.estadoControl.estado="seleccionAccion";
        break;
        case "Backspace":
        this.sesion.render.estadoControl.estado="seleccionAccion";
        break;
      }

    }

    if(this.sesion.render.estadoControl.estado=="rng"){
      if(tecla=="Backspace"){
        this.sesion.render.estadoControl.estado="seleccionAccion";
        this.desactivarRNG();
        return;
      }

      if(tecla=="Enter"){
        this.sesion.render.estadoControl.rng= this.rngService.getValorRng();
        this.desactivarRNG();
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "sincronizacion", contenido: this.sesion.render});
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: {}});
        this.lanzarHechizo();

        return;
      }

      switch(tecla){
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        this.rngService.setValorTirada(tecla);
        break;
      }
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

        this.sesion= await this.appService.getSesion();
        this.cuenta= await this.appService.getCuenta();
        this.perfil= await this.appService.getPerfil();
        this.mazmorra= await this.appService.getMazmorra();

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

        //Inicialización de personaje:
        this.personaje = {
            nombre: "",
            heroeIndex: 0,
            imagenId: 0
        };

        this.personaje.nombre = this.sesion.jugadores.find(i => i.usuario==this.cuenta.usuario).personaje;
        this.personaje.imagenId = this.sesion.jugadores.find(i => i.usuario==this.cuenta.usuario).personaje.id_imagen;
        this.personaje.heroeIndex = this.sesion.jugadores.findIndex(i => i.usuario==this.cuenta.usuario);
        this.heroeIndex = this.sesion.jugadores.findIndex(i => i.usuario==this.cuenta.usuario);

        console.warn("Heroe index: ",this.heroeIndex)

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
      this.calcularEstadisticas("heroe",i);
    }

    //Calcular estadisticas Enemigos:
    for (var i = 0; i < this.sesion.render.enemigos.length; i++) {
      this.calcularEstadisticas("enemigo",i);
    }

    //Inicializa turno:
    this.sesion.render.registroTurno= [];
    this.sesion.render.registroTurno[0]= 0;

    //Detecta si alguien tiene el turno en la sesión:
        var flagTurnoActivo = false;
    for (var i = 0; i < this.sesion.render.heroes.length; i++) {
            if(this.sesion.render.heroes[i].turno){
                flagTurnoActivo = true;
            }
        }

        //Si la sesion no tiene asignado Turno:
        if(!flagTurnoActivo){
        this.sesion.render.heroes[0].turno= true;
        }

    this.checkTurnoPropio();

    this.sesion.render.numHeroes= this.sesion.jugadores.length;

    //Inicializar Analisis de estadisticas:
    this.sesion.render.estadisticas= [];
    for(var i=0; i < this.sesion.render.numHeroes; i++){
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

    //Generar Secuenciación de acciones enemigos:
    //this.sesion.render.indexActivacionEnemigo = 0;

    //Check de cambio de control de personaje:
    //this.cambiarControlPersonaje();

    //Iniciar Looger:
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
          this.sesion.render.interfaz.barraAccion.mostrar = false;
              this.appService.setControl("desbloqueoMensaje");
      }, 2000);
    }

    this.mostrarMazmorra= true;

    //Inicializar Canvas Isometrico:
    this.appService.renderizarCanvasIsometrico();

    //Centrar Vista Mazmorra:
    setTimeout(()=>{
      this.subscripcionMazmorra.emit("mazmorraIniciada");
    },1000)

    } //Fin Inicializar Mazmorra:

    /*
  cargarPartida(sala):any{
    this.sala = sala;
    if(this.sala.nombre==undefined){
      console.log("RECONECTANDO: "+this.cuenta.nombre)
      this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.cuenta.nombre});
      return this.renderMazmorra;
    }

    console.log("-------------------------");
    console.log("CARGANDO DATOS DE PARTIDA");
    console.log("-------------------------");
    console.log("SALA: ")
    console.log(sala);
    this.importarEstadisticasGenerales(sala);
    return this.renderMazmorra;
  }
    */

   /*
  //Importa las estadisticas generales desde el servidor:
  importarEstadisticasGenerales(sala): void{

        console.log("Importando Estadisticas Generales: ");

        this.appService.setProgresoCarga("70%");

        //Cargar Datos locales
        this.clases=this.appService.getClases();
        this.hechizos=this.appService.getHechizos();
        this.enemigos=this.appService.getEnemigos();
        this.buff=this.appService.getBuff();
        this.objetos=this.appService.getObjetos();
        this.animaciones=this.appService.getAnimaciones();

        //Importar la partida:
        this.importarPartida(sala);

  }
    */

  //Importa los datos de la partida y la mazmorra:
    /*
  importarPartida(sala): void{
    /*
    //console.log("Cargando mazmorra");
    //this.mazmorra = this.electronService.ipcRenderer.sendSync('getDatosMazmorraSnack');
    //console.log("Mazmorra Snack cargado: ");
    //console.log(this.mazmorra);
    //this.appService.setProgresoCarga("80%");

    //console.log("Cargando datos de partida");
    //this.guardado = this.electronService.ipcRenderer.sendSync('getDatosGuardadoSnack');
    //console.log("Partida Cargada: ");
    //console.log(this.guardado);
    //this.appService.setProgresoCarga("100%");

    console.log("-------------------------");
    console.log(" CONFIGURANDO MAZMORRA");
    console.log("-------------------------");

    if(this.cuenta.tipo=="Host"){
      this.personaje = {
        nombre: this.cuenta.nombre,
        heroeIndex: 0
      };
    }else{
      this.personaje = sala.jugadores.find(j => j.usuario === this.appService.getCuenta().then((result) => {return result.nombre}));
      this.personaje.heroeIndex = sala.jugadores.indexOf(this.personaje);
    }

    var partida = {
      nombreMazmorra: "MazmorraSnack",
      nombrePartida: "GuardadoSnack",
    }

    //Obteniendo Perfil de jugador:
    this.perfil = this.appService.getPerfil();

    this.renderMazmorra.personaje= this.personaje.nombre;
    this.renderMazmorra.personajeIndex= this.personaje.heroeIndex;

    console.log("Cargando Mazmorra: "+partida.nombreMazmorra);

    this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarMazmorra",{nombreMazmorra: partida.nombreMazmorra, nombreGuardado: partida.nombrePartida, heroeNombre: this.personaje.nombre, heroeIndex: this.personaje.heroeIndex, token: this.appService.getToken()}).subscribe((data) => {
      console.log("Mazmorra: ");
      console.log(data);
      this.mazmorra= data;
      this.appService.setProgresoCarga("80%");

      console.log("Cargando datos de partida: "+partida.nombrePartida);
      this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarGuardado",{nombreMazmorra: partida.nombreMazmorra, nombreGuardado: partida.nombrePartida, heroeNombre: this.personaje.nombre, heroeIndex: this.personaje.heroeIndex, token: this.appService.getToken()}).subscribe((data) => {
        console.log("Guardado: ");
        console.log(data);
        this.guardado= data;

        this.sala = this.appService.getSala();

        if(this.sala.nombre==undefined){
          console.log("RECONECTANDO: "+this.cuenta.nombre)
          this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.cuenta.nombre});
        }


        if(this.appService.getSala().jugadores==undefined){
          console.log(this.appService.getSala())
          console.log("JUGADORES INSUFICIENTES..")
        }else{
          this.guardado.heroes= this.appService.getSala().jugadores;
          this.guardado.general[0].num_heroes= this.appService.getSala().jugadores.length;
          this.appService.setProgresoCarga("100%");
          this.inicializarPartida();
        }

      });
    });
  }
    */


   /*
  inicializarPartida():void{

    console.log("INICIALIZANDO");
    this.partidaIniciada= true;

    //Inicialización del objeto renderMazmorra:
    this.renderMazmorra.heroes = [];
    this.renderMazmorra.enemigos = [];
    this.renderMazmorra.objetosGlobales = [];
    this.renderMazmorra.nivel_equipo= 9;

    //Inicializar objetivos:
    this.renderMazmorra.objetivo = {
      enemigos: [],
      heroes: []
    }

    //Inicializar Eventos:
    this.eventosService.inicializarEventos(this.mazmorra);

    //Inicializar Canvas Isometrico:
    //this.appService.renderizarCanvasIsometrico();

    //Inicializar Estado:
    this.renderMazmorra.estadoControl = {
      estado: "seleccionAccion",
      hechizo: 0,
      tipoObjetivo: "EU",
      rng: 0,
      rngEncadenado: false,
      critico: false,
      detenerHechizo: false
    };

    //Inicializacion de turnos:
    this.renderMazmorra.turno = 1;
    this.renderMazmorra.cuentaAcciones = 0;

    //Inicialización de los heroes:
    this.renderMazmorra.numHeroes = this.guardado.heroes.length;
    for (var i = 0; i < this.guardado.heroes.length; i++) {
      this.renderMazmorra.heroes[i]={
        clase: this.guardado.heroes[i].clase.toLowerCase().charAt(0).toUpperCase() + this.guardado.heroes[i].clase.toLowerCase().slice(1),
        nombre: this.guardado.heroes[i].nombre,
        vida: 100,
        escudo: 0,
        energia: 100,
        recurso: 100,
        acciones: 2,
        recursoEspecial: 0,
        estadisticas: {
          armadura: 0,
          vitalidad: 0,
          fuerza: 0,
          intelecto: 0,
          agilidad: 0,
          precision: 0,
          ferocidad: 0,
          general: 0
        },
        cargaUlti: 0,
        buff: [],
        oro: this.guardado.heroes[i].oro,
        id_imagen: this.guardado.heroes[i].id_imagen,
        objetos: [],
        turno: false,
        objetivo: false,
        objetivoAuxiliar: false,
        mostrarAnimacion: false,
        animacion: {
          id: 1,
          nombre: "Basico",
          duracion: "1",
          subanimaciones: [],
          sonidos: []
        },
        online: this.guardado.heroes[i].online
      };

      this.renderMazmorra.heroes[i].objetos = this.guardado.objetos.filter(j => j.portador_nombre === this.guardado.heroes[i].nombre);

    }

    this.renderMazmorra.heroes[0].turno= true;

    //Inicialización de la primera sala:

    //Detectar la sala inicial:
    var idSalaInicial = 0;
    for(var i = 0; i < this.mazmorra.salas.length; i++){
      if(this.mazmorra.salas[i].salaInicial){
        idSalaInicial = this.mazmorra.salas[i].sala_id;
      }
    }

    if(idSalaInicial > 0){
      this.cambiarSala(idSalaInicial);
    }

    //Inicializando variables de render:
    this.renderMazmorra.render = {
      barraAccion: {
        mensajeAccion: "Partida Iniciada",
        mostrar: false,
        nombreTurno: this.renderMazmorra.heroes[0].nombre,
        claseTurno: "/Clases/"+this.renderMazmorra.heroes[0].clase.toLowerCase()
      },
      objetivoPredefinido: {
        enemigos: [],
        heroes: []
      },
      heroeMuerto: [],
      enemigoMuerto: []
    }

    console.log(this.renderMazmorra);


    //Calcular estadisticas Heroes:
    for (var i = 0; i < this.renderMazmorra.numHeroes; i++) {
      this.calcularEstadisticas(true,this.renderMazmorra.heroes[i]);
    }
    //Calcular estadisticas Enemigos:
    for (var i = 0; i < this.renderMazmorra.enemigos.length; i++) {
      this.calcularEstadisticas(false,this.renderMazmorra.enemigos[i]);
    }

    //Inicializa turno:
    this.renderMazmorra.registroTurno= [];
    this.renderMazmorra.registroTurno[0]= 0;

    //Inicializar Analisis de estadisticas:
    this.renderMazmorra.estadisticas= [];
    for(var i=0; i < this.renderMazmorra.numHeroes; i++){
      this.renderMazmorra.estadisticas[i]={
        dano: [],
        heal: [],
        escudo: [],
        agro: []
      }
    }

    //Agregar nuevo registro de analisis:
    for(var i=0; i <this.renderMazmorra.numHeroes;i++){
      this.renderMazmorra.estadisticas[i].dano.push(0);
      this.renderMazmorra.estadisticas[i].heal.push(0);
      this.renderMazmorra.estadisticas[i].escudo.push(0);
      this.renderMazmorra.estadisticas[i].agro.push(0);
    }

    //Check de cambio de control de personaje:
    this.cambiarControlPersonaje();

    //Iniciar Looger:
    this.loggerService.log("-----------------------------","yellow");
    this.loggerService.log(" DELIRIUM  -  v"+this.appService.version,"yellow");
    this.loggerService.log("Partida Iniciada...","yellow");
    this.loggerService.log("-----------------------------","yellow");

    for(var i=0; i <this.renderMazmorra.heroes.length; i++){
      this.loggerService.log(this.renderMazmorra.heroes[i].nombre+" ---> "+this.renderMazmorra.heroes[i].clase,"orange");
    }

    if(Object.keys(this.sala.render).length === 0 || this.forzarGeneradoRender){
      console.log("Render generado");
      console.log(this.renderMazmorra);
      this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.renderMazmorra});
    }else{
      console.log("Obteniendo Render Externo");
      this.setRenderMazmorra(this.sala.render);
    }

    this.musicaMazmorraPlay();
    this.autoGuardado2 = cloneDeep(this.renderMazmorra);
    this.autoGuardado = cloneDeep(this.renderMazmorra);

    this.cargaCompleta=true;
    if(this.renderMazmorra.render.barraAccion.mostrar){
      this.appService.setControl("bloqueoMensaje");
      setTimeout(()=>{
          this.renderMazmorra.render.barraAccion.mostrar = false;
              this.appService.setControl("desbloqueoMensaje");
      }, 2000);
    }

    //Inicializar Canvas Isometrico:
    this.appService.renderizarCanvasIsometrico();

    console.log("Partida Inicializada: ");
    console.log(this.renderMazmorra);

    this.mostrarMazmorra= true;

  }
    */

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
    this.sesion.render.estadoControl.estado= estado;
    return;
  }

  forzarSincronizacion(){
      this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "forzarSincronizacion", contenido: this.sesion.render});
      this.mensajeAccion("Sincronizando...",2000);
  }

  /*  ----------------------------------------------
      FUNCIONES BASICAS
  ----------------------------------------------*/

  checkTurnoPropio(){
    if(this.sesion.render.heroes[this.heroeIndex].turno){
      this.esTurnoPropio=true;
      return true;
    }else{
      this.esTurnoPropio=false;
      return false;
    }
  }

  regenerarEnergia(){
    for(var i = 0; i < this.sesion.render.heroes.length; i++){
      this.sesion.render.heroes[i].energia += (this.parametros.regenEnergiaTurno/this.sesion.render.heroes.length);
      if(this.sesion.render.heroes[i].energia>100){this.sesion.render.heroes[i].energia=100}
    }

  }

  //Funcion principal de paso de turno:
  pasarTurno(): void{

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
        //this.emisor=false;
      }

      console.log("Pasando Turno...");
      if(this.sesion.render.estadoControl.estado=="seleccionObjetivo"){
        this.sesion.render.estadoControl.estado = "seleccionAccion";
        this.sesion.render.estadoControl.hechizo = 0;
        this.cancelarObjetivo();
      }

      //Pasar turno aplicando buffos:
      this.loggerService.log("-------------- Pasando Turno ------------------");

      var turnoHeroe = false;
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].turno){turnoHeroe=true}
      }

      if(turnoHeroe){
        this.lanzarBuffos();
        this.regenerarEnergia();
      }

    //Elimina a los enemigos Muertos:
    this.enemigoMuerto(-1);

    //Agregar nuevo registro de analisis:
    for(var i=0; i <this.sesion.render.numHeroes;i++){
      this.sesion.render.estadisticas[i].daño.push(0);
      this.sesion.render.estadisticas[i].heal.push(0);
      this.sesion.render.estadisticas[i].escudo.push(0);
      this.sesion.render.estadisticas[i].agro.push(0);
    }

    //Paso de turno Con modificador por muerte de enemigo:
    if(this.turnoModificado){

      //Los ultimos enemigos han sido eliminados:
      if(this.sesion.render.heroes[0].turno){
        this.sesion.render.turno++;
        this.sesion.render.registroTurno.push(0);
                this.eliminarFlagTurno();
        this.sesion.render.heroes[0].turno = true;
        //this.sesion.render.heroes[0].acciones = 2;
        this.mensajeAccion("Turno de "+this.sesion.render.heroes[0].nombre,2000);
        this.loggerService.log("-------------- Turno de "+this.sesion.render.heroes[0].nombre+" ------------------");
        this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.heroes[0].nombre;
        this.sesion.render.interfaz.barraAccion.claseTurno="/Clases/"+this.sesion.render.heroes[0].clase.toLowerCase();

        this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
        this.autoGuardado2 = cloneDeep(this.autoGuardado);
        this.autoGuardado = cloneDeep(this.sesion.render);
        this.turnoModificado= false;
        this.cambiarControlPersonaje();
        this.checkTurnoPropio();
        return;
      }

      //Paso de turno entre enemigos:
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].turno){
          this.loggerService.log("-------------- Turno de "+this.sesion.render.enemigos[i].nombre+" ------------------");
          this.mensajeAccion("Turno de "+this.sesion.render.enemigos[i].nombre,2000);
          this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.enemigos[i].nombre;
          this.sesion.render.interfaz.barraAccion.claseTurno="/Enemigos/"+this.sesion.render.enemigos[i].nombre.toLowerCase();

          this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
          this.autoGuardado2 = cloneDeep(this.autoGuardado);
          this.autoGuardado = cloneDeep(this.sesion.render);
          this.turnoModificado= false;
          this.cambiarControlPersonaje();
          this.checkTurnoPropio();
          return;
        }
      }
    } //Fin de modificador por muerte.

    //Paso de turno entre heroes:
    for(var i=0; i <this.sesion.render.heroes.length-1; i++){
      if(this.sesion.render.heroes[i].turno){
                this.eliminarFlagTurno();
        this.sesion.render.heroes[i+1].turno = true;
        this.sesion.render.registroTurno.push(i+1);
        //this.sesion.render.heroes[i+1].acciones = 2;
        this.loggerService.log("-------------- Turno de "+this.sesion.render.heroes[i+1].nombre+" ------------------");
        this.mensajeAccion("Turno de "+this.sesion.render.heroes[i+1].nombre,2000);
        this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.heroes[i+1].nombre;
        this.sesion.render.interfaz.barraAccion.claseTurno="/Clases/"+this.sesion.render.heroes[i+1].clase.toLowerCase();

        this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
        this.autoGuardado2 = cloneDeep(this.autoGuardado);
        this.autoGuardado = cloneDeep(this.sesion.render);
        this.cambiarControlPersonaje();
        this.checkTurnoPropio();
        return;
      }
    }
    //Paso de turno entre enemigos:
    for(var i=0; i <this.sesion.render.enemigos.length-1; i++){
      if(this.sesion.render.enemigos[i].turno){
                this.eliminarFlagTurno();
        this.sesion.render.enemigos[i+1].turno = true;
        this.sesion.render.registroTurno.push(-(i+2));
        //this.sesion.render.enemigos[i+1].acciones= 2;
        console.warn("ENTRE ENEMIGO");
        this.activarEnemigo(i+1);
        this.loggerService.log("-------------- Turno de "+this.sesion.render.enemigos[i+1].nombre+" ------------------");
        this.mensajeAccion("Turno de "+this.sesion.render.enemigos[i+1].nombre,2000);
        this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.enemigos[i+1].nombre;
        this.sesion.render.interfaz.barraAccion.claseTurno="/Enemigos/"+this.sesion.render.enemigos[i+1].nombre.toLowerCase();

        this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
        this.autoGuardado2 = cloneDeep(this.autoGuardado);
        this.autoGuardado = cloneDeep(this.sesion.render);
        this.cambiarControlPersonaje();
        this.checkTurnoPropio();
        return;
      }
    }
    // Paso de turno Heroe-Enemigo:
    if(this.sesion.render.heroes[this.sesion.render.heroes.length-1].turno){

      if(this.sesion.render.enemigos.length>0){
                this.eliminarFlagTurno();
        this.sesion.render.enemigos[0].turno = true;
        this.sesion.render.registroTurno.push(-1);
        //this.sesion.render.enemigos[0].acciones = 2;
        console.warn("HEROE -> ENEMIGO");
        this.activarEnemigo(0);
        this.loggerService.log("-------------- Turno de "+this.sesion.render.enemigos[0].nombre+" ------------------");
        this.mensajeAccion("Turno de "+this.sesion.render.enemigos[0].nombre,2000);
        this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.enemigos[0].nombre;
        this.sesion.render.interfaz.barraAccion.claseTurno="/Enemigos/"+this.sesion.render.enemigos[0].nombre.toLowerCase();
      }else{
        this.eliminarFlagTurno();
        this.sesion.render.heroes[0].turno = true;
        this.interfazService.indexHeroeAccion++;
        if(this.interfazService.indexHeroeAccion>=this.sesion.render.heroes.length){
          this.interfazService.indexHeroeAccion=0;
        }
        this.sesion.render.registroTurno.push(0);
        //this.sesion.render.heroes[0].acciones = 2;
        this.loggerService.log("-------------- Turno de "+this.sesion.render.heroes[0].nombre+" ------------------");
        this.mensajeAccion("Turno de "+this.sesion.render.heroes[0].nombre,2000);
        this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.heroes[0].nombre;
        this.sesion.render.interfaz.barraAccion.claseTurno="/Clases/"+this.sesion.render.heroes[0].clase.toLowerCase();
      }

      this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
      this.autoGuardado2 = cloneDeep(this.autoGuardado);
      this.autoGuardado = cloneDeep(this.sesion.render);
      this.cambiarControlPersonaje();
      this.checkTurnoPropio();
      return;
    }

    // Paso de turno Enemigo-Heroe:
    if(this.sesion.render.enemigos[this.sesion.render.enemigos.length-1].turno){
      this.sesion.render.turno++;
            this.eliminarFlagTurno();
      this.sesion.render.heroes[0].turno = true;
      this.sesion.render.registroTurno.push(0);
      //this.sesion.render.heroes[0].acciones = 2;
      this.loggerService.log("-------------- Turno de "+this.sesion.render.heroes[0].nombre+" ------------------");
      this.mensajeAccion("Turno de "+this.sesion.render.heroes[0].nombre,2000);
      this.sesion.render.interfaz.barraAccion.nombreTurno=this.sesion.render.heroes[0].nombre;
      this.sesion.render.interfaz.barraAccion.claseTurno="/Clases/"+this.sesion.render.heroes[0].clase.toLowerCase();

      this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
      this.autoGuardado2 = cloneDeep(this.autoGuardado);
      this.autoGuardado = cloneDeep(this.sesion.render);
      this.cambiarControlPersonaje();
      this.checkTurnoPropio();
      return;
    }

  }

    eliminarFlagTurno(){
    for(var i=0; i < this.sesion.render.heroes.length; i++){
            this.sesion.render.heroes[i].turno = false;
        }
    for(var i=0; i < this.sesion.render.enemigos.length; i++){
            this.sesion.render.enemigos[i].turno = false;
        }
    }

  //Muestra mensaje en barra de acción y bloquea input:
  mensajeAccion(mensaje: string, tiempoMensaje: number):void{
    this.sesion.render.interfaz.barraAccion.mensajeAccion = mensaje;
    this.sesion.render.interfaz.barraAccion.mostrar = true;
    this.appService.setControl("bloqueoMensaje");
    setTimeout(()=>{
        this.sesion.render.interfaz.barraAccion.mostrar = false;
            this.appService.setControl("desbloqueoMensaje");
    }, tiempoMensaje);
  }

  //Cambiar Control Personaje:
  cambiarControlPersonaje(){

    //CAMBIAR PERSONAJE CONTROL SI PERMITE MULTI CONTROL:
    if(this.permitirMultiControl){
      console.log("Cambiando control personaje (Multicontrol)");
      console.log(this.personaje)
      //Buscar si el turno es de un Heroe y seleccionar como control:
      for(var i=0; i <this.sesion.render.heroes.length-1; i++){
        if(this.sesion.render.heroes[i].turno){
          this.sesion.render.personaje = this.sesion.render.heroes[i].nombre;
          this.sesion.render.personajeIndex = i;
          this.personaje.nombre = this.sesion.render.heroes[i].nombre;
          this.personaje.heroeIndex = i;
          this.personaje.clase = this.sesion.render.heroes[i].clase;;
        }
      }
    }

  }

  //Gestiona el cambio de sala:
  addEnemigo(idEnemigo:number):void{

    //Añade los enemigos de la nueva sala a la instancia:
    var enemigoAdd= this.enemigos.find(j => j.id == idEnemigo);
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

  cambiarSala(sala:number):void{

      if(!this.comandoSocketActivo){
        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "cambiarSala", valor: sala});
        //this.emisor=false;
      }

    //Añade los enemigos de la nueva sala a la instancia:
        console.log("CAMBIANDO SALA: ")
        console.log(this.mazmorra)
        console.log("ENEMIGOS:")
        console.log(this.enemigos)

    var enemigosAdd= this.mazmorra.salas.find(j => j.sala_id == sala).enemigos;
    console.warn("EnemigosAdd: ",enemigosAdd)

    this.loggerService.log("--------------Cambiando Sala------------------");
    this.loggerService.log("Cambiando de sala: "+sala);

    //Revelar salas:
    this.sesion.render.mazmorra.salasDescubiertas.push(sala);

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
        nivel: enemigosAdd[i].nivel,
        familia: this.enemigos.find(k => k.id === enemigosAdd[i].tipo_enemigo_id).familia.toLowerCase(),
        turno: false,
        color: colorSeleccionado,
        vida: 100,
        energia: 100,
        puntosVida: 1,
        escudo: 0,
        agro: [],
        buff:[],
        estadisticas: {
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
      this.calcularEstadisticas("enemigo",i);
    }

    console.log(this.sesion.render.enemigos);
    this.loggerService.log("----------------------------------------------");
  }

  //Calcular Estadisticas:

  calcularEstadisticas(caster:string, indexCaster:number):void{

        if(caster!="heroe"&& caster!="enemigo"){console.error("Error de argumento en 'calcularEstadisticas'");return;}

        var nivel;
        var estadisticas = {
                vidaMaxima: 0,
                pa: 0,
                ad: 0,
                ap: 0,
                armadura: 0,
                critico: 0,
                resistenciaMagica: 0,
                vitalidad: 0
        }

        //---------------------
        //  CALCULO HEROE
        //---------------------
    if(caster=="heroe"){

            nivel = this.sesion.jugadores[indexCaster].personaje.nivel;

      //Calcula estadisticas BASE HEROE:
            estadisticas.pa = this.parametros.heroes.base.pa + nivel * this.parametros.heroes.escalado.pa
            estadisticas.ad = this.parametros.heroes.base.ad + nivel * this.parametros.heroes.escalado.ad
            estadisticas.ap = this.parametros.heroes.base.ap + nivel * this.parametros.heroes.escalado.ap
            estadisticas.critico = this.parametros.heroes.base.critico + nivel * this.parametros.heroes.escalado.critico

            estadisticas.armadura = this.parametros.heroes.base.armadura + nivel * this.parametros.heroes.escalado.armadura
            estadisticas.vitalidad = this.parametros.heroes.base.vitalidad + nivel * this.parametros.heroes.escalado.vitalidad
            estadisticas.resistenciaMagica = this.parametros.heroes.base.resistenciaMagica + nivel * this.parametros.heroes.escalado.resistenciaMagica

            //Añadir estadisticas de objetos equipados:
            for(var i = 0; i < this.sesion.jugadores[indexCaster].personaje.objetos.equipado.length; i++){
                estadisticas.pa = estadisticas.pa + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.PA
                estadisticas.ad = estadisticas.ad + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.AD
                estadisticas.ap = estadisticas.ap + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.AP
                estadisticas.critico = estadisticas.critico + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.critico

                estadisticas.armadura = estadisticas.armadura + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.armadura
                estadisticas.vitalidad = estadisticas.vitalidad + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.vitalidad
                estadisticas.resistenciaMagica = estadisticas.resistenciaMagica + this.sesion.jugadores[indexCaster].personaje.objetos.equipado[i].estadisticas.resistencia_magica
            }

            //Calculo de la vida Maxima (HEROE):

            //RANGOS ARMADURA:
            var armaduraMaxPercent = this.parametros.armaduraMax;
            var armaduraMinPercent = this.parametros.armaduraMin;
            var armMin = this.parametros.heroes.base["armadura"]+(nivel*this.parametros.heroes.escalado["armadura"]);
            var armMax = armMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

            //RANGOS VITALIDAD:
            var vitMin = this.parametros.heroes.base["vitalidad"]+(nivel*this.parametros.heroes.escalado["vitalidad"]);
            var vitMax = vitMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

            var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
            var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin)))/((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)-(armMax-armMin)))+armaduraMinPercent-1);
            estadisticas.vidaMaxima = vidaBase+vidaAdicional;

            //Copiar estadisticas en RENDER:
            this.sesion.render.heroes[indexCaster].estadisticas = estadisticas;

    }

        //---------------------
        //  CALCULO ENEMIGO
        //---------------------
        if(caster=="enemigo"){

      //Calcula estadisticas ENEMIGO:
            var indexTipoEnemigo = this.enemigos.findIndex(j => j.id === this.sesion.render.enemigos[indexCaster].enemigo_id);

            nivel = Number(this.sesion.render.enemigos[indexCaster].nivel);

            estadisticas.pa = this.enemigos[indexTipoEnemigo].estadisticas.pa + nivel * this.enemigos[indexTipoEnemigo].escalado.pa_esc;
            estadisticas.ad = this.enemigos[indexTipoEnemigo].estadisticas.ad + nivel * this.enemigos[indexTipoEnemigo].escalado.ad_esc;
            estadisticas.ap = this.enemigos[indexTipoEnemigo].estadisticas.ap + nivel * this.enemigos[indexTipoEnemigo].escalado.ap_esc;
            estadisticas.critico = this.enemigos[indexTipoEnemigo].estadisticas.critico + nivel * this.enemigos[indexTipoEnemigo].escalado.critico_esc;

            estadisticas.armadura = this.enemigos[indexTipoEnemigo].estadisticas.armadura + nivel * this.enemigos[indexTipoEnemigo].escalado.armadura_esc;
            estadisticas.vitalidad = this.enemigos[indexTipoEnemigo].estadisticas.vitalidad + nivel * this.enemigos[indexTipoEnemigo].escalado.vitalidad_esc;
            estadisticas.resistenciaMagica = this.enemigos[indexTipoEnemigo].estadisticas.resistenciaMagica + nivel * this.enemigos[indexTipoEnemigo].escalado.resistenciaMagica_esc;

            //Calculo de la vida Máxima (ENEMIGO):
            var armaduraMaxPercent = this.parametros.armaduraMax;
            var armaduraMinPercent = this.parametros.armaduraMin;
            var armMin = this.parametros.enemigos.base["armadura"]+ (nivel * this.parametros.enemigos.escalado["armadura"]);
            var armMax = armMin + this.parametros.enemigos.baseRango + (nivel * this.parametros.enemigos.escaladoRango);

            //RANGOS VITALIDAD:
            var vitMin = this.parametros.enemigos.base["vitalidad"]+ (nivel * this.parametros.enemigos.escalado["vitalidad"]);
            var vitMax = vitMin + this.parametros.enemigos.baseRango + (nivel * this.parametros.enemigos.escaladoRango);

            var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
            var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin)))/((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)-(armMax-armMin)))+armaduraMinPercent-1);


            estadisticas.vidaMaxima = vidaBase+vidaAdicional;

            //Copiar estadisticas en RENDER:
            this.sesion.render.enemigos[indexCaster].estadisticas = estadisticas;
    }

  }

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
        this.sesion.render.estadoControl.tipoObjetivo = this.hechizos.find(j => j.id==numHechizo).objetivo;

        //Si el caster es heroe y el objetivo es AL:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AL"){
          this.sesion.render.heroes[i].objetivo = true;
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es heroe y el objetivo es EU:
        if(this.sesion.render.estadoControl.tipoObjetivo=="EU"){
                    if(this.sesion.render.enemigos[0]==undefined){
                        return;
                    }
          //this.sesion.render.enemigos[0].objetivo = true;
        }

        //Si el caster es heroe y el objetivo es AU:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AU"){
          //this.sesion.render.heroes[0].objetivo = true;
        }

        //Si el caster es heroe y el objetivo es EM:
        if(this.sesion.render.estadoControl.tipoObjetivo=="EM"){
                    if(this.sesion.render.enemigos[0]==undefined){
                        return;
                    }
          //this.sesion.render.enemigos[0].objetivoAuxiliar = true;
        }

        //Si el caster es heroe y el objetivo es AM:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AM"){
          //this.sesion.render.heroes[0].objetivoAuxiliar = true;
        }

        //Si el caster es heroe y el objetivo es AA:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AA"){
          for(var j=0; j <this.sesion.render.heroes.length; j++){
            this.sesion.render.heroes[j].objetivo = true;
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es heroe y el objetivo es EE:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AE"){
                    if(this.sesion.render.enemigos[0]==undefined){
                        return;
                    }
          for(var j=0; j <this.sesion.render.enemigos.length; j++){
            this.sesion.render.enemigos[j].objetivo = true;
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
        this.sesion.render.estadoControl.tipoObjetivo = this.enemigos.enemigos_hech.find(j => j.id==numHechizo).objetivo;

        //Si el caster es enemigo y el objetivo es AL:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AL"){
          this.sesion.render.enemigos[i].objetivo = true;
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es enemigo y el objetivo es EU:
        if(this.sesion.render.estadoControl.tipoObjetivo=="EU"){
          this.sesion.render.heroes[0].objetivo = true;
        }

        //Si el caster es enemigo y el objetivo es AU:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AU"){
          this.sesion.render.enemigos[0].objetivo = true;
        }

        //Si el caster es enemigo y el objetivo es EM:
        if(this.sesion.render.estadoControl.tipoObjetivo=="EM"){
          this.sesion.render.heroes[0].objetivoAuxiliar = true;
        }

        //Si el caster es enemigo y el objetivo es AM:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AM"){
          this.sesion.render.enemigos[0].objetivoAuxiliar = true;
        }

        //Si el caster es enemigo y el objetivo es AA:
        if(this.sesion.render.estadoControl.tipoObjetivo=="AA"){
          for(var j=0; j <this.sesion.render.enemigos.length; j++){
            this.sesion.render.enemigos[j].objetivo = true;
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

        //Si el caster es enemigo y el objetivo es EE:
        if(this.sesion.render.estadoControl.tipoObjetivo=="EE"){
          for(var j=0; j <this.sesion.render.heroes.length; j++){
            this.sesion.render.heroes[j].objetivo = true;
          }
          //this.lanzarHechizo();
          this.activarRNG()
        }

      }
    }

        //Seleccionar Objetivos:
    this.sesion.render.estadoControl.estado = "seleccionObjetivo";
    this.sesion.render.estadoControl.hechizo = numHechizo;

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
    this.sesion.render.estadoControl.estado = "seleccionAccion";
  }

  //moverObjetivo (positivo--> DERECHA; negativo --> IZQUIERDA)
  moverObjetivo(val:number):void{

    //Mueve objetivo AU && EU:
    if(this.sesion.render.estadoControl.tipoObjetivo=="EU" || this.sesion.render.estadoControl.tipoObjetivo=="AU"){
      //Evalua objetivos en heroes:
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].objetivo){
          if((val+i>=0) && (val+i <this.sesion.render.heroes.length)){
            this.sesion.render.heroes[i].objetivo=false;
            this.sesion.render.heroes[i+val].objetivo=true;
            return;
          }
        }
      }
      //Evalua objetivos en enemigos:
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].objetivo){
          if((val+i>=0) && (val+i <this.sesion.render.enemigos.length)){
            this.sesion.render.enemigos[i].objetivo=false;
            this.sesion.render.enemigos[i+val].objetivo=true;
            return;
          }
        }
      }
    }

    //Mueve el objetivo Auxiliar en AM && EM
    if(this.sesion.render.estadoControl.tipoObjetivo=="EM" || this.sesion.render.estadoControl.tipoObjetivo=="AM"){
      //Evalua objetivos Auxiliares en heroes:
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].objetivoAuxiliar){
          if((val+i>=0) && (val+i <this.sesion.render.heroes.length)){
            this.sesion.render.heroes[i].objetivoAuxiliar=false;
            this.sesion.render.heroes[i+val].objetivoAuxiliar=true;
            return;
          }
        }
      }
      //Evalua objetivos Auxiliares en enemigos:
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].objetivoAuxiliar){
          if((val+i>=0) && (val+i <this.sesion.render.enemigos.length)){
            this.sesion.render.enemigos[i].objetivoAuxiliar=false;
            this.sesion.render.enemigos[i+val].objetivoAuxiliar=true;
            return;
          }
        }
      }
    }
  }

  //Selecciona el objetivo desde un objetivo auxiliar:
  seleccionarObjetivo(): void{
    //Evalua objetivos Auxiliares en heroes: (Invierte el objetivo en el objetivo auxiliar)
      for(var i=0; i <this.sesion.render.heroes.length; i++){
        if(this.sesion.render.heroes[i].objetivoAuxiliar){
          this.sesion.render.heroes[i].objetivo= !this.sesion.render.heroes[i].objetivo;
          return;
        }
      }
      //Evalua objetivos Auxiliares en enemigos: (Invierte el objetivo en el objetivo auxiliar)
      for(var i=0; i <this.sesion.render.enemigos.length; i++){
        if(this.sesion.render.enemigos[i].objetivoAuxiliar){
          this.sesion.render.enemigos[i].objetivo= !this.sesion.render.enemigos[i].objetivo;
          return;
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
    // 2) LANZAR HECHIZO
    //-----------------------
  lanzarHechizo(activacionEnemigo?: any){

        return new Promise((resolve) => {

    //Reinicia el contador de lanzamiento de hechizo:
    this.cuentaAplicacionHechizo=0;

    //Bloquea los inputs:
    this.appService.setControl("bloqueoHechizo");
    this.sesion.render.interfaz.barraAccion.mensajeAccion = "Procesando...";
    this.sesion.render.interfaz.barraAccion.mostrar = true;

    //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
    var caster;
    var esHeroe = false;
    var esEnemigo = false;

    var tipoCaster: "heroe"|"enemigo";
    var indexCaster = -1;
        var indexHechizo = -1;

        if(activacionEnemigo){
            esEnemigo= true;
            indexCaster = activacionEnemigo["indexEnemigo"];
            tipoCaster = "enemigo";
            caster= this.sesion.render.enemigos[indexCaster];
            indexHechizo = this.hechizos.findIndex(j => j.id==activacionEnemigo["hechizo_id"]);
        }else{

            //Verifica de que heroe es el turno:
            for(var i=0; i <this.sesion.render.heroes.length; i++){
                if(this.sesion.render.heroes[i].turno){
                    esHeroe= true;
                    indexCaster = i;
                    tipoCaster = "heroe";
                    caster= this.sesion.render.heroes[i];
                    indexHechizo = this.hechizos.findIndex(j => j.id==this.sesion.render.estadoControl.hechizo);
                    break;
                }
            }
        }


    //------------------------------------
    // 1) Obtiene propiedades del Hechizo:
    //------------------------------------
    var hechizo={
        id: this.hechizos[indexHechizo].id,
        nombre: this.hechizos[indexHechizo].nombre,
        tipo: this.hechizos[indexHechizo].tipo_daño,
        recurso: this.hechizos[indexHechizo].recurso,
        poder: this.hechizos[indexHechizo].poder,
        acciones: this.hechizos[indexHechizo].acciones,

        daño_dir: this.hechizos[indexHechizo].daño_dir,
        daño_esc_AD: this.hechizos[indexHechizo].daño_esc_AD,
        daño_esc_AP: this.hechizos[indexHechizo].daño_esc_AP,
        heal_dir: this.hechizos[indexHechizo].heal_dir,
        heal_esc_AD: this.hechizos[indexHechizo].heal_esc_AD,
        heal_esc_AP: this.hechizos[indexHechizo].heal_esc_AP,
        escudo_dir: this.hechizos[indexHechizo].escudo_dir,
        escudo_esc_AD: this.hechizos[indexHechizo].escudo_esc_AD,
        escudo_esc_AP: this.hechizos[indexHechizo].escudo_esc_AP,
        mod_amenaza: this.hechizos[indexHechizo].mod_amenaza,
        buff_id: this.hechizos[indexHechizo].buff_id,
        funcion: this.hechizos[indexHechizo].funcion,
        objetivo: this.hechizos[indexHechizo].objetivo,
        animacion: this.hechizos[indexHechizo].animacion_id,
                tipoCaster: tipoCaster,
                nivelCaster: this.sesion.jugadores[indexCaster].personaje.nivel,
                indexCaster: indexCaster,
        triggerHechizo: this.hechizos[indexHechizo].triggerHechizo,
        hechizo_encadenado_id: this.hechizos[indexHechizo].hech_encadenado_id
    }

    console.log("RNG: ");
    console.log(this.sesion.render.estadoControl.rng);

    console.log("Lanzando hechizo:");
    console.log(hechizo);

    //---------------------------------------------------------------
    //  2) Verifica y consume recurso del hechizo:
    //----------------------------------------------------------------
    if(esHeroe){
      //Verifica si hay suficiente:
      this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia -= hechizo.recurso;

    if(this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia <0){
       this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia = 0;
    }
    if(this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia >100){
       this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia = 100;
    }
    if(this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia==undefined
    || this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia==null){
        this.sesion.render.heroes.find(i => i.nombre == caster.nombre).energia = 0;
    }

    }

    //---------------------------------------------------------------
    // Obtenemos los Objetivos del Hechizo:
    //----------------------------------------------------------------
    var objetivosEnemigos=[];
    var objetivosHeroes=[];

    //Iteramos enemigos:
    for(var i=0; i <this.sesion.render.enemigos.length; i++){
      if(this.sesion.render.enemigos[i].objetivo){
        objetivosEnemigos.push(i);
      }
    }

    //Iteramos heroes:
    for(var i=0; i <this.sesion.render.heroes.length; i++){
      if(this.sesion.render.heroes[i].objetivo){
        objetivosHeroes.push(i);
      }
    }



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
    this.aplicarHechizos(tipoCaster, indexCaster, hechizo, objetivosEnemigos, objetivosHeroes, resolve);

  });
    } //FIN LANZAR HECHIZO

  //Aplica de forma iterativa el hechizo sobre los objetivos:
    //------------------------
    // 3) APLICAR HECHIZO
    //-----------------------
  aplicarHechizos(tipoCaster: "heroe"|"enemigo",indexCaster:number,hechizo: any, objetivoEnemigos: any, objetivoHeroes: any, resolve?):void{

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
        var caster = tipoCaster+"s";

    if(objetivoEnemigos.length>0){
            tipoObjetivo = "enemigo";
            objetivo = "enemigos";
            indexObjetivo= objetivoEnemigos.slice(-1);
        }else if(objetivoHeroes.length>0){
            tipoObjetivo = "heroe";
            objetivo = "heroes";
            indexObjetivo= objetivoHeroes.slice(-1);
        }

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
        var buff = this.addBuffHechizo(tipoCaster,indexObjetivo,hechizo);
        if(buff){
          this.sesion.render[objetivo][indexObjetivo].buff.push(buff)
        }

        //-------------------------
        // 5) PROCESADO FUNCIONES
        //-------------------------
        this.ejecutarFuncionHechizo(hechizo.funcion,hechizo,objetivoEnemigos,objetivoHeroes);

        //-------------------------
        // 6) APLICACION FINAL
        //-------------------------

        switch(tipoObjetivo){
            case "heroe":
            this.aplicarHechizosFinal(tipoObjetivo, objetivoHeroes[objetivoHeroes.length-1],hechizo);
            break;
            case "enemigo":
            this.aplicarHechizosFinal(tipoObjetivo, objetivoEnemigos[objetivoEnemigos.length-1],hechizo);
            break;
        }

        //---------------------------------------
        // 7) ELIMINACION ELEMENTO LISTA OBJETIVO
        //---------------------------------------
        switch(tipoObjetivo){
            case "heroe":
            objetivoHeroes.splice(objetivoHeroes.length-1, 1);
            break;
            case "enemigo":
            objetivoEnemigos.splice(objetivoEnemigos.length-1, 1);
            break;
        }

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
        if(hechizo.hechizo_encadenado_id != 0 && !this.sesion.render.estadoControl.detenerHechizo){ //Si hay hechizo encadenado
          this.appService.setControl("desbloqueoHechizo");
          this.sesion.render.estadoControl.estado = "hechizoEncadenado";
          this.sesion.render.estadoControl.hechizo = hechizo.hechizo_encadenado_id;
          this.sesion.render.interfaz.barraAccion.mostrar = false;
          this.cuentaLanzamientoHechizo++;
          this.loggerService.log("--> Iniciando Hechizo encadenado (ID: "+hechizo.hechizo_encadenado_id+")","yellow");

          this.seleccionObjetivo(hechizo.hechizo_encadenado_id);
        }else{
        //Desbloquea y termina la aplicación de Hechizos:
        this.appService.setControl("desbloqueoHechizo");
        this.sesion.render.estadoControl.estado = "seleccionAccion";
        this.sesion.render.estadoControl.hechizo = 0;
        this.sesion.render.estadoControl.rngEncadenado= false;
        this.sesion.render.interfaz.barraAccion.mostrar = false;
        this.cuentaLanzamientoHechizo=1;
        this.sesion.render.estadoControl.detenerHechizo=false;
        this.sesion.render.interfaz.objetivoPredefinido.enemigos= [];
        this.sesion.render.interfaz.objetivoPredefinido.heroes= [];
                    if(resolve){ resolve(true) } //Devuelve promesa de finalización de hechizo
        }

      }, this.velocidadHechizo);
      return;
    }
  } //FIN APLICAT HECHIZOS

    //------------------------
    // MODIFICACIONES SALIDA
    //-----------------------
    modificacionHechizoSalida(tipoCaster:"enemigo"|"heroe",indexCaster:number,hechizo:any):any{

        if(tipoCaster!="heroe" && tipoCaster!="enemigo"){console.error("tipoCaster no valido: "+tipoCaster);return}

        //CREA DATOS DE SALIDA:
        hechizo["daño_salida"]= 0;
        hechizo["heal_salida"]= 0;
        hechizo["escudo_salida"]= 0;

        //Modificaciones por tipoCaster:
        switch(tipoCaster){
            case "heroe":
                hechizo["daño_salida"]= (hechizo.daño_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.daño_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.daño_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                hechizo["heal_salida"]= (hechizo.heal_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.heal_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.heal_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                hechizo["escudo_salida"]= (hechizo.escudo_dir*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (hechizo.escudo_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(hechizo.escudo_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                break;
            case "enemigo":
                hechizo["daño_salida"]= (hechizo.daño_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.daño_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.daño_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                hechizo["heal_salida"]= (hechizo.heal_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.heal_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.heal_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                hechizo["escudo_salida"]= (hechizo.escudo_dir*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (hechizo.escudo_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(hechizo.escudo_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                break;
        }

    //Logger:
    this.loggerService.log("------ SALIDA ------- ","teal");
    if(hechizo.daño_salida>0){
      this.loggerService.log("-----> Daño: "+ hechizo["daño_salida"],"orangered");
    }
    if(hechizo.heal_salida>0){
      this.loggerService.log("-----> Heal: "+hechizo["heal_salida"],"lawngreen");
    }
    if(hechizo.escudo_salida>0){
      this.loggerService.log("-----> Escudo: "+hechizo["escudo_salida"]);
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

        }//FIN FOR EJECUCION POR INSTRUCCION DE STAT INC
        return buff;
    }//FIN SetStatIncreaseBuff

    modificacionBuffSalida(tipoCaster:string,indexCaster:number,buff:any):any{

        //CREA DATOS DE SALIDA:
        buff["daño_t_salida"]= 0;
        buff["heal_t_salida"]= 0;
        buff["escudo_t_salida"]= 0;

        //Modificaciones por tipoCaster:
        switch(tipoCaster){
            case "heroe":
                buff["daño_t_salida"]= (buff.daño_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.daño_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.daño_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                buff["heal_t_salida"]= (buff.heal_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.heal_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.heal_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                buff["escudo_t_salida"]= (buff.escudo_t*this.sesion.render.heroes[indexCaster].estadisticas["pa"]) + (buff.escudo_esc_AD * this.sesion.render.heroes[indexCaster].estadisticas["ad"])+(buff.escudo_esc_AP * this.sesion.render.heroes[indexCaster].estadisticas["ap"])
                break;
            case "enemigo":
                buff["daño_t_salida"]= (buff.daño_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.daño_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.daño_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                buff["heal_t_salida"]= (buff.heal_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.heal_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.heal_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                buff["escudo_t_salida"]= (buff.escudo_t*this.sesion.render.enemigos[indexCaster].estadisticas["pa"]) + (buff.escudo_esc_AD * this.sesion.render.enemigos[indexCaster].estadisticas["ad"])+(buff.escudo_esc_AP * this.sesion.render.enemigos[indexCaster].estadisticas["ap"])
                break;
        }

    //Ajustar valores por duracion:(El numero de jugadores ya se está considerando)
    buff["daño_t_salida"]= buff["daño_t_salida"]/buff["duracion"];
    buff["heal_t_salida"]= buff["heal_t_salida"]/buff["duracion"];
    buff["escudo_t_salida"]= buff["escudo_t_salida"]/buff["duracion"];

    //Logger:
    this.loggerService.log("------ SALIDA ------- ","teal");
    if(buff.daño_t_salida>0){
      this.loggerService.log("-----> Daño: "+ buff["daño_t_salida"],"orangered");
    }
    if(buff.heal_t_salida>0){
      this.loggerService.log("-----> Heal: "+buff["heal_t_salida"],"lawngreen");
    }
    if(buff.escudo_t_salida>0){
      this.loggerService.log("-----> Escudo: "+buff["escudo_t_salida"]);
    }

        return buff;
    }

    //------------------------
    // MODIFICACIONES ENTRADA
    //-----------------------
    modificacionHechizoEntrada(objetivo:"enemigo"|"heroe",indexObjetivo:number,hechizo:any):any{

        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armadura = 0;
        var min = 0;
        var max = 0;

        switch(objetivo){

            //(CUALQUIERA) --> HEROE
            case "heroe":
                armadura = this.sesion.render.heroes[indexObjetivo].estadisticas.armadura;
                min = this.parametros.heroes.base["armadura"]+(hechizo.nivelCaster*this.parametros.heroes.escalado["armadura"]);
                max = min + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ hechizo.nivelCaster * this.parametros.objetos.escalado)
                break;

            //(CUALQUIERA) --> ENEMIGO
            case "enemigo":
                armadura = this.sesion.render.enemigos[indexObjetivo].estadisticas.armadura;
                min = this.parametros.enemigos.base["armadura"]+ (hechizo.nivelCaster * this.parametros.enemigos.escalado["armadura"]);
                max = min + this.parametros.enemigos.baseRango + (hechizo.nivelCaster * this.parametros.enemigos.escaladoRango);
                break;
        }

        var reduccionArmadura = armaduraMinPercent + ((armadura-min)/(max-min))*(armaduraMaxPercent-armaduraMinPercent)

        hechizo["daño_bloqueado"] = hechizo["daño_salida"] * (reduccionArmadura);
        hechizo["daño_entrante"] = hechizo["daño_salida"] * (1-reduccionArmadura);
        hechizo["heal_entrante"] = hechizo["heal_salida"];
        hechizo["escudo_entrante"] = hechizo["escudo_salida"];

        if(hechizo["daño_entrante"] || hechizo["heal_entrante"] ||  hechizo["escudo_entrante"]){
        this.loggerService.log("------ ENTRADA ------- ","teal");
        }
        if(hechizo["daño_entrante"]){
        this.loggerService.log("-----> Daño Entrante: "+ hechizo["daño_entrante"]+" ("+hechizo["daño_bloqueado"]+" Bloqueado)","orangered");
        }
        if(hechizo["heal_entrante"]){
        this.loggerService.log("-----> Heal Entrante: "+ hechizo["heal_entrante"],"orangered");
        }
        if(hechizo["escudo_entrante"]){
        this.loggerService.log("-----> Escudo Entrante: "+ hechizo["escudo_entrante"],"orangered");
        }
        return hechizo;

    }

    modificacionBuffEntrada(objetivo:"enemigo"|"heroe",indexObjetivo:number,buff:any):any{

        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armadura = 0;
        var min = 0;
        var max = 0;

        switch(objetivo){

            //(CUALQUIERA) --> HEROE
            case "heroe":
                armadura = this.sesion.render.heroes[indexObjetivo].estadisticas.armadura;
                min = this.parametros.heroes.base["armadura"]+(buff.nivelCaster*this.parametros.heroes.escalado["armadura"]);
                max = min + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ buff.nivelCaster * this.parametros.objetos.escalado)
                break;

            //(CUALQUIERA) --> ENEMIGO
            case "enemigo":
                armadura = this.sesion.render.enemigos[indexObjetivo].estadisticas.armadura;
                min = this.parametros.enemigos.base["armadura"]+ (buff.nivelCaster * this.parametros.enemigos.escalado["armadura"]);
                max = min + this.parametros.enemigos.baseRango + (buff.nivelCaster * this.parametros.enemigos.escaladoRango);
                break;
        }

        var reduccionArmadura = armaduraMinPercent + ((armadura-min)/(max-min))*(armaduraMaxPercent-armaduraMinPercent)

        buff["daño_t_bloqueado"] = buff["daño_t_salida"] * (reduccionArmadura);
        buff["daño_t_entrante"] = buff["daño_t_salida"] * (1-reduccionArmadura);
        buff["heal_t_entrante"] = buff["heal_t_salida"];
        buff["escudo_t_entrante"] = buff["escudo_t_salida"];

    this.loggerService.log("------ ENTRADA ------- ","teal");
    this.loggerService.log("-----> Daño_T Entrante: "+ buff["daño_t_entrante"]+" ("+buff["daño_t_bloqueado"]+" Bloqueado)","orangered");
        return buff;

    }

    //---------------------------
    // APLICACION FINAL (HECHIZO)
    //---------------------------
  aplicarHechizosFinal(tipoObjetivo:"heroe"|"enemigo",indexObjetivo:number,hechizo:any):any{

        console.log("APLICANDO HECHIZO FINAL: ")
        console.log(hechizo)

    //Verificación del caster:
    var indexCaster = hechizo.indexCaster;
    var tipoCaster = hechizo.tipoCaster;
        var objetivo = tipoObjetivo+"s";

        console.log(indexCaster,tipoCaster,objetivo,indexObjetivo)

    //Calculo Vida Total del objetivo:
    var vidaTotalObjetivo = this.sesion.render[objetivo][indexObjetivo].estadisticas.vidaMaxima;

    //Añadir Escudos:
    this.sesion.render[objetivo][indexObjetivo].escudo += (hechizo.escudo_entrante / vidaTotalObjetivo*100);

    //Añadir Vida:
    this.sesion.render[objetivo][indexObjetivo].vida += (hechizo.heal_entrante/vidaTotalObjetivo*100);

    //Efectuar Daños:
    this.sesion.render[objetivo][indexObjetivo].vida -= (hechizo.daño_entrante/vidaTotalObjetivo*100);

    //AplicarAgro:
    if(tipoObjetivo=="enemigo"){
      this.sesion.render.enemigos[indexObjetivo].agro[hechizo.indexCaster] += hechizo.daño_entrante;
    }

    //Redondeo de vida:
    //this.sesion.render[objetivo][indexObjetivo].vida = Math.round(this.sesion.render[objetivo][indexObjetivo].vida * 100) / 100;

      if(this.sesion.render[objetivo][indexObjetivo].vida==NaN){
        console.error("VIDA NAN");
      }

    //Mantener rango de vida:
    if(this.sesion.render[objetivo][indexObjetivo].vida>100){
      this.sesion.render[objetivo][indexObjetivo].vida= 100;
    }

    //Reset critico:
    this.sesion.render.estadoControl.critico=false;

    //LOGGER && ANALITICS
    this.loggerService.log("------ ENTRADA ------- ","teal");
    if(hechizo.daño_entrante>0){
      this.loggerService.log("-----> Daño: "+ hechizo.daño_entrante,"orangered");
      if(tipoCaster=="heroe"){
        this.sesion.render.estadisticas[indexCaster].daño[this.sesion.render.estadisticas[indexCaster].daño.length-1] += hechizo.daño_entrante;
      }
    }

    if(hechizo.heal_entrante>0){
      this.loggerService.log("-----> Heal: "+hechizo.heal_entrante,"lawngreen");
      if(tipoCaster=="heroe"){
        this.sesion.render.estadisticas[indexCaster].heal[this.sesion.render.estadisticas[indexCaster].heal.length-1] += hechizo.heal_entrante;
      }
    }

    if(hechizo.escudo_entrante>0){
      this.loggerService.log("-----> Escudo: "+hechizo.escudo_entrante);
      if(tipoCaster=="heroe"){
        this.sesion.render.estadisticas[indexCaster].escudo[this.sesion.render.estadisticas[indexCaster].escudo.length-1] += hechizo.escudo_entrante;
      }
    }

    //Elimina al enemigo si esta muerto:
        if(tipoObjetivo=="enemigo"){
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

      case "GenerarEsencia":
        caster.recursoEspecial++;
      break

      case "CargaArcana":

        if((this.cuentaAplicacionHechizo == 1) && (caster.recursoEspecial+objetivoEnemigos.length-1>=3)){
            this.sesion.render.interfaz.objetivoPredefinido.enemigos = objetivoEnemigos.slice();
            this.sesion.render.interfaz.objetivoPredefinido.heroes = objetivoHeroes.slice();
            console.log("CARGA ARCANA");
            hechizo.hechizo_encadenado_id= this.hechizos.hechicero.find(i=> i.nombre =="Sobrecarga arcana").id;
        }

        if(objetivoEnemigos.length>1){
          caster.recursoEspecial++;
        }

        if(caster.recursoEspecial>=3 && (this.cuentaAplicacionHechizo == this.sesion.render.interfaz.objetivoPredefinido.enemigos.length)){
          hechizo.hechizo_encadenado_id= this.hechizos.hechicero.find(i=> i.nombre =="Sobrecarga arcana").id;
        }
      break

      case "CargaFuego":
        if(this.sesion.render.estadoControl.critico){
          caster.recursoEspecial++;
        }
        if(caster.recursoEspecial>=3){
          hechizo.hechizo_encadenado_id=12;
        }
      break;

      case "CargaFrio":
        if(this.sesion.render.enemigos[objetivoEnemigos[0]].buff.find(i=> i.id==3)){
          this.sesion.render.interfaz.objetivoPredefinido.enemigos = objetivoEnemigos.slice();
          this.sesion.render.interfaz.objetivoPredefinido.heroes = objetivoHeroes.slice();
          caster.recursoEspecial++;
        }

        if(caster.recursoEspecial>=3){
          this.sesion.render.estadoControl.rngEncadenado=true;
          hechizo.hechizo_encadenado_id=13;
        }
      break;

      case "Proyectil":
        if(this.sesion.render.estadoControl.rng >= 4){
          this.sesion.render.estadoControl.rngEncadenado=false;
          this.sesion.render.interfaz.objetivoPredefinido.enemigos= Object.assign([],objetivoEnemigos);
          hechizo.hechizo_encadenado_id=15;
        }else{
          hechizo.hechizo_encadenado_id=0;
        }

        if(this.cuentaLanzamientoHechizo >= 2){
          caster.recursoEspecial++;
        }

        if(caster.recursoEspecial>=3){
          this.sesion.render.estadoControl.rngEncadenado=true;
          this.sesion.render.interfazrender.interfaz.finido.enemigos= Object.assign([],objetivoEnemigos);
          hechizo.hechizo_encadenado_id=14;
        }

        if(hechizo.id==14){
          console.log("Lanzando Misil Resonante");
          caster.recursoEspecial=0;
        }
      break;

      case "Carga_Critico":
        if(this.sesion.render.estadoControl.critico){
          caster.recursoEspecial++;
        }
      break;

      case "ResetPoder":
        caster.recursoEspecial = 0;
      break
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
    //ADD BUFF LANZADO POR HECHIZO
    //-------------------------------
    addBuffHechizo(tipoObjetivo: "heroe"|"enemigo",indexObjetivo: number,hechizo:any):any{

        //Aplicacion de Buffos:
        if(!hechizo.buff_id){return false;}
        if(hechizo.buff_id==0){return false;}

    this.loggerService.log("Aplicando BUFF/DEBUFF (ID: "+hechizo.buff_id+")...","yellow");

        console.warn("BUFF:",buff)

        var buff = this.buff.find(i => i.id==hechizo.buff_id)
        buff["duracion"]= buff["duracion"]*this.sesion.jugadores.length;
        buff["rng"]= this.sesion.render.estadoControl.rng;
        buff["nivelCaster"]= hechizo.nivelCaster;
        buff["tipoCaster"]= hechizo.tipoCaster;
        buff["indexCaster"]= hechizo.indexCaster;

        //--------------------------------
        // 1) MODIFICACIÓN DE SALIDA BUFF
        //--------------------------------
        buff = this.modificacionBuffSalida(hechizo.tipoCaster,hechizo.indexCaster,buff);

        //--------------------------------
        // 2) MODIFICACIÓN DE ENTRADA BUFF
        //--------------------------------
        buff = this.modificacionBuffEntrada(tipoObjetivo,indexObjetivo,buff)

        //--------------------------------
        // 3) APLICAR STAT INCREASE
        //--------------------------------
        if(tipoObjetivo=="heroe"){
          buff = this.setStatIncreaseBuff(buff,"heroes",indexObjetivo)
        }else{
          buff = this.setStatIncreaseBuff(buff,"enemigos",indexObjetivo)
        }

        return buff;

    } //FIN ADD BUFF POR HECHIZO

    //-------------------------------
    // LANZAR BUFF
    //-------------------------------
  lanzarBuffos():void{

    //Bloquea los inputs:
    this.appService.setControl("bloqueoBuff");
    this.sesion.render.interfaz.barraAccion.mensajeAccion = "Procesando...";
    this.sesion.render.interfaz.barraAccion.mostrar = true;

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

    this.aplicarBuffos(aplicarBuffos);
  }

    //-------------------------------
    // APLICAR BUFF
    //-------------------------------
  aplicarBuffos(aplicarBuffos: any):void{

    //Condicion de desbloqueo (No encontrar buffos por aplicar):
    var desbloqueo=true;

    //Aplicar buffos en los enemigos:
    for(var i=0; i <aplicarBuffos.enemigos.length; i++){
      //Enemigo con buffos pendientes:
      if(aplicarBuffos.enemigos[i].length>0){

        //Verificar el indice del Buff:
        var indiceBuff = aplicarBuffos.enemigos[i].length-1;

        //Iniciar Animacion Buffo:
        this.sesion.render.enemigos[i].animacion = this.buff.find(j => j.id==aplicarBuffos.enemigos[i][aplicarBuffos.enemigos[i].length-1]).animacion_id;

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
      }
    }

    //Aplicar buffos en los heroes:
    for(var i=0; i <aplicarBuffos.heroes.length; i++){
      //Heroe con buffos pendientes:
      if(aplicarBuffos.heroes[i].length>0){

        //Verificar el indice del Buff:
        var indiceBuff = aplicarBuffos.heroes[i].length-1;

        //Iniciar Animacion Buffo:
        this.sesion.render.heroes[i].animacion = this.buff.find(j => j.id==aplicarBuffos.heroes[i][aplicarBuffos.heroes[i].length-1]).animacion_id;

        //Ejecutar funciones de hechizo:
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
        }else{
          //Elimina el ultimo Buff aplicado:
          aplicarBuffos.heroes[i].splice(aplicarBuffos.heroes[i].length-1, 1);
        }
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
      setTimeout(()=>{
            this.aplicarBuffos(aplicarBuffos);
      }, this.velocidadBuff);
    }else{
      //Elimina a los enemigos que hayan muerto por buff:
      this.enemigoMuerto(-1);

      //Desbloquea y termina la aplicación de buffos:
      this.appService.setControl("desbloqueoBuff");
      this.sesion.render.interfaz.barraAccion.mostrar = false;
      //this.pasarTurno();
    }
  }

    //---------------------------
    // APLICACION FINAL (BUFF)
    //---------------------------
  //Aplica efectos FINAL BUFF al HEROE:
  aplicaBuffFinalHeroe(indiceHeroe,indiceBuff):void{

    console.warn("Sesion:",this.sesion)
    console.warn("Aplicar Buff:",indiceHeroe,indiceBuff)

    //Calculo Vida Total del objetivo:
    var vidaTotalObjetivo = this.sesion.render.heroes[indiceHeroe].estadisticas.vidaMaxima;

    //Añadir Escudos:
    this.sesion.render.heroes[indiceHeroe].escudo += (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t_entrante/vidaTotalObjetivo*100);

    //Añadir Vida:
    this.sesion.render.heroes[indiceHeroe].vida += (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t_entrante/vidaTotalObjetivo*100);

    //Efectuar Daños:
    this.sesion.render.heroes[indiceHeroe].vida -= (this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].daño_t_entrante/vidaTotalObjetivo*100);


    //Mantener rango de vida:
    if(this.sesion.render.heroes[indiceHeroe].vida <=0){
      this.sesion.render.heroes[indiceHeroe].vida= 0;
    }
    if(this.sesion.render.heroes[indiceHeroe].vida>100){
      this.sesion.render.heroes[indiceHeroe].vida= 100;
    }

    //Redondeo de vida:
    //this.sesion.render.heroes[indiceHeroe].vida = Math.round(this.sesion.render.heroes[indiceHeroe].vida * 100) / 100;

    //Mantener rango de recurso:
    if(this.sesion.render.heroes[indiceHeroe].recurso>100){
      this.sesion.render.heroes[indiceHeroe].recurso= 100;
    }

    //LOGGER && ANALITICS:
    this.loggerService.log("------ BUFF/DEBUFF (ID: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].id+", Objetivo: "+this.sesion.render.heroes[indiceHeroe].nombre+") ------- ","violet");
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].dano_t>0){
      this.loggerService.log("-----> Daño: "+ this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].dano_t,"orangered");
    }
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t>0){
      this.loggerService.log("-----> Heal: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t,"lawngreen");
      if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){
        this.sesion.render.estadisticas[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].heal[this.sesion.render.estadisticas[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].heal.length-1] += this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].heal_t;
      }
    }
        //this.sesion.render.estadisticas[parseInt(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].daño[this.sesion.render.estadisticas[parseInt(this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].origen.slice(1))].daño.length-1]+= this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t_entrante;
    if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t>0){
      this.loggerService.log("-----> Escudo: "+this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t);
      if(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(0,1)=="H"){
        this.sesion.render.estadisticas[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].escudo[this.sesion.render.estadisticas[parseInt(this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].origen.slice(1))].escudo.length-1] += this.sesion.render.heroes[indiceHeroe].buff[indiceBuff].escudo_t;
      }
    }
  }

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
    //this.sesion.render.enemigos[indiceEnemigo].vida = Math.round(this.sesion.render.enemigos[indiceEnemigo].vida * 100) / 100;

    //Mantener rango de vida:
    if(this.sesion.render.enemigos[indiceEnemigo].vida>100){
      this.sesion.render.enemigos[indiceEnemigo].vida= 100;
    }

    //LOGGER:
    this.loggerService.log("------ BUFF/DEBUFF (ID: "+buff.id+", Objetivo: "+this.sesion.render.enemigos[indiceEnemigo].nombre+") ------- ","violet");

        //LOG DAÑO
    if(buff.daño_t_entrante>0){
      this.loggerService.log("-----> Daño (Buffo): "+ this.sesion.render.enemigos[indiceEnemigo].buff[indiceBuff].daño_t_entrante,"orangered");

            //Guardar en estadisticas de daño:
      if(buff.tipoCaster=="heroe"){
                this.sesion.render.estadisticas[buff.indexCaster].daño[this.sesion.render.estadisticas[buff.indexCaster].daño.length-1]+= buff.daño_t_entrante;
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
      return
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

    return;
  }

  /*  ----------------------------------------------
      GESTION DE MUERTES
  ----------------------------------------------*/

  //Elimina la instancia del enemigo con el indice seleccionado y todos los que estan en cola:
  enemigoMuerto(indiceEnemigo):void{

    //Agregar indice de enemigo a la cola de eliminacion:
    if(indiceEnemigo!=-1){
      this.sesion.render.interfaz.enemigoMuerto.push(indiceEnemigo);
    }

    if(this.sesion.render.interfaz.enemigoMuerto.length==0){return;}

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
            this.sesion.render.estadoControl.detenerHechizo= true;
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
          }
        }else{  //El ultimo enemigo ha muerto:
            //Activa el turno del primer heroe:
            console.log("Paso primer heroe por muerte del ultimo...");
            this.sesion.render.heroes[0].turno = true;
            this.sesion.render.heroes[0].acciones = 2;
            this.turnoModificado=true;
        }
      }
      //Eliminar el enemigo:
      this.sesion.render.enemigos.splice(this.sesion.render.interfaz.enemigoMuerto[i],1);
    }

    //Resetea el vector de enemigos para eliminar:
    this.sesion.render.interfaz.enemigoMuerto = [];
  }

  /*  ----------------------------------------------
      GESTION DE RNG
  ----------------------------------------------*/

  activarRNG(){

    if(this.sesion.render.estadoControl.rngEncadenado){
      //this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: this.sesion.render, emisor: this.sesion.render.personaje});
            console.log("RNG ENCADENADO");
            this.lanzarHechizo();
            return;
        }

    //this.sesion.render.estadoControl.estado="rng";
    //this.sesion.render.estadoControl.rng=0;
    //this.sesion.render.estadoControl.rngEncadenado=true;

        console.log("MOSTRANDO RNG")
    this.interfazService.activarInterfazRNG();

  }

  desactivarRNG(){
    this.rngService.desactivarRng();
  }

  //Función de administración RNG:
  evaluarRNG(valorRng):any{
    var multiplicador= 1;
    multiplicador= 1+ valorRng / 6;
    if(valorRng==6){
      this.sesion.render.estadoControl.critico= true;
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
        this.eventosService.activarEvento(comando.valor);
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
        this.sesion.render.estadoControl.estado="seleccionAccion";
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
            this.sesion.render.estadoControl.estado="seleccionAccion";
        }

  }

  /*  ----------------------------------------------
      MANEJO DE COMANDOS
    ----------------------------------------------*/

  activarComandoSocket():void{
    this.comandoSocketActivo=true;
    return;
  }

  desactivarComandoSocket():void{
    this.comandoSocketActivo=false;
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

    console.log("Evento Interfaz: "+comando.comando);
    if(comando.valor!=""){
      console.log("Valor: "+comando.valor);
    }

    switch(comando.comando){
      case "cancelar":
        this.sesion.render.estadoControl.estado="seleccionAccion";
        this.seleccionarEnemigos = false;
        this.seleccionarHeroes = false;
        this.cancelarObjetivo();
      break;
      case "realizarMovimiento":
                this.realizarMovimiento(comando.valor);
                break;
      case "seleccionarHechizo":

        console.log("Seleccionando Hechizo: "+comando.valor);

        if(this.verificarCasteo(comando.valor)){

          this.seleccionObjetivo(comando.valor);

          switch(this.sesion.render.estadoControl.tipoObjetivo){
            case "EU":
                            if(this.sesion.render.enemigos[0]==undefined){
                                this.appService.mostrarDialogo("Informativo",{titulo: "No se puede lanzar el hechizo",contenido: "No hay objetivos posibles para lanzar el hechizo. Cancelando lanzamiento..."})
                            }
              this.seleccionarEnemigos = true;
              console.log("SELECCIONANDO ENEMIGOS")
              this.interfazService.setPantallaInterfaz("seleccionObjetivoEnemigo");
            break;
            case "EM":
                            if(this.sesion.render.enemigos[0]==undefined){
                                this.appService.mostrarDialogo("Informativo",{titulo: "No se puede lanzar el hechizo",contenido: "No hay objetivos posibles para lanzar el hechizo. Cancelando lanzamiento..."})
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
        var critico = comando.valor
        this.lanzarRng(critico);
      break;

      case "lanzarHechizoEnemigo":
        this.seleccionarEnemigos = false;
        this.seleccionarHeroes = false;

        this.sesion.render.heroes[comando.valor["indexHeroe"]].objetivo = true;

        this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizoEnemigo", contenido: comando.valor});

        this.lanzarHechizo(comando.valor).then(() => {
          //Timeout para esperar al socket de los jugadores:
          setTimeout(()=> {
            this.activarEnemigo(comando.valor["indexEnemigo"])
          },1500)
        });

        //this.activarRNG();
      break;

      case "fallarHechizo":
        //Consume energia:
        var indexHeroeTurno = -1;
        for(var i = 0; i < this.sesion.render.heroes.length; i++){
            if(this.sesion.render.heroes[i].turno){
                indexHeroeTurno = i;
                break;
            }
        }
        this.sesion.render.heroes[indexHeroeTurno].energia -= comando.valor.energia;
        if(this.sesion.render.heroes[indexHeroeTurno].energia<0){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia>100){
            this.sesion.render.heroes[indexHeroeTurno].energia = 100;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia==undefined
        || this.sesion.render.heroes[indexHeroeTurno].energia==null){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }

      break;

      case "finalizarActivacionEnemigo":
        this.pasarTurno();
      break;
    }
  }

  seleccionEnemigo(numEnemigo):void{
    console.log("Selecionando Enemigo "+numEnemigo);

    if(this.sesion.render.estadoControl.tipoObjetivo=="EU"){
    }

    //Si castea heroe:
    if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoEnemigo"){
      if(this.sesion.render.estadoControl.tipoObjetivo=="EU"){
        for(var i = 0;i <this.sesion.render.enemigos.length; i++){
          this.sesion.render.enemigos[i].objetivo = false;
        }
        this.sesion.render.enemigos[numEnemigo].objetivo = true;
      }else{
        this.sesion.render.enemigos[numEnemigo].objetivo = !this.sesion.render.enemigos[numEnemigo].objetivo;
      }

        //Check de objetivo Seleccionado para habilitar interfaz Service:
        this.interfazService.setObjetivoSeleccionado(false);
        for(var i = 0;i <this.sesion.render.enemigos.length; i++){
          if(this.sesion.render.enemigos[i].objetivo){
            this.interfazService.setObjetivoSeleccionado(true);
          }
        }

    }
    return;
  }

  seleccionarHeroe(index):void{

    console.log("Heroe seleccionado: ");

    //Si castea un heroe:
    if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoAliado"&& (this.esHeroe)){
      this.sesion.render.heroes[index].objetivo = !this.sesion.render.heroes[index].objetivo;
        //Check de objetivo Seleccionado para habilitar interfaz Service:
        this.interfazService.setObjetivoSeleccionado(false);
        for(var i = 0;i <this.sesion.render.heroes.length; i++){
          if(this.sesion.render.heroes[i].objetivo){
            this.interfazService.setObjetivoSeleccionado(true);
          }
        }
    }

    //Si castea un Enemigo:
    if(this.interfazService.getPantallaInterfaz()=="seleccionObjetivoEnemigo"&& (this.esEnemigo)){
      this.sesion.render.heroes[index].objetivo = !this.sesion.render.heroes[index].objetivo;
    }
  }

  /*  ----------------------------------------------
      GESTION CONTROLES TACTILES
  ----------------------------------------------*/

  routerInterfaz(pantalla): void{
    switch(pantalla){
      case "elegirHechizo":
        //this.sesion.render.estadoControl.estado="eligiendoHechizo";

        //Inicializar interfazService con datos de hechizos:
        this.interfazService.setHeroesHech(this.hechizos);
        this.interfazService.setEnemigos(this.enemigos);

                //Detecta de quien es el turno:
                var indexHeroeTurno = -1;
                for(var i = 0; i < this.sesion.render.heroes.length; i++){
                    if(this.sesion.render.heroes[i].turno){
                        indexHeroeTurno = i;
                        break;
                    }
                }

                //SI ERROR
                if(indexHeroeTurno < 0 || indexHeroeTurno > 4){ console.error("Turno de heroe no encontrado en 'routerInterfaz' (elegirHechizo)"); return; }

                var energiaDisponible= this.sesion.render.heroes[indexHeroeTurno].energia;

                //Rellenar vector de imagenes de hechizos:
                var hechizosEquipadosID = this.sesion.jugadores[indexHeroeTurno].personaje.hechizos.equipados
                var hechizosEquipadosImagenID = [0,0,0,0,0];
                var hechizosEquipadosEnergia = [0,0,0,0,0];
                var hechizosEquipados= [];

                for(var i=0; i < hechizosEquipadosID.length; i++){
                    hechizosEquipadosImagenID[i]= this.hechizos.find(j => j.id == hechizosEquipadosID[i])["imagen_id"];
                    hechizosEquipadosEnergia[i]= this.hechizos.find(j => j.id == hechizosEquipadosID[i])["recurso"];
                    hechizosEquipados.push(this.hechizos.find(j => j.id == hechizosEquipadosID[i]));
                }
        this.interfazService.activarInterfazHechizos(hechizosEquipadosID, hechizosEquipadosImagenID,hechizosEquipadosEnergia,energiaDisponible,hechizosEquipados);
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

  lanzarRng(critico:boolean):void{

    this.sesion.render.estadoControl.rng= critico;
    this.lanzarHechizo();
    this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "lanzarHechizo", contenido: this.sesion.render});
    return;

  }

    activarEnemigo(indexEnemigoActivado:number){

      //Evita la activación si no le toca la activación al heroe:
      if(this.heroeIndex!=this.sesion.render.indexActivacionEnemigo && !this.permitirMultiControl){return}

        console.warn("Activando Enemigos: ",indexEnemigoActivado,"(Index)",this.sesion.render.indexActivacionEnemigo,"(IndexActivacion)");
        if(this.sesion.render.enemigos[indexEnemigoActivado]){
            this.interfazService.setRender(this.sesion.render)
            this.interfazService.activarInterfazAccionesEnemigo(this.sesion.render.enemigos,this.sesion.render.heroes,indexEnemigoActivado);
        }else{
            console.warn("Enemigos con index ",indexEnemigoActivado," no encontrado. Evitando activar acciones de enemigo");
        }

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

        if(this.sesion.render.heroes[indexHeroeTurno].energia<0){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia>100){
            this.sesion.render.heroes[indexHeroeTurno].energia = 100;
        }
        if(this.sesion.render.heroes[indexHeroeTurno].energia==undefined
        || this.sesion.render.heroes[indexHeroeTurno].energia==null){
            this.sesion.render.heroes[indexHeroeTurno].energia = 0;
        }

    }

  //Función de Trigger Hardcoded:
  triggerEvento(idEvento){
    console.warn("Ejecutando Evento: ",idEvento)
    //EVENTO 1:
    if(idEvento==1){
       const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Seguro que quieres abrir la puerta?",contenido: "Para poder abrir la puerta tienes que estar adyascente a ella"});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            console.log('Abriendo Sala');
            this.cambiarSala(2);
          }
        })
    }//Fin evento
    //EVENTO 2:
    if(idEvento==2){
       const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Seguro que quieres abrir la puerta?",contenido: "Para poder abrir la puerta tienes que estar adyascente a ella"});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            console.log('Abriendo Sala');
            this.cambiarSala(3);
          }
        })
    }//Fin evento

    //EVENTO 3:
    if(idEvento==3){
       const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Seguro que quieres revelar la zona?",contenido: "Para poder revelar tienes que haber llegado a la ubicación especificada."});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            console.log('Abriendo Sala');
            this.cambiarSala(4);
            this.cambiarSala(6);
          }
        })
    }//Fin evento

    //EVENTO 4:
    if(idEvento==4){
       const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Seguro que quieres revelar la zona?",contenido: "Para poder revelar tienes que haber llegado a la ubicación especificada."});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            this.triggerEvento(7);
          }
        })
    }//Fin evento

    //EVENTO 5:
    if(idEvento==5){
       const dialogo = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Quieres inspeccionar la mesa?",contenido: "Para poder inspeccionar tienes que estar adyascente al objeto"});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            this.triggerEvento(6);
          }
        })
    }//Fin evento

    //EVENTO 6: Inspeccionar Mesa
    if(idEvento==6){
       const dialogo = this.appService.mostrarDialogo("Dialogo",
        { titulo: "Mesa del estudio",
          contenido: "Inspeccionas la mesa y bajo los papeles encuentras un gran llave de hierro forjado.",
          personajeIzquierda: {
            mostrar: true,
            tipo: "heroes",
            imagenIndex: this.personaje.imagenId,
            nombre: this.personaje.nombre
          },
          personajeDerecha: {
            mostrar: false,
            tipo: "heroes",
            imagenIndex: 2,
            nombre: "Otro"
          },
          opciones: ["Coger llaves"]});
          dialogo.afterClosed().subscribe(result => {
            console.log(result);
            if(result==0){
              //this.triggerEvento(6);
              this.sesion.render.mazmorra["llaves"]=true;
            }
          })
    }//Fin evento

    //EVENTO 7:
    if(idEvento==7){
      if(this.sesion.render.mazmorra.llaves){
        this.cambiarSala(5);
      }else{
       const dialogo = this.appService.mostrarDialogo("Informativo",{titulo: "La puerta parece estar cerrada con llave",contenido: "Tratas de abrir la puerta pero tus esfuerzos son en vano. Tendras que encontrar la llave antes de pasar."});
        dialogo.afterClosed().subscribe(result => {
          console.log(result);
          if(result){
            //this.triggerEvento(6);
          }
        })
      }
    }//Fin evento

  }//Fin TriggerEvento
}






