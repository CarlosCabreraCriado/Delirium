
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

      if(this.debug){
        console.log("*******************");
        console.log("DEBUG MODE:");
        console.log("Autovalidacion: "+this.debugAutoValidacion);
        console.log("*******************");

        //MODO INICIO CUENTA FIJA:
        if(!this.debugAutoValidacion){

          this.http.post(this.ipRemota+"/deliriumAPI/validacion",{clave: this.debugClave}).subscribe((data) => {
            if(data){
              this.token= data["token"];
              this.setInicio(data["datos"]);
              this.observarAppService.next("Iniciar");
              console.log("TOKEN: "+this.token)
            }
          },(err) => {
          });

        //MODO INICIO AUTOVALIDACION:
        }else{
          this.http.post(this.ipRemota+"/deliriumAPI/autoValidacion",true).subscribe((data) => {
            if(data){
              console.log("ESTADO: ");
              this.token= data["token"];
              this.setInicio(data["datos"]);
              this.observarAppService.next("Iniciar");
            }
          },(err) => {
            console.log(err);
          });
        }
        
      }//FINAL DEBUG
    }

    //MODO DEBUG:
    public debug:boolean=false;
    public debugAutoValidacion:boolean=false;
    public debugClavesAuto=[1000,2307,2305,2567,9867];
    public debugClave:number=9867;
    //public ipRemota: string= "http://www.carloscabreracriado.com";
    public ipRemota: string= "http://127.0.0.1:8000";
    private token: string;

    //Variables de configuración:
    public activarDatosOficiales= true;

    //Variables de datos:
    public datosJuego: any;
    public perfil:any;

    //Definicion estadisticas generales:
    private hechizos: any;
    private heroeStat: any;
    private enemigos: any;
    private buff: any;
    private objetos: any;
    private animaciones: any;
    private parametros: any;
    private personajes: any;

    public dispositivo: string;
    public version: string = "0.2.3";
    public control:string="null";
    private bloqueo: any= [0,0,0,0];
    private autoDesbloqueo: boolean= true;
    private validacion: any= false;
    public claveValida: boolean= false;
    private sala: any={};
	private heroeSeleccionado = null;

    // Observable string sources
    private observarAppService = new Subject<string>();

    // Observable string streams
    observarAppService$ = this.observarAppService.asObservable();

    // Observable string sources
    private observarTeclaPulsada = new Subject<string>();

    // Observable string streams
    observarTeclaPulsada$ = this.observarTeclaPulsada.asObservable();

    setToken(token){

	  console.log("Obteniendo Token: ");
	  console.log(token);

	  window.electronAPI.setToken(token)
      this.token=token;
      return;
    }

    async getToken() {
      this.token = await window.electronAPI.getToken();
      return this.token;
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

    setInicio(datosJuego: any){

	  if(datosJuego == null){return;}

      var data= [];

      if(this.activarDatosOficiales){
        data= datosJuego.datosOficial;
        //data= datosJuego;
      }else{
        data= datosJuego.datosDesarrollador;
        //data= datosJuego;
      }

      console.log(data);

      for(var i=0; i <data.length; i++){
        switch(data[i].nombreId){
          case "Perfil":
            this.perfil = data[i];
          break;
          case "Claves":
            this.setValidacion(data[i]);
          break;
          case "Objetos":
            this.objetos = data[i];
          break;
          case "Animaciones":
            this.animaciones = data[i];
          break;
          case "Enemigos":
            this.enemigos = data[i];
          break;
          case "Buff":
            this.buff = data[i];
          break;
          case "Heroes_Stats":
            this.heroeStat = data[i];
          break;
          case "Hechizos":
            this.hechizos = data[i];
          break;
          case "Parametros":
            this.parametros = data[i];
          break;
          case "Personajes":
            this.personajes = data[i];
          break;
        }
      }

      console.log("Sesion Iniciada: ");
      console.log(this.validacion);
      console.log("Datos de Juego: ");
      console.log(data);

      window.electronAPI.setDatos(data)

      return;
    }

	crearCuenta(correo,usuario,password,password2){

	}

  	cambiarUrl(url): void{
        console.log("CAMBIANDO A URL: "+url);
  		this.router.navigateByUrl(url);
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

    async setValidacion(val:any){
      this.validacion= val;
      console.log("SET VALIDACION")
      console.log(this.validacion);
      console.log(await window.electronAPI.setValidacion(this.validacion));
    }

	renderizarCanvasIsometrico(){
		this.observarAppService.next("renderizarCanvasIsometrico");
		return;
	}

    mostrarDialogo(tipoDialogo:string, config:any):any{

      const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px",panelClass: [tipoDialogo, "generalContainer"],backdropClass: "fondoDialogo", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
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
			this.cambiarUrl("");
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
      this.cambiarUrl("inmap");
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

    getPartida(){
       return this.sala;
    }

    async getValidacion(){

       console.log("Obteniendo Validando: ");
       //console.log(this.electronService.ipcRenderer);

       this.validacion = await window.electronAPI.getValidacion() 

       console.log(this.validacion);

       if(this.perfil==undefined){
         console.log("Obteniendo Datos: ");
		 this.getDatos(this.validacion.clave)
       }

       if(this.validacion.nombre===undefined){}

       console.log(this.validacion);
       return this.validacion;
    }

    async getDatos(clave){
      console.log("Accediendo a datos Locales:")
      var datos = await window.electronAPI.getDatos()
      //this.setInicio(datos);
    }

    async getHeroesStats(){
      this.heroeStat = await window.electronAPI.getDatosHeroeStat();
      return this.heroeStat;
    }

    async getHechizos(){
      this.hechizos = await window.electronAPI.getDatosHeroeHech();
      return this.hechizos;
    }

    async getBuff(){
      this.buff = await window.electronAPI.getDatosBuff();
       return this.buff;
    }

    async getEnemigos(){
      this.enemigos = await window.electronAPI.getDatosEnemigos();
      return this.enemigos;
    }

    async getAnimaciones(){
      this.animaciones = await window.electronAPI.getDatosAnimaciones();
      return this.animaciones;
    }

    async getParametros(){
      this.parametros = await window.electronAPI.getDatosParametros();
      return this.parametros;
    }

    async getObjetos(){
      this.objetos = await window.electronAPI.getDatosObjetos();
      return this.objetos;
    }

    async getPerfil(){
      this.perfil = await window.electronAPI.getDatosPerfil(); // REVISAR
      return this.perfil;
    }

    async getPersonajes(){
      this.personajes = await window.electronAPI.getDatosPersonajes();
      return this.personajes;
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

    setModelosDatos(){
      window.electronAPI.setModelosDatos({"oficial":false});
    }

    abandonarPartida(){
      this.observarAppService.next("AbandonarPartida");
      return;
    }

    async subirArchivo(objetoArchivo){
      var documentos = [];
      documentos.push(objetoArchivo);
      var confirmacion = await window.electronAPI.actualizarEstadisticas(documentos) 
      return confirmacion;
    }

    toggleDatosOficiales(){
      this.activarDatosOficiales= !this.activarDatosOficiales;
      
      this.setValidacion({});
      //this.validacion = {};
      //this.socketService.enviarSocket("logout",this.validacion);
      this.claveValida = false;
      this.setSala({});
      this.setControl("");
      this.cambiarUrl("index");
      console.log(this.route.url)
      this.mostrarDialogo("Informativo",{titulo: "Configuración de datos",contenido: "Configuración de datos cambiada con exito. Vuelva a iniciar sesión para consolidar los cambios. Datos Oficiales: "+this.activarDatosOficiales})
      //this.setInicio(this.electronService.ipcRenderer.sendSync('getDatos'));
    }

    async toggleDatosOficialesDesarrollador(){
      this.activarDatosOficiales= !this.activarDatosOficiales;
	  await window.electronAPI.setModelosDatos({"oficial":this.activarDatosOficiales})
      this.setInicio(await window.electronAPI.getDatos());
    }


}

