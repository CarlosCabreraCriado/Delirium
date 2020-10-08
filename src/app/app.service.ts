
import { Injectable, EventEmitter, Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { ElectronService } from 'ngx-electron';
import { DialogoComponent } from './comun/dialogos/dialogos.component';
import { MatDialog} from '@angular/material/dialog';


@Injectable({
  providedIn: 'root'
})

export class AppService {

  	constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, public electronService: ElectronService,  private dialog: MatDialog) { 

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
            console.log(err);
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
    private heroeHech: any;
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

    // Observable string sources
    private observarAppService = new Subject<string>();

    // Observable string streams
    observarAppService$ = this.observarAppService.asObservable();

    // Observable string sources
    private observarTeclaPulsada = new Subject<string>();

    // Observable string streams
    observarTeclaPulsada$ = this.observarTeclaPulsada.asObservable();

    setToken(token){
      this.electronService.ipcRenderer.sendSync('setToken',token);
      this.token=token;
      return;
    }

    getToken() {
      this.token=this.electronService.ipcRenderer.sendSync('getToken');
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
     for(var i=0; i<this.bloqueo.length; i++){
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

  	audioTeclaPlay(): void{
  		let audio = new Audio();
  		audio.src = "./assets/sounds/tecla.mp3";
  		audio.load();
  		audio.play();
		}

	  //Router de tecla
  	teclaPulsada(tecla): void{
  		this.audioTeclaPlay();
  		this.observarTeclaPulsada.next(tecla);
  	}

    setInicio(datosJuego: any){

      var data= [];

      if(this.activarDatosOficiales){
        data= datosJuego.datosOficial;
      }else{
        data= datosJuego.datosDesarrollador;
      }

      for(var i=0; i<data.length; i++){
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
          case "Heroes_Hech":
            this.heroeHech = data[i];
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
      this.electronService.ipcRenderer.sendSync('setDatos',datosJuego);

      return;
    }

  	cambiarUrl(url): void{
      console.log("CAMBIANDO A URL: "+url);
  		this.router.navigateByUrl(url);
  	}

    mostrarPantallacarga(val:boolean):void{
      this.mostrarCarga.emit(val);
    }

    setProgresoCarga(val:string):void{
      this.progresoCarga.emit(val);
    }

    setValidacion(val:any):void{
      this.validacion= val;
      console.log(this.electronService.ipcRenderer.sendSync('setValidacion',this.validacion));
    }

    mostrarDialogo(tipoDialogo:string, config:any):void{
      const dialogRef = this.dialog.open(DialogoComponent,{
          panelClass: [tipoDialogo, "generalContainer"], disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Fin del dialogo');
          console.log(result)
        });
    }

    mostrarBugLog(val:string):void{
      this.bugLog.emit(val);
    }

    mostrarDeveloperTool(val:string):void{
      this.mostrarDialogo("Informativo",{contenido: "Abriendo Developer Tool"})
      this.electronService.ipcRenderer.sendSync('desarrollador');
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

    getValidacion(){
       console.log("Validando: ");
       console.log(this.electronService.ipcRenderer);
       this.validacion = this.electronService.ipcRenderer.sendSync('getValidacion');
       if(this.perfil==undefined){
         console.log("Obteniendo Datos: ");
         //this.setInicio();
       }
       if(this.validacion.nombre===undefined){}
       console.log(this.validacion);
       return this.validacion;
    }

    getDatos(clave):void{
      console.log("Accediendo a datos Locales:")
      this.setInicio(this.electronService.ipcRenderer.sendSync('getDatos'));
    }

    getHeroesStats(){
      if(this.heroeStat===undefined){
        if(this.activarDatosOficiales){
          this.heroeStat= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Heroes_Stats");
        }else{
          this.heroeStat= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Heroes_Stats");
        }
      }
      return this.heroeStat;
    }

    getHeroesHech(){
      if(this.heroeHech===undefined){
        if(this.activarDatosOficiales){
          this.heroeHech= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Heroes_Hech");
        }else{
          this.heroeHech= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Heroes_Hech");
        }
      }
      return this.heroeHech;
    }

    getBuff(){
      if(this.buff===undefined){
         if(this.activarDatosOficiales){
          this.buff= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Buff");
        }else{
          this.buff= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Buff");
        }
       }
       return this.buff;
    }

    getEnemigos(){
      if(this.enemigos===undefined){
        if(this.activarDatosOficiales){
          this.enemigos= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Enemigos");
        }else{
          this.enemigos= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Enemigos");
        }
      }
      return this.enemigos;
    }

    getAnimaciones(){
      if(this.animaciones===undefined){
        if(this.activarDatosOficiales){
          this.animaciones= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Animaciones");
        }else{
          this.animaciones= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Animaciones");
        }
      }
      return this.animaciones;
    }

    getParametros(){
      if(this.parametros===undefined){
        if(this.activarDatosOficiales){
          this.parametros= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Parametros");
        }else{
          this.parametros= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Parametros");
        }
      }
      return this.parametros;
    }

    getObjetos(){
      if(this.objetos==undefined){
        if(this.activarDatosOficiales){
          this.objetos= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Objetos");
        }else{
          this.objetos= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Objetos");
        }
      }
      return this.objetos;
    }

    getPerfil(){
       if(this.perfil===undefined){
          if(this.activarDatosOficiales){
            this.perfil= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Perfil");
          }else{
            this.perfil= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Perfil");
          }
        }
        return this.perfil;
    }

    getPersonajes(){
       if(this.personajes===undefined){
          if(this.activarDatosOficiales){
            this.personajes= this.electronService.ipcRenderer.sendSync('getDatos').datosOficial.find(i=> i.nombreId=="Personajes");
          }else{
            this.personajes= this.electronService.ipcRenderer.sendSync('getDatos').datosDesarrollador.find(i=> i.nombreId=="Personajes");
          }
        }
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
      this.electronService.ipcRenderer.sendSync('desarrollador');
      return;
    }

    setModelosDatos(){
      this.electronService.ipcRenderer.sendSync("setModelosDatos");
    }

    abandonarPartida(){
      this.observarAppService.next("AbandonarPartida");
      return;
    }

    subirArchivo(objetoArchivo):boolean{
      var documentos = [];
      documentos.push(objetoArchivo);
      return this.electronService.ipcRenderer.sendSync("actualizarEstadisticas", documentos);
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

    toggleDatosOficialesDesarrollador(){
      this.activarDatosOficiales= !this.activarDatosOficiales;
      this.setInicio(this.electronService.ipcRenderer.sendSync('getDatos'));
    }

}

