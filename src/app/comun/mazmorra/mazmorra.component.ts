import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, AfterViewInit, NgModule, ViewChildren, ViewChild, ElementRef, QueryList, Directive} from '@angular/core';
import { AppService } from '../../app.service';
import { MazmorraService } from './mazmorra.service';
import { Subscription } from "rxjs";
import { RenderMazmorra} from './render.class';
import { trigger,state,style, animate, transition} from '@angular/animations';
import { AnimacionNumeroComponent} from '../animacion-numero/animacion-numero.component'
import { LoggerComponent} from '../logger/logger.component'
import { MapaMazmorraComponent} from '../mapa-mazmorra/mapa-mazmorra.component'
import { LoggerService} from '../logger/logger.service'
import { PausaService} from '../pausa/pausa.service'
import { EventosService} from '../../eventos.service'
import { RngComponent} from '../rng/rng.component'
import { InterfazService} from '../interfaz/interfaz.service'
import { SocketService} from '../socket/socket.service'
import { HeroesInfoService} from '../heroesInfo/heroesInfo.service'
import { InterfazComponent} from '../interfaz/interfaz.component'

@Directive({selector: 'AppAnimacionNumero'})
class AppAnimacionNumero {
}

@Component({
  selector: 'app-mazmorra',
  templateUrl: './mazmorra.component.html',
  styleUrls: ['./mazmorra.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // animation triggers go here
  ]
})

export class MazmorraComponent implements OnInit,AfterViewInit{
  constructor(private cdr: ChangeDetectorRef,public mazmorraService: MazmorraService, public appService: AppService, private loggerService:LoggerService, private pausaService:PausaService, private eventosService: EventosService, private socketService: SocketService, private interfazService:InterfazService, private heroesInfoService: HeroesInfoService){}

  @ViewChildren("animacionNumero") components: QueryList<AppAnimacionNumero>
  @ViewChild('canvasIsometrico',{static: false}) canvasIsometrico: ElementRef;
  @ViewChild('mapaMazmorra',{static: false}) private mapaMazmorra: MapaMazmorraComponent;

  //Declara Suscripción para imput de teclado:
  private tecla: string;
  private teclaSuscripcion: Subscription;

  //Declara Suscripcion para Logger:
  private appServiceSuscripcion: Subscription;

  //Declara Suscripcion para Logger:
  private loggerSuscripcion: Subscription;
  private retrasoLoggerObs= 1000;
  private bloquearLogger= false;

  //Declara Suscripcion para Eventos:
  private eventosSuscripcion: Subscription;

  //Declara Suscripcion para Interfaz:
  private interfazSuscripcion: Subscription;

  //Declara Estado para eventos de Servicio Combate:
  private estado: string;
  private subscripcionMazmorra: Subscription;

  //Declara Suscripcion Evento Socket:
  private socketSubscripcion: Subscription;

  //Variables Internas:
  private mostrarPantallaCarga:boolean = true;
  public pantalla: string = "Inmap";
  private idCuenta: string;

  //Variables Renderizado:
  private autoGuardado:any;
  private autoGuardado2:any;

  //Variable de renderizado:
  public renderMazmorra: RenderMazmorra;
  public sala:any={};

  public estiloIsometrico: any = {};
  public escalaIsometrico:number = 0.3;

/*  ----------------------------------------------
  SUSCRIPCIONES E IMPORTACION DE OBJETOS A SERVICIO
  ----------------------------------------------*/
  async ngOnInit(){

       console.error("INICIANDO MAZMORRA")
    this.appService.mostrarPantallacarga(true);

    this.mazmorraService.setDispositivo(this.appService.getDispositivo());
    this.mazmorraService.cuenta = this.appService.getCuenta().then((result) => {return result});

        this.mazmorraService.iniciarMazmorra();

    if(this.appService.control!="mazmorra"){this.appService.setControl("mazmorra")}

       //Suscripcion Socket (INTERNO):
       this.socketSubscripcion = this.socketService.emisorSocketInterno.subscribe(async (data) =>{
          switch(data.peticion){
              case"comandoPartida":
                switch(data.comando){
                    case "cambiarSala":
                        this.mazmorraService.cambiarSala(data.valor);
                        break;
                }
              break;
          }
       })

    //Suscripcion Socket:
    this.socketSubscripcion = this.socketService.eventoSocket.subscribe(async (data) => {
          if(data.emisor==this.mazmorraService.cuenta.usuario){
            //console.warn("Evitando Rebote Comando Socket...")
            return;
          }

          console.warn("RECIBIENDO: ",data)

          switch(data.peticion){

            case "renderizarCanvas":
              console.log("Peticion: "+data.peticion);
              console.log("Contenido: ");
              console.log(data.contenido);
              this.renderizarCanvasIsometrico();
            break;

            case "estadoSala":
              console.log("Peticion: "+data.peticion);
              console.log("Emisor: "+data.emisor);
              console.log("Contenido: ");
              console.log(data.contenido);
              this.sala = data.contenido;
              this.mazmorraService.sala= this.sala;
              this.mazmorraService.comprobarConectado();
              this.mazmorraService.sincronizar=false;
            break;

            case "abandonarMazmorra":
                this.mazmorraService.abandonarMazmorra();
                break;

            case "checkSinc":
                if(this.mazmorraService.sesion.estadoSesion == "mazmorra"){
                    this.mazmorraService.setHashRecibido(data.contenido);
                }
            break;

            case "unirsePartida":
              console.log("Peticion: "+data.peticion);
              console.log("Emisor: "+data.emisor);
              console.log("Contenido: ");
              console.log(data.contenido);
              this.sala = data.contenido;
              this.mazmorraService.sala= this.sala;
              //this.renderMazmorra = this.mazmorraService.cargarPartida(this.sala);
              this.mazmorraService.sincronizar=false;
            break;

            case "cerrarSala":
              console.log("Peticion: "+data.peticion);
              console.log("Contenido: ");
              console.log(data.contenido);
              this.retroceder();
            break;

            case "comandoPartida":
                console.warn("Peticion: "+data.peticion);
                console.warn("Comando: "+data.comando);
                if(data.emisor == this.appService.getCuenta().then((result) => {return result.nombre})){break;}
                switch(data.comando){

                  case "pasarTurno":
                    this.mazmorraService.activarComandoSocket();
                    await this.mazmorraService.pasarTurno();
                    this.mazmorraService.desactivarComandoSocket();
                  break;

                  case "cambiarSala":
                    this.mazmorraService.activarComandoSocket();
                    this.mazmorraService.cambiarSala(data.valor);
                    this.mazmorraService.desactivarComandoSocket();
                  break;

                  case "realizarMovimiento":
                    this.mazmorraService.realizarMovimiento(data.contenido)
                    this.cdr.detectChanges();
                    break;

                  case "lanzarHechizo":
                    console.log("Sincronizando hechizo");
                    console.log(data.contenido);
                    this.mazmorraService.lanzarHechizo(data.contenido);
                  break;

                  case "actualizarInteractuado":
                      this.mazmorraService.actualizarInteractuado(data.contenido);
                      break;

                  case "lanzarHechizoEnemigo":
                    console.warn("LANZANDO HECHIZO ENEMIGO: ",data)
                    //this.mazmorraService.seleccionarEnemigos = false;
                    //this.mazmorraService.seleccionarHeroes = false;
                    this.mazmorraService.lanzarHechizo(data.contenido);
                  break;

                  case "forzarRewind":
                    console.log("Sincronizando: ");
                    console.log(data.contenido);
                    this.renderMazmorra = data.contenido;
                    this.mazmorraService.setRenderMazmorra(data.contenido);
                    this.mazmorraService.mensajeAccion("Realizando rewind...",5000);
                  break;

                  case "forzarSincronizacion":
                    console.log("Forzando Sincronizando: ");
                    console.log(data.contenido);
                    this.renderMazmorra = data.contenido;
                    this.mazmorraService.setRenderSesion(data.contenido);
                    this.mazmorraService.setRenderMazmorra(data.contenido);
                    this.mazmorraService.mensajeAccion("Sincronizando...",2000);
                  break;

                  case "forzarSincronizacionSesion":
                    console.log("Forzando Sincronizando: ");
                    console.log(data.contenido);
                    this.renderMazmorra = data.contenido;
                    await this.appService.setSesion(data.contenido);
                    this.mazmorraService.iniciarMazmorra();
                    this.mazmorraService.mensajeAccion("Sincronizando...",2000);
                  break;

                  case"sincronizacion":
                    console.log("Sincronizando: ");
                    console.log(data.contenido);
                    this.renderMazmorra = data.contenido;
                    this.mazmorraService.setRenderMazmorra(data.contenido);
                  break;

                  case "reanimarHeroe":
                    console.log("Socket... Reanimando Heroe: ",data.contenido);
                    this.mazmorraService.reanimarHeroe(data.contenido);
                  break;
                }
            break;
          }
            this.cdr.detectChanges();
        });

    //Suscripcion AppService:
    this.appServiceSuscripcion = this.appService.observarAppService$.subscribe((val) => {
          switch(val){
            case "Iniciar":
              this.mazmorraService.cuenta=this.appService.getCuenta();

              if(this.mazmorraService.cuenta.miembro=="Host"){
                //this.socketService.enviarSocket('crearPartida', {nombre: this.mazmorraService.cuenta.nombre, clave: this.mazmorraService.cuenta.clave});
              }else{
                //this.socketService.enviarSocket('unirseSala',{peticion: 'unirseSala',usuario: this.mazmorraService.cuenta.nombre, nombreSala: "Oficial", contenido: this.appService.perfil.heroes[0]});
              }
            break;

            case "reloadMazmorraService":
              this.mazmorraService.reloadMazmorraService();
            break;

            case "AbandonarPartida":
              this.abandonarPartida();
            break;

            case "renderizarCanvasIsometrico":
              this.renderizarCanvasIsometrico();
            break;

            case "controlMazmorraTrue":
              this.interfazService.setBloquearInterfaz(false);
              this.cdr.detectChanges();
            break;

            case "controlMazmorraFalse":
              this.interfazService.setBloquearInterfaz(true);
              this.cdr.detectChanges();
            break;

            case "MultiControl":
                    this.mazmorraService.toggleMultiControl();
                    this.cdr.detectChanges();
            break;

            case "ForzarSync":
                    this.mazmorraService.forzarSincronizacion();
            break;
          }
            this.cdr.detectChanges();
        });

    //Suscripcion Tecla Pulsada:
    this.teclaSuscripcion = this.appService.observarTeclaPulsada$.subscribe((val) => {
          this.tecla= val;
          this.mazmorraService.emisor=true;
          this.mazmorraService.routerMazmorra(val);
        });

    //suscripcion Logger:
        this.loggerSuscripcion = this.loggerService.observarLogger$.subscribe((val) => {
          if(!this.bloquearLogger){
            this.mazmorraService.loggerObs(val);
          }
          setTimeout(()=>{
            this.bloquearLogger=false;
      }, this.retrasoLoggerObs);
        });

        //suscripcion Eventos:
        this.eventosSuscripcion = this.eventosService.eventoMazmorraEmitter.subscribe((val) => {
            switch(val.comando){
                case "openSala":
                    this.mazmorraService.cambiarSala(val.valor);
                    break;
                case "abandonarMazmorra":
                    this.mazmorraService.abandonarMazmorra();
                    break;
            }
        });

        //suscripcion Interfaz:
        this.interfazSuscripcion = this.interfazService.observarInterfaz$.subscribe((val) => {
          this.mazmorraService.interfazObs(val);
        });

    //suscripcion MazmorraService:
        this.subscripcionMazmorra = this.mazmorraService.subscripcionMazmorra.subscribe((val) => {
            switch(val){
                case "centrarMazmorra":
                    this.centrarMazmorra();
                    break;
                case "forceRender":
                    this.cdr.detectChanges()
                    break;
                case "habilitarInterfaz":
                  this.interfazService.setBloquearInterfaz(false);
                break;
            }
        });

        //Inicio suscripcion evento progreso Carga
      this.mazmorraService.cargarAutoGuardado.subscribe(autoGuardado => {
          this.renderMazmorra = this.mazmorraService.getRenderMazmorra();
      });

      //Inicio suscripcion evento logger
      this.loggerService.obtenerRender.subscribe(val => {
          console.log("ENVIADO");
          return this.renderMazmorra;
      });

      //this.socketService.enviarSocket("buscarSala",{peticion: "buscarSala", comando: this.mazmorraService.cuenta.nombre});

      //this.centrarMazmorra();
  }

  ngOnDestroy(){
    console.warn("Destruyendo Componente Mazmorra")
    this.loggerSuscripcion.unsubscribe();
    this.socketSubscripcion.unsubscribe();
    this.eventosSuscripcion.unsubscribe();
    this.interfazSuscripcion.unsubscribe();
    this.appServiceSuscripcion.unsubscribe();
    this.teclaSuscripcion.unsubscribe();
    this.subscripcionMazmorra.unsubscribe();
  }

/*  ----------------------------------------------
      FUNCIONES GENERALES
  ----------------------------------------------*/

  camelize(texto: string){
    return texto.toLowerCase().charAt(0).toUpperCase() + texto.toLowerCase().slice(1);
  }

  abrirConfiguracion(){
    this.appService.mostrarConfiguracion("", {contenido: this.mazmorraService.sesion.idSesion});
    return;
  }

    abrirEstadisticas(){
    this.mazmorraService.mostrarEstadisticas();
    return;
  }

  abrirSocial(){
    this.appService.mostrarSocial("", {})
    return;
  }

  comandoPanelGeneral(pantalla:string){
    this.cambiarPantalla(pantalla);
  }

  cambiarPantalla(nombrePantalla:string):void{
    //Realiza el cambio de pantalla:
    if(this.pantalla == nombrePantalla){
      this.pantalla = 'Inmap';
    }else{
      this.pantalla=nombrePantalla;
    }
    //this.cdr.detectChanges();
    return;
  }

/*  ----------------------------------------------
    ELIMINACIÓN DE PANTALLA DE CARGA
  ----------------------------------------------*/
  ngAfterViewInit() {

    //Render de Canvas:
    //this.renderizarCanvasIsometrico();

    setTimeout(()=>{
          this.appService.mostrarPantallacarga(false);
    }, 2000);
    }

/*  ----------------------------------------------
    ROUTER DE ACCIONES DE MAZMORRA
  ----------------------------------------------*/
  actualizarComponente(): void{
  }

/*  ----------------------------------------------
  Evento de actualización de parametros de mazmorra
  ----------------------------------------------*/
  actualizarInterfazMazmorra(): void{
  }

/*  ----------------------------------------------
    FUNCIONES DE RENDERIZADO DE INTERFAZ
  ----------------------------------------------*/

  renderIndividual(): any{
      var clase= "";

      if(this.mazmorraService.getDispositivo()=="Movil"){
        clase= clase+" Individual"
      }
      return clase;
    }

  renderizarMarcoHeroe(i:number): string{

    var clases = "Heroe-"+(i+1);

    //Renderiza marco de turno:
    if(this.renderMazmorra.heroes[i].turno){
      clases = clases + " Turno";
    }

    //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
    var esHeroe = false;
    var esEnemigo = false;
    for(var k=0; k <this.renderMazmorra.heroes.length; k++){
      if(this.renderMazmorra.heroes[k].turno){
        esHeroe= true;
        break;
      }
    }

    for(var k=0; k <this.renderMazmorra.enemigos.length; k++){
      if(this.renderMazmorra.enemigos[k].turno){
        esEnemigo= true;
        break;
      }
    }


    //Renderiza Marco de objetivoAuxiliar:
    if(this.renderMazmorra.heroes[i].objetivoAuxiliar){
      if(this.mazmorraService.estadoControl.tipoObjetivo=="AM"){
        clases = clases + " ObjetivoAuxiliarAliado";
      }

      if(this.mazmorraService.estadoControl.tipoObjetivo=="EM"){
        clases = clases + " ObjetivoAuxiliarEnemigo";
      }

      if(this.mazmorraService.estadoControl.tipoObjetivo=="OM"){
        if(esHeroe){
          clases = clases + " ObjetivoAuxiliarAliado";
        }
        if(esEnemigo){
          clases = clases + " ObjetivoAuxiliarEnemigo";
        }
      }
    }

    //Renderiza Marco de objetivo:
    if(this.renderMazmorra.heroes[i].objetivo){
      if(this.mazmorraService.estadoControl.tipoObjetivo=="EU"){
        clases = clases + " ObjetivoEnemigo";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="AU"){
        clases = clases + " ObjetivoAliado";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="EM"){
        clases = clases + " ObjetivoEnemigo";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="AM"){
        clases = clases + " ObjetivoAliado";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="OM"){
        if(esHeroe){
          clases = clases + " ObjetivoAliado";
        }
        if(esEnemigo){
          clases = clases + " ObjetivoEnemigo";
        }
      }
    }
    return clases;
  }

  renderizarEscudoHeroe(i:number): string{
    var left= 0;
    //Si el escudo cabe en la vida que falta
    if(100-this.renderMazmorra.heroes[i].vida >= this.renderMazmorra.heroes[i].escudo){
      left= this.renderMazmorra.heroes[i].vida + (this.renderMazmorra.heroes[i].escudo/2);
    }else{
      left= 100 - (this.renderMazmorra.heroes[i].escudo/2);
    }

    return left+"%";
  }

  renderizarClaseBuffosHeroe(i:number,j:number): string{
    var clases;

    //Renderiza buffo o debuffo:
    if(this.renderMazmorra.heroes[i].buff[j].tipo2== "DEBUF"){
      clases = "DeBuffo-Heroe";
    }

    //Renderiza buffo o debuffo:
    if(this.renderMazmorra.heroes[i].buff[j].tipo2== "BUFF"){
      clases = "Buffo-Heroe";
    }
    return clases;
  }

  renderizarEstiloBuffosHeroe(i:number,j:number,buff:any):any{
    var estilo={}
    console.log(buff)
    var  indexVertical= Math.floor(buff.icon_id/10);
        var  indexHorizontal= buff.icon_id-indexVertical*10;
    estilo={
      'background':'url(./assets/Buffos/Buff.png) '+0.5+11*indexHorizontal+'% '+0.5+9.9*indexVertical+'%',
      'background-size': '1000% 1100%'
    }
    return estilo;
  }

  renderizarMarcoEnemigo(i:number): string{
    var clases = "Enemigo-"+(i+1);
    //Renderiza Marco de turno:
    if(this.renderMazmorra.enemigos[i].turno){
      clases = clases + " Turno";
    }

    //Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
    var esHeroe = false;
    var esEnemigo = false;
    for(var k=0; k <this.renderMazmorra.heroes.length; k++){
      if(this.renderMazmorra.heroes[k].turno){
        esHeroe= true;
          break;
      }
    }

    for(var k=0; k <this.renderMazmorra.enemigos.length; k++){
      if(this.renderMazmorra.enemigos[k].turno){
        esEnemigo= true;
        break;
      }
    }

    //Renderiza Marco de objetivoAuxiliar:
    if(this.renderMazmorra.enemigos[i].objetivoAuxiliar){

      if(this.mazmorraService.estadoControl.tipoObjetivo=="AM"){
        clases = clases + " ObjetivoAuxiliarAliado";
      }

      if(this.mazmorraService.estadoControl.tipoObjetivo=="EM"){
        clases = clases + " ObjetivoAuxiliarEnemigo";
      }

      if(this.mazmorraService.estadoControl.tipoObjetivo=="OM"){
        if(esHeroe){
          clases = clases + " ObjetivoAuxiliarEnemigo";
        }
        if(esEnemigo){
          clases = clases + " ObjetivoAuxiliarAliado";
        }
      }
    }

    //Renderiza Marco de objetivo:
    if(this.renderMazmorra.enemigos[i].objetivo){
      if(this.mazmorraService.estadoControl.tipoObjetivo=="EU"){
        clases = clases + " ObjetivoEnemigo";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="AU"){
        clases = clases + " ObjetivoAliado";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="EM"){
        clases = clases + " ObjetivoEnemigo";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="AM"){
        clases = clases + " ObjetivoAliado";
      }
      if(this.mazmorraService.estadoControl.tipoObjetivo=="OM"){
        if(esHeroe){
          clases = clases + " ObjetivoEnemigo";
        }
        if(esEnemigo){
          clases = clases + " ObjetivoAliado";
        }
      }
    }
    return clases;
  }

  renderizarEscudoEnemigo(i:number): string{
    var left= 0;
    //Si el escudo cabe en la vida que falta
    if(100-this.renderMazmorra.enemigos[i].vida >= this.renderMazmorra.enemigos[i].escudo){
      left= this.renderMazmorra.enemigos[i].vida + (this.renderMazmorra.enemigos[i].escudo/2);
    }else{
      left= 100 - (this.renderMazmorra.enemigos[i].escudo/2);
    }

    return left+"%";
  }

  renderizarIndiceAgroEnemigo(indiceEnemigo: number): number{
    var indiceMaxAgro;
    indiceMaxAgro = this.renderMazmorra.enemigos[indiceEnemigo].agro.indexOf(Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro))+1;
    if(Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro)==0){
      indiceMaxAgro=0;
    }
    return indiceMaxAgro;
  }

  renderizarAgroEnemigo(indiceEnemigo: number): string{
    var clase= "0%";
    var sumaAgro= 0;

    for(var i=0; i < this.renderMazmorra.enemigos[indiceEnemigo].agro.length;i++){
      sumaAgro += this.renderMazmorra.enemigos[indiceEnemigo].agro[i];
    }

    var maxAgro = Math.max.apply(null,this.renderMazmorra.enemigos[indiceEnemigo].agro);

    clase= maxAgro/sumaAgro*100+"%";
    return clase;
  }

  renderizarClaseBuffosEnemigos(i:number,j:number): string{
    var clases;

    //Renderiza buffo o debuffo:
    if(this.renderMazmorra.enemigos[i].buff[j].tipo2== "DEBUF"){
      clases = "DeBuffo-Enemigo";
    }

    //Renderiza buffo o debuffo:
    if(this.renderMazmorra.enemigos[i].buff[j].tipo2== "BUFF"){
      clases = "Buffo-Enemigo";
    }
    return clases;
  }

  renderizarEstiloBuffosEnemigos(buff:any):any{

    var estilo={}
    var  indexVertical= Math.floor(buff.icon_id/10);
        var  indexHorizontal= buff.icon_id-indexVertical*10;

    estilo={
      'background':'url(./assets/Buffos/Buff.png) '+(0.5+11*indexHorizontal)+'% '+(0.5+9.9*indexVertical)+'%',
      'background-size': '1000% 1100%'
    }
    return estilo;
  }

  /*  ----------------------------------------------
    FUNCIONES DE PAUSE
  ----------------------------------------------*/
  abandonarPartida():void{

    this.pausaService.togglePause();

    //Quitar Suscripciones:
    this.loggerSuscripcion.unsubscribe();
    this.socketSubscripcion.unsubscribe();
    this.eventosSuscripcion.unsubscribe();
    this.interfazSuscripcion.unsubscribe();
    this.appServiceSuscripcion.unsubscribe();
    this.teclaSuscripcion.unsubscribe();

    this.mazmorraService.cargaCompleta=false;

    //Gestionar Control:
    this.socketService.enviarSocket('abandonarSala',null);
    this.appService.setControl("");
    this.mazmorraService.musicaMazmorra.volume= 0;
    this.mazmorraService.musicaMazmorra.remove();
    this.appService.setPantallaApp("index");
  }

  /*  ----------------------------------------------
    FUNCIONES VARIAS
    ----------------------------------------------*/

  retroceder():void{
    this.appService.setControl("");
    this.mazmorraService.musicaMazmorra.volume= 0;
      this.mazmorraService.musicaMazmorra.remove();
    this.appService.setPantallaApp("index");
  }

  seleccionarHeroe(index):void{
    console.log("Heroe seleccionado: ");
    this.heroesInfoService.setPersonaje(index);
    this.heroesInfoService.mostrarHeroesInfo=true;
  }

  comandoPanelControl(comando:any){
    //Si se pulsa el centro accede a mazmorra:
    if(comando=="centro"){
            if(this.mazmorraService.estadoControl.esTurnoPropio || this.mazmorraService.permitirMultiControl){
              this.mazmorraService.pasarTurno()
            }
    }

    if(comando=="elegirHechizo"){
      this.mazmorraService.routerInterfaz('elegirHechizo')
    }

    if(comando=="elegirMovimiento"){
      this.mazmorraService.routerInterfaz('elegirMovimiento')
    }

  }

  //********************
  // RENDER ISOMETRICO
  //********************

  renderizarCanvasIsometrico(){

    var posicionMax_x = 0;
    var posicionMax_y = 0;

    for(var i = 0; i < this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
      if(this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].Position.x > posicionMax_x && !this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].oculto){
        posicionMax_x = this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].Position.x;
      }
      if(this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].Position.y > posicionMax_y && !this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].oculto){
        posicionMax_y = this.mazmorraService.mazmorra.isometrico.MapSave.Placeables.Placeable[i].Position.y;
      }
    }

    //console.log("Posicion Max X: "+ posicionMax_x);
    //console.log("Posicion Max Y: "+ posicionMax_y);

        /*
    this.estiloIsometrico = {
      "width": ""+(posicionMax_x*1.8)+"px",
      "height": ""+(posicionMax_y*1)+"px",
      "margin-left": ""+(posicionMax_x/2)+"px",
      "margin-top": ""+(posicionMax_y/2)+"px",
      "margin-right": ""+(posicionMax_x/2)+"px",
      "margin-bottom": ""+(posicionMax_y/2)+"px"
    }
        */

    //Centrar el isometrico:
    //this.canvasIsometrico.nativeElement.scrollTop = posicionMax_y/2
    //this.canvasIsometrico.nativeElement.scrollLeft = posicionMax_x/2

  }

  renderizarElementoIsometrico(elemento: any):any{

    var opcionesCanvas = this.mazmorraService.mazmorra.isometrico.MapSave.MapSettings
    var style = {
      "position": "absolute",
      "top": "",
      "left": "",
      "width": "",
      "height": "",
      "z-index": 0,
      "transform": "translate(-50%,-50%) scaleX(1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")",
      "-webkit-mask-image": "url('"+elemento.ImagePath+"')",
      //"mix-blend-mode": "multiply"',
      "display": "block",
      "pointer-events": ""
    }

    //Renderizar Elemento:
    var top = (parseFloat(elemento.Position.y)*this.escalaIsometrico/*+parseFloat(elemento.VisibilityColliderStackingOffset.y)*/) + "px";
    style["top"]= top.replace(/,/g,".")

    var left= (parseFloat(elemento.Position.x)*this.escalaIsometrico/*-parseFloat(elemento.VisibilityColliderStackingOffset.x)*/) + "px";
    style["left"]= left.replace(/,/g,".")

    var zIndex= (parseFloat(elemento.Position.z)+100)*10
    style["z-index"]= Math.floor(zIndex)

    if(elemento.Mirror=="true"){
      style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
    }
    if(elemento.Mirror==true){
      style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
    }

    //Aplicar filtrado de visualizacion:
    style["display"] = "none";

    if(elemento.seleccionable){
      style["pointer-events"] = "all";
    }else{
      style["pointer-events"] = "none";
    }

    for(var i =0; i <this.mazmorraService.sesion.render.mazmorra.salasDescubiertas.length; i++){
      if(Number(this.mazmorraService.sesion.render.mazmorra.salasDescubiertas[i])==Number(elemento.sala)){
        style.display= "block";
      }
    }

    //Renderizar Seleccion:
    if(elemento.seleccionado){
      style["filter"] = "sepia(100%) saturate(100)";
    }

    //Aplicar filtro de Seleccion:
    //var width= ((window.innerWidth*0.7)/opcionesCanvas.MapSizeX)*100 + "px";
    //style.width= width.replace(/,/g,".")

    //var height= ((window.innerHeight*0.6)/opcionesCanvas.MapSizeY)*100 + "%";
    //style.height= height.replace(/,/g,".")

    return style;
  }

    centrarMazmorra(){
        console.log("Centrando")
        if(this.mapaMazmorra==undefined){return}
        this.mapaMazmorra.centrarMazmorra();
        return;
    }

    clickElemento(elemento){

      console.log(elemento)

      switch(elemento.especial){
              case undefined:
              case null:
              case "":
                return;
              break;

              case "interactuar":
              case "exploracion":
              case "inspeccionable":
                this.mazmorraService.lanzarEventoMazmorra(elemento.especial,elemento.mensaje,elemento.eventoId,elemento.Id); 
                break;

      }

    }//FIN clickElemento()

    abrirLogger(){
      this.mazmorraService.estadoControl.estado = "logger";
      this.loggerService.toggleLogger(true);
    }

    reloadDatos(){
      this.mazmorraService.reloadDatos();
    }



}





