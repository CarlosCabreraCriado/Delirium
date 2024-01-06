
import { Injectable, OnInit, Output, EventEmitter} from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from '../../app.service';
import { SocketService } from '../socket/socket.service';
import { EventosService } from '../../eventos.service';
import { TriggerService } from '../../trigger.service';
import { MapaGeneralService } from "../mapa-general/mapaGeneral.service"
import { LogicService } from "../../logic.service"

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
    public estadoApp: any;

    //Variables Comunicaciones:
    public comandoSocketActivo:boolean= false;
    private hash: number;
    private hashRecibido: number;
    private flagCheckHash: boolean;

    //Estados Inmap:
    public estadoControlInMap: EstadoControlInMap;
    public mensajeControl: string = "Esto es un mensaje";
    public movimientoRestante: number = 0;
    public estadoInMap = "region";
    private primeraCargaInMap = true;

    //Noche:
    public mostrarNoche: boolean = false;

    //Variables de sala:
    private sala:any={
        nombre: "",
        jugadores: [{}]
    };

    //Emision de eventos
    @Output() subscripcionInMapService: EventEmitter<string> = new EventEmitter();

  constructor(private logicService: LogicService, private triggerService: TriggerService, private eventosService: EventosService, private mapaGeneralService: MapaGeneralService, private appService: AppService,private socketService:SocketService) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
        this.appService.estadoApp$.subscribe(estadoApp => {
            this.estadoApp = estadoApp;
        });
    }

    async cargarPerfil(){

        //Comprueba el Logueo:
        console.log("Obteniendo cuenta y perfil...");
        this.cuenta = await this.appService.getCuenta();
        console.log(this.cuenta);
        if(!this.cuenta){
            this.appService.setControl("index");
            this.appService.setPantallaApp("index");
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

    async iniciarInMap(){

        console.log("INICIANDO INMAP SERVICE")

        //CARGAR SESION:
        //this.sesion= await this.appService.getSesion();
        this.parametros = await this.appService.getParametros();

        await this.appService.getEventos();

        //Inicializa el grupo:
        if(this.sesion.iniciada == false){
            //this.sesion.iniciada = true;
            this.socketService.enviarSocket("actualizarSesion",{peticion: "actualizarSesion", comando: "actualizarSesion", contenido: this.sesion});
        }

        if(this.estadoApp.heroePropioSesionIndex == null){return;}

        //INICIA MENSAJE Y MOVIMIENTOS:
        if(this.sesion.render.heroes[this.estadoApp.heroePropioSesionIndex].turno){
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
    }

    async cargaMapaCompleta(){

        //INICIA EL EVENTO DE TUTORIAL:
        await this.eventosService.actualizarEventos();

        if(this.estadoApp.pantalla== "inmap" && this.sesion.render.inmap.posicion_x == 56 && this.sesion.render.inmap.posicion_y == 48){
            this.triggerService.checkTrigger("entrarCasilla",{posicion_x: this.sesion.render.inmap.posicion_x, posicion_y: this.sesion.render.inmap.posicion_y})
        }

        this.primeraCargaInMap = false;

        if(this.sesion.render.variablesMundo["tutorial"] == "true" && this.estadoApp.pantalla == "inmap"){
            this.sesion.iniciada = true;
            this.mapaGeneralService.verificarMovimiento();
            //this.eventosService.ejecutarEvento(1,"General");
            //this.iniciarPartida();
        }

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

    /*
    iniciarMazmorra(nombreIdMazmorra: string):void{
        //INICIANDO MAZMORRA:
        console.warn("INICIANDO...",nombreIdMazmorra)
        this.appService.iniciarMazmorra(nombreIdMazmorra);
    }
    */

    realizarMovimientoInMap(direccion:"NorEste"|"SurEste"|"SurOeste"|"NorOeste"){

        //VERIFICAR SI ES TURNO DEL HEROE:
        if(!this.sesion.render.heroes[this.estadoApp.heroePropioSesionIndex]["turno"] && !this.comandoSocketActivo){
            console.error("BLOQUEANDO MOVIMIENTO TURNO NO VALIDO")
            return;
        }

        //VERIFICA SI TIENE MOVIMENTOS RESTANTES:
        // PENDIENTE DE IMPLEMENTAR CONDICION

        //ENVIO DE COMANDO SOCKET:
        if(!this.comandoSocketActivo){
            this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "realizarMovimientoInMap", valor: { direccion: direccion, coordX: this.sesion.render.inmap.posicion_x, coordY: this.sesion.render.inmap.posicion_y}});
        }

        //EJECUCION DEL MOVIMIENTO:
        this.movimientoRestante--;
        this.mapaGeneralService.realizarMovimientoInMap(direccion);

        //PASA TURNO SI NO QUEDA MOVIMIENTO:
        if(this.movimientoRestante <= 0 && this.checkTurnoPropio()){
            this.pasarTurno();
        }

    }

    desplazarCoordenada(posicionX,posicionY){
        this.mapaGeneralService.desplazarCoordenada(posicionX,posicionY)
    }

    checkTurnoPropio(){
        if(!this.sesion.render.heroes){return false;}
        if(this.sesion.render.heroes[this.estadoApp.heroePropioSesionIndex]["turno"]){
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
            if(this.sesion.render.variablesMundo["tutorial"] != "true"){
                this.mostrarNoche= true;
            }
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
        if(this.sesion.render.heroes[this.estadoApp.heroePropioSesionIndex].turno){
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

    finalizarTutorial(){
        //this.mapaGeneralService.cargarRegion("Asfaloth");
        this.appService.peticionGuardarPerfil();

        this.socketService.enviarSocket("actualizarRender",{peticion: "actualizarRender", comando: "actualizarRender", contenido: this.sesion.render});
        this.socketService.enviarSocket("checkSinc",{peticion: "checkSinc", comando: "checkSinc", contenido: this.hash});

        this.appService.reloadPage();
    }

    peticionIniciarPartida(){

        const dialogoConfirmarUnirse = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Quieres iniciar la partida?", contenido: "Compruebe que todos los jugadores estén dentro del grupo antes de iniciar la partida."});

        dialogoConfirmarUnirse.afterClosed().subscribe(result => {
          console.log('Fin dialogo confirmacion Reclutamiento', result);
          if(result){
            this.sesion.iniciada = true;
            this.socketService.enviarSocket("iniciarPartida",{peticion: "iniciarPartida", comando: "actualizarSesion", contenido: this.sesion});
            this.iniciarPartida();
          }
        });
    }

    iniciarPartida(sesion?:any){
        console.warn("INICIANDO PARTIDA...")
        if(sesion){
            this.sesion = sesion;
        }
        this.mapaGeneralService.verificarMovimiento();
        this.appService.setSesion(this.sesion);
        this.triggerService.checkTrigger("entrarCasilla",{posicion_x: this.sesion.render.inmap.posicion_x, posicion_y: this.sesion.render.inmap.posicion_y})
    }

    descansarPosada(){
      //Restaurando vida heroes:
      var indexJugador = -1;
      for(var i = 0; i < this.sesion.render.heroes.length; i++){
        this.sesion.render.heroes[i].buff = [];
        this.sesion.render.heroes[i].vida = 100;
        this.sesion.render.heroes[i].energia = 100;
        this.sesion.render.heroes[i].energiaFutura = 0;
        this.sesion.render.heroes[i].escudo = 0;
        this.sesion.render.heroes[i].cooldown =[0,0,0,0,0];
        indexJugador = Number(this.sesion.jugadores.findIndex(j => j.usuario == this.sesion.render.heroes[i].usuario))
        if(indexJugador<0){
          console.error("Index Jugador no encontrado");
        }
        this.sesion.render.heroes[i]["estadisticas"] = this.logicService.calcularEstadisticasBaseHeroe(this.sesion.jugadores[indexJugador].personaje);
        this.sesion.render.heroes[i]["puntosVida"] = this.sesion.render.heroes[i]["estadisticas"]["vidaMaxima"];

      }

      return;
    }

}


