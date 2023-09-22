
import { Injectable, EventEmitter, Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { ElectronService } from './comun/electronService/public_api';
import { DialogoComponent } from './comun/dialogos/dialogos.component';
import { ConfiguracionComponent } from './comun/configuracion/configuracion.component';
import { SocialComponent } from './comun/social/social.component';
import { CrearHeroeComponent } from './comun/crear-heroe/crear-heroe.component';
import { MatDialog} from '@angular/material/dialog';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../environments/environment'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { datosIniciales } from "./datosIniciales"

@Injectable({
  providedIn: 'root'
})

export class AppService {

    constructor(private screenOrientation: ScreenOrientation, private route: ActivatedRoute, private router: Router, private http: HttpClient, private dialog: MatDialog, private socialComponent: MatDialog, private dialogoConfiguracion: MatDialog, private dialogCrearHeroe: MatDialog, private storage: Storage) {

      console.log("Detectando Dispositivo: ");
      console.log(navigator.userAgent);

      if(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)){
         this.dispositivo="Movil";
      } else if (/iPad|Mobile|mobile/i.test(navigator.userAgent)){
         this.dispositivo="Tablet";
      }else{
         this.dispositivo="Desktop";
      }

      //Variables de entorno:
      this.ipRemota =  environment.dominio
      this.ionic = environment.ionic
      this.production = environment.production
      console.warn("ENTORNO: ")
      console.warn("IP REMOTA: ", environment.dominio)
      console.warn("IONIC: ", environment.ionic)
      console.warn("DISPOSITIVO: ", this.dispositivo)
      console.warn(environment)

      if(this.ionic && this.production){this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);}

      //Inicializa Storage:
      this.initStorage()
    }

    //Variables de entorno:
    public ipRemota: string= "";
    private ionic: boolean= true;
    private production: boolean= false;

    //Variables de configuración:
    public activarDatosOficiales= true;

    //Datos:
    private cuenta: any = null
    public token: string = null;
    private _storage: Storage | null = null;

    //Variables de datos:
    public perfil:any;
    public datosJuego: any;
    public sesion: any;
    public region: any;
    public mazmorra: any;
    public renderIsometrico: any;
    public radioRenderIsometrico: number = 6;
    public escalaIsometrico: number = 1;

    //Definicion estadisticas generales:
    private clases: any;
    private objetos: any;
    private perks: any;
    private hechizos: any;
    private buff: any;
    private animaciones: any;
    private enemigos: any;
    private eventos: any;
    private misiones: any;
    private parametros: any;

    public dispositivo: string;
    public movil: boolean = true;
    public version: string = "0.2.3";
    public control:string="null";
    private bloqueo: any= [0,0,0,0];
    private autoDesbloqueo: boolean= true;
    public claveValida: boolean= false;
    private sala: any={};
    private heroeSeleccionado = null;
    private heroeSeleccionadoIndex = null;

    //Estados:
    public estadoApp = "";
    public estadoInMap = "global";
    public cargandoMapa:boolean = false;

    //Dialogos:
    private dialogoReconectar: any = undefined;

    // Observable string sources
    private observarAppService = new Subject<string>();

    // Observable string streams
    observarAppService$ = this.observarAppService.asObservable();

    // Observable string sources
    private observarTeclaPulsada = new Subject<string>();

    // Observable string streams
    observarTeclaPulsada$ = this.observarTeclaPulsada.asObservable();

    setEstadoApp(estado: string){

        console.log("ENTRANDO")
        //this.mostrarPantallacarga(false);
        //this.estadoApp = estado;
        this.mostrarPantallacarga(true);

        setTimeout(()=>{
                console.warn("CAMBIO ESTADO APP ",estado)
                this.estadoApp = estado;
        }, 1000);

        setTimeout(()=>{
              this.mostrarPantallacarga(false);
        }, 4000);

    }

    //STORAGE:

    async initStorage(){
        const storage = await this.storage.create();
        this._storage = storage;
    }

    public set(key: string, value: any) {
        this._storage?.set(key, value);
    }

    setToken(token){
    console.log("Guardando Token: ");
    console.log(token);
      if(this.ionic){
          this.set("token",token)
      }else{
      window.electronAPI.setToken(token)
      }
      this.token=token;
      return;
    }

    async getToken() {
      if(this.ionic){
        this.token=  await this.storage.get("token")
      }else{
        this.token = await window.electronAPI.getToken();
      }
    console.log("Recuperando Token... Done");
      return this.token;
    }

    async setSesion(sesion:any){
    console.log("Cargando Sesion: ");
    console.log(sesion);
      this.sesion=sesion;
      return;
    }

    setPerfil(perfil: any){
        console.log("Guardando Perfil...");
        console.log(perfil);
        this.perfil=perfil;

        if(this.ionic){
              this.set("perfil",perfil)
        }else{
            window.electronAPI.setPerfil(perfil)
        }
        return;
    }

    setControl(val:string):void{

      switch(val){
        case "bloqueoMensaje":
        this.bloqueo[0]=1;
        break;
        case "bloqueoBuff":
        this.bloqueo[1]=1;
        break;
        case "desbloqueoMensaje":
        this.bloqueo[0]=0;
        break;
        case "desbloqueoBuff":
        this.bloqueo[1]=0;
        break;
        case "bloqueoHechizo":
        this.bloqueo[2]=0;
        break;
        case "desbloqueoHechizo":
        this.bloqueo[2]=0;
        break;
        case "bloqueoRNG":
        this.bloqueo[3]=1;
        break;
        case "desbloqueoRNG":
        this.bloqueo[3]=0;
        break;
      }

     var flagCambio = true;
     for(var i=0; i <this.bloqueo.length; i++){
       if(this.bloqueo[i]){
         flagCambio = false;
       }
     }

     if(flagCambio){
       switch(val){
         case "desbloqueoMensaje":
         case "desbloqueoBuff":
         case "desbloqueoHechizo":
         case "desbloqueoRNG":
           val = "mazmorra";
         break;
       }
     }
     this.control=val;
     console.log("CONTROL: "+this.control);
     if(this.control == "mazmorra"){
        this.observarAppService.next("controlMazmorraTrue");
     }else{
        this.observarAppService.next("controlMazmorraFalse");
     }
    }

    //Emision de eventos:
    @Output() mostrarCarga: EventEmitter<boolean> = new EventEmitter();
    @Output() progresoCarga: EventEmitter<string> = new EventEmitter();
    @Output() bugLog: EventEmitter<string> = new EventEmitter();
    @Output() ajustes: EventEmitter<string> = new EventEmitter();
    @Output() eventoAppService: EventEmitter<string> = new EventEmitter();

    audioTeclaPlay(): void{
      let audio = new Audio();
      audio.src = "./assets/sounds/tecla.mp3";
      audio.load();
      audio.play();
  }

    //Router de tecla
    teclaPulsada(tecla): void{
      //this.audioTeclaPlay();
      this.observarTeclaPulsada.next(tecla);
    }

    finalizarLogin():void{
      this.eventoAppService.emit("login");
    }

    setDatosJuego(datosJuego: any){

    if(datosJuego == null || datosJuego == undefined){
          console.log("Se ha producido un error interno (Datos Juego no validos)")
          return;}

      for(var i=0; i <datosJuego.length; i++){
        switch(datosJuego[i].nombreId){
          case "Clases":
            this.clases = datosJuego[i];
            if(this.ionic){this.set("clases",this.clases)}
          break;
          case "Objetos":
            this.objetos = datosJuego[i];
            if(this.ionic){this.set("objetos",this.objetos)}
          break;
          case "Perks":
            this.perks = datosJuego[i];
            if(this.ionic){this.set("perks",this.perks)}
          break;
          case "Hechizos":
            this.hechizos = datosJuego[i];
            if(this.ionic){this.set("hechizos",this.hechizos)}
          break;
          case "Buff":
            this.buff = datosJuego[i];
            if(this.ionic){this.set("buff",this.buff)}
          break;
          case "Animaciones":
            this.animaciones = datosJuego[i];
            if(this.ionic){this.set("animaciones",this.animaciones)}
          break;
          case "Enemigos":
            this.enemigos = datosJuego[i];
            if(this.ionic){this.set("enemigos",this.enemigos)}
          break;
          case "Misiones":
            this.misiones = datosJuego[i];
            if(this.ionic){this.set("misiones",this.misiones)}
          break;
          case "Parametros":
            this.parametros = datosJuego[i];
            if(this.ionic){this.set("parametros",this.parametros)}
          break;
        }
      }

      console.log("Datos de Juego: ");
      console.log(datosJuego);

      if(!this.ionic){
      window.electronAPI.setDatosJuego(datosJuego)
      }

      return;
    }

    setEventos(eventos: any){
        this.eventos = eventos;
        if(this.ionic){
            this.set("eventos",this.eventos)
        }else{
            window.electronAPI.setEventos(eventos)
        }
    }

  setMazmorra(mazmorra: any){
        //Actualizar datos:
    this.mazmorra = mazmorra;
    return;
  }

  crearCuenta(correo,usuario,password,password2){

  }

    mostrarPantallacarga(val:boolean):void{
      this.mostrarCarga.emit(val);
    }

  getHeroeSeleccionado(){
    return this.heroeSeleccionado;
  }

  setHeroeSeleccionado(heroe: any){
    this.heroeSeleccionado = heroe;
    this.observarAppService.next("actualizarHeroeSeleccionado");
    return;
  }

    setProgresoCarga(val:string):void{
      this.progresoCarga.emit(val);
    }

    async setCuenta(val:any){
      this.cuenta= val;
      console.log("SET CUENTA")
      console.log(this.cuenta);
        if(this.ionic){
            this.set("cuenta",this.cuenta)
        }else{
            console.log(await window.electronAPI.setCuenta(this.cuenta));
        }

    }

  renderizarCanvasIsometrico(){
    this.observarAppService.next("renderizarCanvasIsometrico");
    return;
  }

    mostrarDialogoReconectar(mostrar: boolean){

        if(mostrar){
            if(this.dialogoReconectar == undefined){
                this.dialogoReconectar = this.dialog.open(DialogoComponent,{
                width: "100px", panelClass: ["Reconectar", "generalContainer"], backdropClass: "fondoDialogo", disableClose:true, data: {tipoDialogo: "Reconectar", titulo: "Reconectando con el servidor...", contenido: "Se ha producido un error en la sincronización del web socket. Tratando de reconectar...",opciones: null, personajeDerecha: null, personajeIzquierda: null, inputLabel: null}
                });
            }
        }else{
            if(this.dialogoReconectar){
              this.dialogoReconectar.close();
            }
            this.dialogoReconectar = undefined;
        }
    }



    mostrarDialogo(tipoDialogo:string, config:any):any{
      const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px", panelClass: [tipoDialogo, "generalContainer"],backdropClass: "fondoDialogo", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido,opciones: config.opciones, personajeDerecha: config.personajeDerecha, personajeIzquierda: config.personajeIzquierda, inputLabel: config.inputLabel,deshabilitado: config.deshabilitado}
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Fin del dialogo');
          console.log(result)
        });
        return dialogRef;
    }

    mostrarCrearCuenta():any{
      const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px", panelClass: ["containerCrearCuenta", "generalContainer"],backdropClass: "fondoDialogo", disableClose:true, data: {tipoDialogo: "CrearCuenta"}
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Fin del dialogo');
          console.log(result)
        });
        return dialogRef;
    }

    async mostrarCrearHeroe(){

        var tipoDialogo = null;
        var clases = await this.getClases();
        var config = {
            titulo: null,
            contenido: clases,
            inputLabel: null
        }

      const dialogCrearHeroe = this.dialog.open(CrearHeroeComponent,{
          width: "100px",panelClass: [tipoDialogo, "contenedorCrearHeroe"],backdropClass: "fondoCrearHeroe", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogCrearHeroe.afterClosed().subscribe(result => {
          console.log('Cierre Configuracion. Devuelve:');
          console.log(result)
        });

        return;
    }

    crearHeroe(nombreHeroe:string,clase:string,genero: "masculino"|"femenino",imagenId: number,dialogRef?){

        clase = clase.toLowerCase();
        var indexClase = datosIniciales.findIndex(i => i.clase == clase);
        var objetos = datosIniciales[indexClase].objetos;
        var hechizos = datosIniciales[indexClase].hechizos;
        var talentos = datosIniciales[indexClase].talentos;
        var misiones = datosIniciales[indexClase].misiones;

        var nuevoHeroe = {
            personaje: nombreHeroe,
            clase: clase,
            genero: genero,
            id_imagen: imagenId,
            nivel: 1,
            exp: 0,
            oro: 0,
            capacidad_inventario: 10,
            capacidad_banco: 10,
            tutorial: false,
            objetos: objetos,
            hechizos: hechizos,
            misiones: misiones,
            talentos: talentos,
            mundos: []
        }

        this.http.post(this.ipRemota+"/deliriumAPI/crearPersonaje",{idCuenta: this.cuenta.idCuenta, nuevoHeroe: nuevoHeroe, token: this.token}).subscribe((data) => {

            if(data["success"] && data["data"]){
                //PERSONAJE CREADO CON EXITO:
                console.log("Personaje creado con exito: ",data)
                this.setPerfil(data["data"]);
                if(dialogRef){
                    this.eventoAppService.emit("actualizarHeroeSeleccionado")
                    dialogRef.close();
                }
            }else{
                console.error("NO SE HA PODIDO CREAR EL PERSONAJE...",nuevoHeroe);
                this.mostrarDialogo("Error",{titulo: "Error creando personaje",contenido: data["message"]})
            }
        });

    }

    eliminarPersonaje(indexHeroeEliminar){
        //Valida el index:
        if(indexHeroeEliminar==null){
            this.mostrarDialogo("Error",{titulo: "Error eliminando personaje",contenido: "Error eliminando el personje"})
            this.eventoAppService.emit("actualizarHeroeSeleccionado")
            return;
        }

        this.http.post(this.ipRemota+"/deliriumAPI/eliminarPersonaje",{idCuenta: this.cuenta.idCuenta, indexHeroeEliminar: indexHeroeEliminar, token: this.token}).subscribe((data) => {

            if(data["success"] && data["data"]){
                //PERSONAJE CREADO CON EXITO:
                console.log("Personaje eliminado con exito: ",data)
                this.setPerfil(data["data"]);
                this.eventoAppService.emit("actualizarHeroeSeleccionado")
                this.mostrarDialogo("Informativo",{titulo: "Heroe eliminado",contenido: "El personaje se ha eliminado con exito."})
            }else{
                console.error("NO SE HA PODIDO ELIMINAR EL PERSONAJE...");
                this.eventoAppService.emit("actualizarHeroeSeleccionado")
                this.mostrarDialogo("Error",{titulo: "Error eliminando personaje",contenido: data["message"]})
            }
        });

    }

    mostrarConfiguracion(tipoDialogo:string, config:any):any{

      const dialogConfiguracion = this.dialog.open(ConfiguracionComponent,{
          width: "100px", panelClass: [tipoDialogo, "contenedorConfiguracion"], backdropClass: "fondoConfiguracion", disableClose: true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogConfiguracion.afterClosed().subscribe(result => {
          console.log('Cierre Configuracion. Devuelve:');
          console.log(result)

      if(result === "cerrarSesion") {
              this.logout();
      }

      if(result === "Developer Tool") {
        this.mostrarDeveloperTool("")
      }

      if(result === "ForzarSync") {
        this.observarAppService.next("ForzarSync");
      }

      if(result === "MultiControl") {
        this.observarAppService.next("MultiControl");
      }

        });

        return;
    }

    logout(){
        this.mostrarPantallacarga(true);

    setTimeout(()=>{
            this.setToken(null)
            this.setPerfil(null)
            this.setCuenta(null)
            //this.setSesion(null)
            this.observarAppService.next("logout");
            this.setControl("index");
            this.setEstadoApp("index");
    }, 1000);
    }



    mostrarSocial(tipoDialogo:string, config:any):any{

      const dialogSocial = this.dialog.open(SocialComponent,{
          width: "100px",panelClass: [tipoDialogo, "contenedorSocial"],backdropClass: "fondoSocial", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogSocial.afterClosed().subscribe(result => {
          console.log('Cierre Configuracion. Devuelve:');
          console.log(result)
        });

        return;
    }

    mostrarBugLog(val:string):void{
      this.bugLog.emit(val);
    }

    mostrarDeveloperTool(val:string):void{
      this.mostrarDialogo("Informativo",{contenido: "Abriendo Developer Tool"})
      window.electronAPI.openDesarrollador();
    }

    mostrarAjustes(val:string):void{
      this.ajustes.emit(val);
    }

    setSala(sala: any){
      this.sala= sala;
    }

    getSala(){
      return this.sala;
    }

    setEstadoInMap(estado:string){
        // Pone Nube -1s-> Cambia Mapa -1s-> CentraMapa -1s-> Quita Nubes
        this.cargandoMapa = true;
    setTimeout(()=>{
            this.estadoInMap = estado;
        setTimeout(()=>{
                this.eventoAppService.emit("centrarMapa")
            setTimeout(()=>{
                    this.cargandoMapa = false;
                },1000)
            },1000)
        },1000)
    }

    getPartida(){
       return this.sala;
    }

    async getCuenta(){

        //Recuperando Validación de Local DB:
        if(this.ionic){
            this.cuenta = await this.storage.get("cuenta");
        }else{
            this.cuenta = await window.electronAPI.getCuenta()
        }

       //console.log(this.cuenta);
       if(this.perfil==undefined){
         console.log("Obteniendo Datos: ");
         this.getDatosJuego()
       }
       return this.cuenta;
    }

    async getDatosJuego(){
      console.log("Accediendo a datos Locales:")
      this.token = await this.getToken();
      this.perfil = await this.getPerfil();
      this.clases = await this.getClases();
    }

    getPerfilRam(){
        return this.perfil;
    }

    async getPerfil(){
        if(this.ionic){
            this.perfil = await this.storage.get("perfil");
        }else{
            this.perfil = await window.electronAPI.getPerfil(); // REVISAR
        }
      return this.perfil;
    }

    async getClases(){
        if(this.ionic){
            this.clases = await this.storage.get("clases");
        }else{
            this.clases = await window.electronAPI.getDatosClases();
        }
      return this.clases;
    }

    async getObjetos(){
        if(this.ionic){
            this.objetos = await this.storage.get("objetos");
        }else{
            this.objetos = await window.electronAPI.getDatosObjetos();
        }
      return this.objetos;
    }

    async getPerks(){
        if(this.ionic){
            this.perks = await this.storage.get("perks");
        }else{
            this.perks = await window.electronAPI.getDatosPerks();
        }
      return this.perks;
    }

    async getHechizos(){
        if(this.ionic){
            this.hechizos = await this.storage.get("hechizos");
        }else{
            this.hechizos = await window.electronAPI.getDatosHechizos();
        }
      return this.hechizos;
    }

    async getBuff(){
        if(this.ionic){
            this.buff = await this.storage.get("buff");
        }else{
            this.buff = await window.electronAPI.getDatosBuff();
        }
       return this.buff;
    }

    async getAnimaciones(){
        if(this.ionic){
            this.animaciones = await this.storage.get("animaciones");
        }else{
            this.animaciones = await window.electronAPI.getDatosAnimaciones();
        }
      return this.animaciones;
    }

    async getEnemigos(){
        if(this.ionic){
            this.enemigos = await this.storage.get("enemigos");
        }else{
            this.enemigos = await window.electronAPI.getDatosEnemigos();
        }
      return this.enemigos;
    }

    async getEventos(){
        if(this.ionic){
            this.eventos = await this.storage.get("eventos");
        }else{
            this.eventos = await window.electronAPI.getDatosEventos();
        }
      return this.eventos;
    }

    async getMisiones(){
        if(this.ionic){
            this.misiones = await this.storage.get("misiones");
        }else{
            this.misiones = await window.electronAPI.getDatosMisiones();
        }
      return this.misiones;
    }

    async getParametros(){
        if(this.ionic){
            this.parametros = await this.storage.get("parametros");
        }else{
            this.parametros = await window.electronAPI.getDatosParametros();
        }
      return this.parametros;
    }

    async getMazmorra(){
      return this.mazmorra;
    }

    getSesion(){
        return this.sesion;
    }

    getDispositivo(){
        return this.dispositivo;
    }

    setDispositivo(dispositivo){
      this.dispositivo= dispositivo;
      return;
    }

    openDesarrollador(){
        window.electronAPI.openDesarrollador();
      return;
    }

    abandonarPartida(){
      this.observarAppService.next("AbandonarPartida");
      return;
    }

    abrirEvento(){

        var objetoEventoDialogo = {
          contenido: ["Titulo dialogo","orem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis turpis eu tortor pellentesque facilisis. Etiam vel euismod arcu, id eleifend justo. Morbi id faucibus urna. Donec ante lorem, volutpat eu accumsan sit amet, semper ut tellus. Pellentesque sodales mattis finibus. Proin tempor condimentum suscipit"],
          opciones: ["Primera opcion","Segunda Opcion","Tercera Opcion"],
        }

        var objetoEventoNarradorImg = {
          contenido: ["Titulo dialogo","orem ipsum dolor sit amet, consectetur adipiscing elit. Donec lobortis turpis eu tortor pellentesque facilisis. Etiam vel euismod arcu, id eleifend justo. Morbi id faucibus urna. Donec ante lorem, volutpat eu accumsan sit amet, semper ut tellus. Pellentesque sodales mattis finibus. Proin tempor condimentum suscipit"],
          opciones: ["Primera opcion","Segunda Opcion","Tercera Opcion"],
        }

        //this.mostrarDialogo("Mision",objetoEventoNarradorImg);

    }

    centrarMapa(){
        if(this.estadoInMap =="global"){
            this.eventoAppService.emit("region1")
        }else{
            this.eventoAppService.emit("centrarMapa")
        }
    }

 //*********************************
 // INMAP
 //*********************************

  getRegion(){
      return this.region;
  }

  getTile(x:number,y:number){
      return this.region.isometrico[x][y];
  }

  setTile(x:number,y:number,formGeneral:any,formTerreno:any,formEventos,formMisiones:any){

      console.log("Setting Tile")

        //Fomrulario General:
        this.region.isometrico[x][y].nombre = formGeneral.inMapNombre
        this.region.isometrico[x][y].descripcion = formGeneral.inMapDescripcion
        this.region.isometrico[x][y].indicador = formGeneral.inMapIndicador

        //Fomrulario General:
        this.region.isometrico[x][y].tipoTerreno = formTerreno.inMapTipoTerreno
        this.region.isometrico[x][y].atravesable = formTerreno.inMapAtravesable
        this.region.isometrico[x][y].inspeccionable = formTerreno.inMapInspeccionable
        this.region.isometrico[x][y].mensajeInspeccion = formTerreno.inMapMensajeInsapeccionable
        this.region.isometrico[x][y].ubicacionEspecial = formTerreno.inMapUbicacionEspecial
        //this.region.isometrico[x][y].visitado = formTerreno.inMapVisitado

        //Fomrulario Eventos:
        this.region.isometrico[x][y].categoriaEvento = formEventos.inMapCategoriaRandom
        this.region.isometrico[x][y].probabilidadEvento = formEventos.inMapProbabilidadRandom
        //this.region.isometrico[x][y].checkEventos = formEventos.inMapCheckTrigger

        //Fomrulario Misiones:
        //this.region.isometrico[x][y].checkMisiones = formMisiones.inMapCheckMisiones

      return true;
  }

  async cargarRegion(zona:string){

        this.cargandoMapa = true;
        var token = await this.getToken();
        if(zona== undefined || zona== null || zona==""){ console.log("Zona no valida"); return;}

    console.log("Cargando appService.region: "+zona);
    this.http.post(this.ipRemota+"/deliriumAPI/cargarRegion",{nombreRegion: zona, token: token}).subscribe((data) => {
      console.log("Región: ");
      console.log(data);
      this.region= data;
            //this.inicializarIsometricoMapa(); //Fuerza la carga de isometrico generado en desarrolladoService;
            //Cargar Render Isometrico:
            this.renderIsometrico = [];

            var radioVision = this.radioRenderIsometrico;

            if(this.estadoApp!="desarrollador"){
                var coordenadaMinX = this.sesion.inmap.posicion_x - radioVision;
                var coordenadaMinY = this.sesion.inmap.posicion_y - radioVision;
                var coordenadaMaxX = this.sesion.inmap.posicion_x + radioVision+1;
                var coordenadaMaxY = this.sesion.inmap.posicion_y + radioVision+1;

                //Bloqueo de valores de coordenadas:
                if(coordenadaMinX < 0){ coordenadaMinX = 0; }
                if(coordenadaMinY < 0){ coordenadaMinY = 0; }
                if(coordenadaMaxX > this.region.isometrico.length){ coordenadaMaxX = this.region.isometrico.length; }
                if(coordenadaMaxY > this.region.isometrico.length){ coordenadaMaxY = this.region.isometrico.length; }

                for(var i = coordenadaMinX; i < coordenadaMaxX; i++){
                    this.renderIsometrico.push(this.region.isometrico[i].slice(coordenadaMinY,coordenadaMaxY))
                }
            }else{
                //Si es el panel de desarrollador:
                this.renderIsometrico= this.region.isometrico;
            }

            console.log("RENDER ISOMETRICO: ")
            console.log(this.renderIsometrico)

            //REALIZA UNA REGULARIZACION:
            //this.regularizarRegion();

            this.eventoAppService.emit("inicializarIsometrico")
            this.setEstadoInMap("region");

        })
  }

    camellCase(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
    }

    regularizarRegion(){
            console.log("REGULARIZANDO RENDER ISOMETRICO")

            //Iteración por todos los tiles del render:
            var longitudX = this.region.isometrico[0].length;
            var longitudY = this.region.isometrico.length;
            for( var i = 0; i < longitudX; i++){
                for( var j = 0; j < longitudY; j++){
                    delete this.region.isometrico[i][j].tileBase;
                    delete this.region.isometrico[i][j].visitado;
                    delete this.region.isometrico[i][j].tileId;
                    delete this.region.isometrico[i][j].cogerMisionId;
                }
            }
            console.log(this.renderIsometrico)
    }

    entrarMundo(indexHeroeSeleccionado:number){
        this.heroeSeleccionadoIndex = indexHeroeSeleccionado;
		this.setHeroeSeleccionado(this.perfil.heroes[this.heroeSeleccionadoIndex])
        this.sesion.estadoSesion = "inmap";

        //Configurar Sesion:
        if(this.sesion.iniciada==false){

            //Inicializando Jugador:
            this.sesion.jugadores = [{
                    usuario: this.cuenta.usuario,
                    online: true,
                    lider: true,
                    personaje: this.heroeSeleccionado
                }]

            //Inicializando RENDER:
            var heroeRender = {
                  clase: this.heroeSeleccionado.clase,
                  nombre: this.heroeSeleccionado.personaje,
                  nivel: this.heroeSeleccionado.nivel,
                  id_imagen: this.heroeSeleccionado.id_imagen,
                  vida: 100,
                  escudo: 0,
                  energia: 100,
                  energiaFutura: 100,
                  acciones: 2,
                  recursoEspecial: 0,
                  estadisticas: {
                    armadura: null,
                    resistenciaMagica: null,
                    vitalidad: null,
                    pa: null,
                    ad: null,
                    ap: null,
                    critico: null,
                  },
                  cargaUlti: 0,
                  buff: [],
                  cooldown: [0,0,0,0,0],
                  oro: 0,
                  turno: true,
                  controlEnemigos: false,
                  objetivo: false,
                  objetivoAuxiliar: false,
                  animacion: 0,
                  online: true
                }

            this.sesion["render"]= {
                heroes: [heroeRender],
                enemigos: [],
                objetosGlobales: [],
                nivel_equipo: this.heroeSeleccionado.nivel,
                turno: 1,
                indexActivacionEnemigo: 0
            }

            //Inicializando INMAP:
            if(this.heroeSeleccionado.tutorial){
                this.sesion["inmap"]= {
                    posicion_x: 61,
                    posicion_y: 50,
                    mapa: "Asfaloth"
                }
            }else{
                this.sesion["inmap"]= {
                    posicion_x: 56,
                    posicion_y: 48,
                    mapa: "Asfaloth"
                }
            }

            this.sesion.online = true;
            this.sesion.iniciada = false;

        }//Fin configuracion de sesion
            
        //Cambiar a pantalla InMap:
        this.setEstadoApp("inmap");
    }

    async iniciarMazmorra(nombreIdMazmorra: string){

        //INICIANDO MAZMORRA:
        console.log("Iniciando Mazmorra: "+nombreIdMazmorra);
        this.mostrarPantallacarga(true);

        //CARGANDO MAZMORRA:
        var token = await this.getToken();
        this.http.post(this.ipRemota+"/deliriumAPI/cargarMazmorra",{nombreMazmorra: nombreIdMazmorra, token: token}).subscribe((data) => {

            if(data){
                //INICIANDO MAZMORRA:
                this.setMazmorra(data);
                console.log("MAZMORRA CARGADA: ");
                console.log(this.mazmorra);

                //Actualiza Sesión:
                this.sesion.estadoSesion = "mazmorra";
                this.sesion.render.mazmorra.nombreIdMazmorra = this.mazmorra.nombreId;

                //Cambia de componente:
                this.setControl("mazmorra");
                this.setEstadoApp("mazmorra");

            }else{
                console.error("NO SE HA PODIDO CARGAR LA MAZMORRA: "+nombreIdMazmorra);
            }

        });

       //this.mazmorra = await window.electronAPI.getMazmorra(nombreIdMazmorra);

        // 1) Cambio de estados AppService:
    //this.setSala(this.sala);
    }

    verInMap(){
        this.setEstadoApp("inmap");
    }

    abandonarMazmorra(){
        this.setMazmorra({});
        this.setControl("inmap");
        this.setEstadoApp("inmap");
    }

    funcionDesarrollo(){
        this.mostrarDialogo("Informativo",{titulo:"Prueba de dialogo",contenido: "Abriendo Developer Tool"})
    }


}

