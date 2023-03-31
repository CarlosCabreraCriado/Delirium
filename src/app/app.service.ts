
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

@Injectable({
  providedIn: 'root'
})

export class AppService {

  	constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private dialog: MatDialog, private socialComponent: MatDialog, private dialogoConfiguracion: MatDialog, private dialogCrearHeroe: MatDialog) { 

      console.log("Detectando Dispositivo: ");
      console.log(navigator.userAgent);

      if(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|CriOS/i.test(navigator.userAgent)){
         console.log("MODO MOVIL")
         this.dispositivo="Movil";
      } else if (/iPad|Mobile|mobile/i.test(navigator.userAgent)){
         console.log("MODO TABLET")
         this.dispositivo="Tablet";
      }else{
         console.log("MODO DESKTOP")
         this.dispositivo="Desktop";
      }

    }

    //public ipRemota: string= "http://www.carloscabreracriado.com";
    public ipRemota: string= "http://127.0.0.1:8000";

    //Variables de configuración:
    public activarDatosOficiales= true;

    //Datos: 
    private cuenta: any = null
    public token: string = null;

    //Variables de datos:
    public perfil:any;
    public datosJuego: any;
    public sesion: any;
    public region: any;
    public renderIsometrico: any;
    public radioRenderIsometrico: number = 6;
    public escalaIsometrico: number = 3;

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

    public dispositivo: string;
    public version: string = "0.2.3";
    public control:string="null";
    private bloqueo: any= [0,0,0,0];
    private autoDesbloqueo: boolean= true;
    public claveValida: boolean= false;
    private sala: any={};
	private heroeSeleccionado = null;

    //Estados:
    public estadoApp = "";
    public estadoInmap = "global";

    // Observable string sources
    private observarAppService = new Subject<string>();

    // Observable string streams
    observarAppService$ = this.observarAppService.asObservable();

    // Observable string sources
    private observarTeclaPulsada = new Subject<string>();

    // Observable string streams
    observarTeclaPulsada$ = this.observarTeclaPulsada.asObservable();

    setEstadoApp(estado: string){
        this.estadoApp = estado;
    }

    setToken(token){
	  console.log("Guardando Token: ");
	  console.log(token);
	  window.electronAPI.setToken(token)
      this.token=token;
      return;
    }

    async getToken() {
      this.token = await window.electronAPI.getToken();
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

	  window.electronAPI.setPerfil(perfil)
      this.perfil=perfil;
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
          break;
          case "Objetos":
            this.objetos = datosJuego[i];
          break;
          case "Perks":
            this.perks = datosJuego[i];
          break;
          case "Hechizos":
            this.hechizos = datosJuego[i];
          break;
          case "Buff":
            this.buff = datosJuego[i];
          break;
          case "Animaciones":
            this.animaciones = datosJuego[i];
          break;
          case "Enemigos":
            this.enemigos = datosJuego[i];
          break;
          case "Misiones":
            this.misiones = datosJuego[i];
          break;
        }
      }

      console.log("Datos de Juego: ");
      console.log(datosJuego);

      window.electronAPI.setDatosJuego(datosJuego)

      return;
    }

    setEventos(eventos: any){
        this.eventos = eventos
        window.electronAPI.setEventos(eventos)
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
      console.log(await window.electronAPI.setCuenta(this.cuenta));
    }

	renderizarCanvasIsometrico(){
		this.observarAppService.next("renderizarCanvasIsometrico");
		return;
	}

    mostrarDialogo(tipoDialogo:string, config:any):any{

      const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px", panelClass: [tipoDialogo, "generalContainer"],backdropClass: "fondoDialogo", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido,opciones: config.opciones, inputLabel: config.inputLabel}
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

    mostrarCrearHeroe(tipoDialogo:string, config:any):any{

      const dialogCrearHeroe = this.dialog.open(CrearHeroeComponent,{
          width: "100px",panelClass: [tipoDialogo, "contenedorCrearHeroe"],backdropClass: "fondoCrearHeroe", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogCrearHeroe.afterClosed().subscribe(result => {
          console.log('Cierre Configuracion. Devuelve:');
          console.log(result)

		  if(result === "crearHeroe") {
		  }

        });

        return;
    }

    mostrarConfiguracion(tipoDialogo:string, config:any):any{

      const dialogConfiguracion = this.dialog.open(ConfiguracionComponent,{
          width: "100px",panelClass: [tipoDialogo, "contenedorConfiguracion"],backdropClass: "fondoConfiguracion", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogConfiguracion.afterClosed().subscribe(result => {
          console.log('Cierre Configuracion. Devuelve:');
          console.log(result)

		  if(result === "cerrarSesion") {
			this.setControl("index");
            this.setCuenta({})
			this.setEstadoApp("index");
		  }

		  if(result === "developerTool") {
			  this.mostrarDeveloperTool("")
		  }

        });

        return;
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

    setEstadoInmap(estado:string){
        this.estadoInmap = estado; 
    }

    getPartida(){
       return this.sala;
    }

    async getCuenta(){

       console.log("Obteniendo Validando: ");
       //console.log(this.electronService.ipcRenderer);

       this.cuenta = await window.electronAPI.getCuenta() 

       console.log(this.cuenta);

       if(this.perfil==undefined){
         console.log("Obteniendo Datos: ");
		 this.getDatosJuego()
       }

       console.log(this.cuenta);
       return this.cuenta;
    }

    async getDatosJuego(){
      console.log("Accediendo a datos Locales:")
      var datos = await window.electronAPI.getDatosJuego()
      //this.setInicio(datos);
    }

    async getPerfil(){
      this.perfil = await window.electronAPI.getPerfil(); // REVISAR
      return this.perfil;
    }

    async getClases(){
      this.hechizos = await window.electronAPI.getDatosClases();
      return this.hechizos;
    }

    async getObjetos(){
      this.objetos = await window.electronAPI.getDatosObjetos();
      return this.objetos;
    }

    async getPerks(){
      this.perks = await window.electronAPI.getDatosPerks();
      return this.perks;
    }

    async getHechizos(){
      this.hechizos = await window.electronAPI.getDatosHechizos();
      return this.hechizos;
    }

    async getBuff(){
      this.buff = await window.electronAPI.getDatosBuff();
       return this.buff;
    }

    async getAnimaciones(){
      this.animaciones = await window.electronAPI.getDatosAnimaciones();
      return this.animaciones;
    }

    async getEnemigos(){
      this.enemigos = await window.electronAPI.getDatosEnemigos();
      return this.enemigos;
    }

    async getEventos(){
      this.eventos = await window.electronAPI.getDatosEventos();
      return this.eventos;
    }

    async getMisiones(){
      this.misiones = await window.electronAPI.getDatosMisiones();
      return this.misiones;
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
        this.eventoAppService.emit("centrarMapa")
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

        if(zona== undefined || zona== null || zona==""){ console.log("Zona no valida"); return;} 

		console.log("Cargando appService.region: "+zona);
        var token = await this.getToken();
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

            this.eventoAppService.emit("cargarIsometrico")
            this.setEstadoInmap("isometrico");
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

}

