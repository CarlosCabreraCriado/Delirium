
import { Injectable, OnInit, Output, EventEmitter} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';
import { MapaGeneralService } from "../mapa-general/mapaGeneral.service"

interface EstadoControlInMap {
      estado: string,
      esTurnoPropio: boolean,
      turnoIndex: number;
      heroePropioIndex: number;
}

@Injectable({
  providedIn: 'root'
})

export class InMapService {

    //Definicion estadisticas generales:
    public heroeHech: any;
    public heroeStat: any;
    public enemigos: any;
    public buff: any;
    public objetos: any;
    public animaciones: any;
    public parametros: any;

    //Datos de cuenta y perfil:
    private cuenta: any;
    private perfil: any;

    //Importar Sesion:
    public sesion: any;

    //Variables Comunicaciones:
    public comandoSocketActivo:boolean= false;
    private hash: number;
    private hashRecibido: number;
    private flagCheckHash: boolean;

    //Estados Inmap:
    public heroeSeleccionado: any;
    public heroeSeleccionadoPerfilIndex: number;
    public heroePropioSesionIndex: number;
    public estadoInMap = "global";
    public estadoControlInMap: EstadoControlInMap;
    public mensajeControl: string = "Esto es un mensaje";
    public movimientoRestante: number = 0;

    //Noche:
    public mostrarNoche: boolean = false;

    //Variables de sala:
    private sala:any={
        nombre: "",
        jugadores: [{}]
    };

    //Emision de eventos
    @Output() subscripcionInMapService: EventEmitter<string> = new EventEmitter();

  constructor(private mapaGeneralService: MapaGeneralService, private appService: AppService,private socketService:SocketService) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
    }

    async cargarPerfil(){

        //Comprueba el Logueo:
        console.log("Obteniendo cuenta y perfil...");
        this.cuenta = await this.appService.getCuenta();
        console.log(this.cuenta);
        if(!this.cuenta){
            this.appService.setControl("index");
            this.appService.setEstadoApp("index");
        }

        //Carga el perfil:
        this.perfil= await this.appService.getPerfil();

        console.log("PERFIL")
        console.log(this.perfil)
    }

    getIDCuenta(){
        return this.cuenta._id;
    }

    activarComandoSocket():void{
        this.comandoSocketActivo = true;
        return;
    }

    desactivarComandoSocket():void{
        this.comandoSocketActivo = false;
        return;
    }

    async importarDatosGenerales(){
        console.log("Importando Datos al servicio Inmap... ")
        this.enemigos= await this.appService.getEnemigos();
        this.buff= await this.appService.getBuff();
        this.objetos= await this.appService.getObjetos();
        this.animaciones= await this.appService.getAnimaciones();
    }

    importarHeroeSeleccionado(){
        this.heroeSeleccionado = this.appService.getHeroeSeleccionado();
    }


    async iniciarInMap(){

        console.log("INICIANDO INMAP SERVICE")
        //Auto Seleccion de primer heroe:
        if(this.heroeSeleccionado == null){
            this.appService.setHeroeSeleccionado(this.perfil.heroes[0])
        }

        this.heroeSeleccionado = this.appService.getHeroeSeleccionado();
        this.heroeSeleccionadoPerfilIndex = this.appService.getHeroeSeleccionadoPerfilIndex();
        this.heroePropioSesionIndex = this.appService.getHeroePropioSesionIndex();

        console.log("Heroe Seleccionado")
        console.log(this.heroeSeleccionado)

        //CARGAR SESION:
        //this.sesion= await this.appService.getSesion();
        this.parametros = await this.appService.getParametros();

        await this.appService.getEventos();

        //Inicializa el grupo:
        if(this.sesion.iniciada == false){
            this.sesion.iniciada = true;
            this.socketService.enviarSocket("actualizarSesion",{peticion: "actualizarSesion", comando: "actualizarSesion", contenido: this.sesion});
        }

        //INICIA MENSAJE Y MOVIMIENTOS:
        if(this.sesion.render.heroes[this.heroePropioSesionIndex].turno){
            this.movimientoRestante = this.parametros["movimientoInMap"];
            this.mensajeControl = "Es tu turno.";
        }else{
            var nombreTurno = "";
            this.movimientoRestante = this.parametros["movimientoInMap"];
            for(var i = 0; i <  this.sesion.render.heroes.length; i++){
                if(this.sesion.render.heroes[i].turno){
                    this.mensajeControl = "Turno de "+this.sesion.render.heroes[i]["nombre"];
                    break;
                }
            }
        }


        //REDIRIGE A ASFALOTH POR DEFECTO:
        this.mapaGeneralService.cargarRegion("Asfaloth");
        this.estadoInMap = "region";

        //REDIRIGIR A MAZMORRA:
        //this.iniciarPartida("Bastion");
    }

    toggleInMap(){ //Se activa desde el boton de Region:

        this.estadoInMap = this.appService.estadoInMap;

        if(this.estadoInMap=="global"){
            this.mapaGeneralService.cargarRegion("Asfaloth");
            this.estadoInMap = "region";
        }else{
            this.mapaGeneralService.cargarRegion("Global");
            this.estadoInMap = "global";
        }

    }

    iniciarPartida(nombreIdMazmorra: string):void{
        //INICIANDO MAZMORRA:
        console.warn("INICIANDO...",nombreIdMazmorra)
        this.appService.iniciarMazmorra(nombreIdMazmorra);
    }

    realizarMovimientoInMap(direccion:"NorEste"|"SurEste"|"SurOeste"|"NorOeste"){
        
        var indexHeroePropioSesion = this.appService.getHeroePropioSesionIndex();


        //VERIFICAR SI ES TURNO DEL HEROE:
        if(!this.sesion.render.heroes[indexHeroePropioSesion]["turno"] && !this.comandoSocketActivo){
            console.error("BLOQUEANDO MOVIMIENTO TURNO NO VALIDO")
            return;
        }

        //VERIFICA SI TIENE MOVIMENTOS RESTANTES:
        // PENDIENTE DE IMPLEMENTAR CONDICION
        
        //ENVIO DE COMANDO SOCKET:
        if(!this.comandoSocketActivo){
            this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "realizarMovimientoInMap", valor: direccion});
        }

        //EJECUCION DEL MOVIMIENTO:
        this.movimientoRestante--;
        this.mapaGeneralService.realizarMovimientoInMap(direccion);

        //PASA TURNO SI NO QUEDA MOVIMIENTO:
        if(this.movimientoRestante <= 0 && this.checkTurnoPropio()){
            this.pasarTurno();
        }

    }

    checkTurnoPropio(){
        if(this.sesion.render.heroes[this.appService.getHeroePropioSesionIndex()]["turno"]){
            return true;
        }
            return false;
    }

    pasarTurno(){

        if(!this.comandoSocketActivo){
            this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "pasarTurno"});
        }

        //Paso de turno entre heroes:
        var indexTurnoHeroe = null;
        for(var i=0; i <this.sesion.render.heroes.length; i++){
          if(this.sesion.render.heroes[i].turno){
              indexTurnoHeroe = i;
          }
        }

        //ELIMINA TODOS LOS TURNOS:
        for(var i=0; i < this.sesion.render.heroes.length; i++){
            this.sesion.render.heroes[i].turno = false;
        }

        //DETECTA SI ES EL ULTIMO HEROE:
        if(indexTurnoHeroe == this.sesion.render.heroes.length-1){
            // INICIA NOCHE
            this.mostrarNoche= true;
            setTimeout(()=>{
                this.mostrarNoche= false;
            },16000)
            //ASIGNA TURNO AL PRIMERO:
            this.sesion.render.heroes[0].turno = true;
        }else{
            //ASIGNA TURNO AL SIGUIENTE:
            this.sesion.render.heroes[indexTurnoHeroe+1].turno = true;
        }

        //ACTUALIZA MENSAJE CONTROL:
        //INICIA MENSAJE Y MOVIMIENTOS:
        if(this.sesion.render.heroes[this.heroePropioSesionIndex].turno){
            this.movimientoRestante = this.parametros["movimientoInMap"];
            this.mensajeControl = "Es tu turno.";
        }else{
            var nombreTurno = "";
            this.movimientoRestante = this.parametros["movimientoInMap"];
            for(var i = 0; i < this.sesion.render.heroes.length; i++){
                if(this.sesion.render.heroes[i].turno){
                    this.mensajeControl = "Turno de "+this.sesion.render.heroes[i]["nombre"];
                    break;
                }
            }
        }

        //SOCKET Y SINCRONIZACION:
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

        this.triggerChangeDetection();
        return;

    }//FIN PASAR TURNO

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

    triggerChangeDetection(){
      this.subscripcionInMapService.emit("triggerChangeDetection");
    }

}
