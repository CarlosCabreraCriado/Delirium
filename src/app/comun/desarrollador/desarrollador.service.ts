
import { Type,Injectable, OnInit} from '@angular/core';
import { AppService } from '../../app.service';
import { HttpClient } from "@angular/common/http";
import { RenderReticula } from './renderReticula.class';
import { Subject } from "rxjs";
import * as XLSX from 'xlsx';
import { TipoDatos } from "./tiposDesarrollador.class"
import { directorioAssets } from "./propiedadesAssets"
import { datosDefecto } from "./datosDefecto"
import { TriggerComponent } from './triggerComponent/trigger.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})

export class DesarrolladorService implements OnInit{

  //Variables de control:
    public cuenta: any= {}

  //Variables de Estado Paneles Principales:
    public panel= "datos";
    public estadoInmap= "global";
    public estadoMazmorra= "parametros";
    public estadoParametros= "General";
    public estadoHerramientaDatos: TipoDatos= null;
    public estadoPanelDatosDerecha= "";
    public estadoPanelBuffRelacionado= "";
    public indexBuffRelacionadoIndex = 0;
    public estadoDatos= "subir";
    public estadoAssets= "";
    public estadoDatosSubir= "subir";
    public claseSeleccionada= "Guerrero";
    public indexClaseSeleccionada= 0;
    public tipoObjetoSeleccionado= "Equipo";
    public indexEquipoSeleccionado= 0;
    public indexConsumibleSeleccionado= 0;

  //VARIABLES DE DATOS
    public archivosExcel: any= [];
    public archivoDato: any;
    public archivoDatoProvisional: any;

    public archivoSeleccionado="Heroes_Stats";
    public indexArchivoSeleccionado= 0;
    public archivoSeleccionadoProvisional= "Null";

  //Mensajes:
    public mostrarMensaje= false;
    public mostrarSpinner= true;
    public mostrarBotonAceptar= false;
    public mensaje= "Actualizando Datos..."

    //Selector de imagenes:
    public mostrarSelectorImagen= false;
    public estadoSelectorImagen= "";
    public pathImagenes = "Habilidades/Spell";

  //Logger Consola
    public logger=[];
    private loggerColor=[];

  //Variables Mazmorra
    public mazmorra:any = {};
    public listaMazmorra:any= [];
    public mostrarCargarMazmorra = false;

    public mazmorraInicializada = false;
    private mazmorraNombreId= "";
    private renderReticula= {}  as RenderReticula;
    private numFilasIni= 27;
    private numColumnasIni= 37;
    private margenReticula= 6;
    private cuentaIndexPieza= 0;

    private activarLimiteReticula: boolean = false;
    private limiteReticulaXMin:number = 0;
    private limiteReticulaXMax: number = 19;

    private limiteReticulaYMin: number = 0;
    private limiteReticulaYMax: number = 11;

    private visorNumFilaIni:number = 14;
    private visorNumColumnaIni: number= 24;

    private visorFila;
    private visorColumna;

  //Variables Mazmorra Isometrico
    public mostrarIsometrico = false;
    public isometrico: any = null;
    public mostrarGrid= true
    public mostrarDecorado = true;
    public mostrarSalaNula = true;

    public mostrarPanelAsignarSala = false;
    public mostrarPanelAsignarEvento = false;

    //Variables Inmap:
    private regionInmap:number = 1;
    private region: any = {};
    public coordenadaX: number = 0;
    public coordenadaY: number = 0;
    private regionSeleccionada: string = "";
    private tileImgSeleccionado: number = 1;
    public opcionPropiedades: string = "trigger";
    public opcionesDesarrolloInMap: any = {
        opcionOverlay: false,
        herramientaInMap: "add",
        tileImgSeleccionado: 1,
        regionSeleccionada: ""
    }

   //Variables de parametros:
    public salaSeleccionadaId = 0;
    public enemigoSeleccionadoId = 0;
    public enemigoSeleccionadoSalaIndex = 0;
    public eventoSeleccionadoId = 0;

    public hechizoSeleccionadoIndex = 0;
    public buffSeleccionadoIndex = 0;
    public animacionSeleccionadoIndex = 0;
    public subanimacionSeleccionadoIndex = 0;
    public sonidoSeleccionadoIndex = 0;
    public enemigoSeleccionadoIndex = 0;
    public eventoSeleccionadoIndex = 0;
    public tipoOrdenSeleccionada = "Condición";
    public ordenSeleccionadaIndex = 0;
    public misionSeleccionadaIndex = 0;
    public objetivoMisionSeleccionadoIndex = 0;

    public imagenes: any= [];
    public tipoEnemigoSeleccionado:any;
    private rotacion=0;

    //CARGA DE DATOS:
    public clases: any;
    public objetos: any;
    public perks: any;
    public hechizos: any;
    public buff: any;
    public animaciones: any;
    public subanimaciones: any;
    public sonidos: any;
    public enemigos: any;
    public eventos: any;
    public misiones: any;

    //Efectos:
	private efectoSonido = new Audio();

  // Observable string sources
    private observarDesarrolladorService = new Subject<string>();

  // Observable string streams
  observarDesarrolladorService$ = this.observarDesarrolladorService.asObservable();


  constructor(public appService: AppService, private http: HttpClient, private dialog: MatDialog)  {
  }

  ngOnInit(){
  }

  async inicializarGestor(){

    console.log("INICIANDO HERRAMIENTA DESARROLLADOR");
    this.cuenta= await this.appService.getCuenta();
    this.clases = await this.appService.getClases();
    this.objetos = await this.appService.getObjetos();
    this.perks = await this.appService.getPerks();
    this.hechizos = await this.appService.getHechizos();
    this.buff = await this.appService.getBuff();
    this.animaciones = await this.appService.getAnimaciones();
    this.enemigos= await this.appService.getEnemigos();
    this.eventos = await this.appService.getEventos();
    this.misiones = await this.appService.getMisiones();

    console.log("Cuenta:")
    console.log(this.cuenta)
    console.log("Clases:")
    console.log(this.clases)
    console.log("Objetos:")
    console.log(this.objetos)
    console.log("Perks:")
    console.log(this.perks)
    console.log("Hechizos:")
    console.log(this.hechizos)
    console.log("Buff:")
    console.log(this.buff)
    console.log("Animaciones:")
    console.log(this.animaciones)
    console.log("Enemigos:")
    console.log(this.enemigos)
    console.log("Eventos:")
    console.log(this.eventos)
    console.log("Misiones:")
    console.log(this.misiones)

    this.seleccionarClase("Guerrero")
    this.seleccionarBuff(0)
    this.seleccionarHechizo(0)
    this.seleccionarEnemigo(0)
    this.seleccionarEvento(0)
    this.seleccionarAnimacion(0)
    this.seleccionarSubanimacion(0)

    //Inicializacion de valores paneles:
    this.panel= "datos";
    this.estadoHerramientaDatos= "Enemigos";

    //Inicializar Imagenes:
    for(var i=1; i <308; i++){
        this.imagenes.push(i);
    }

  }

  inicializarArchivos(){
    console.log("Iniciando")
    //Inicializar Estructura de Datos:
    this.archivosExcel= [];
    var nombresArchivos= ["Heroes_Stats","Hechizos","Enemigos","Buff","Objetos","Animaciones","Parametros","Perfil","Personajes"];

    for(var i = 0; i <nombresArchivos.length; i++){
      this.archivosExcel.push(
        {
          nombreArchivo: nombresArchivos[i],
          estado: "subir",
          workbook: {},
          path: "",
          objetoArchivo: {},
          verificado: false,
          error: false
        });
    }

    console.log("Archivos: ");
    console.log(this.archivosExcel);
  }

  setPanel(panel):void{
    this.panel= panel;
  }

  inicializarIsometricoMapa(){

      var dimensionX = 72;
      var dimensionY = 72;

      var isometricoMapa = []
      for(var i = 0; i < dimensionX; i++){

        isometricoMapa[i] = [];

        for(var j = 0; j < dimensionY; j++){

            isometricoMapa[i][j]={
                coordenadaX: i,
                coodenadaY: j,
                tileBase: false,
                tileId: 0,
                tileImage: 0,
                //tileImage: 209,
                //tileImage: Math.floor(Math.random() * 216)+1,
                tipoTerreno: "tierra",
                atravesable: true,
                visitado: false,
                eventoId: 0,
                indicadorEvento: false,
                cogerMisionId: 0,
                indicadorCogerMision: false,
                indicadorPeligro: false,
                indicadorTerronoDificil: false,
                probabilidadEventoCamino: 0,
                categoriaEventoCamino: "",
                nombre: "",
                descripcion: "",
                checkEventos: [],
                animacionId: 0,
                estado: "",
                inspeccionable: false,
                mensajeInspeccion: ""
            }
        }
      }

      console.log("ISOMETRICO INICIALIZADO: ")
      this.region = {
          nombreId: "Asfaloth",
          isometrico: isometricoMapa,
          dimensionX: dimensionX,
          dimensionY: dimensionY,
          escala: 0.3,
          posicionTop: "1066px",
          posicionLeft: "2936px"
      }

      console.log(this.region)

  }


  // *************************************************
  //    CONSOLA:
  // *************************************************

  log(mensaje:any,color?:any):void{
     this.logger.push(mensaje);
     if(color=="undefined"){
       this.loggerColor.push("white");
     }else{
       this.loggerColor.push(color);
     }
   }

// *************************************************
//    PANEL MAZMORRA:
// *************************************************

  nuevaMazmorra(){
    this.mazmorra= {
      general: [
          {
              "evento_start_id": 0,
              "loot_finish_id": 0,
              "nombre": "",
              "descripcion": "",
              "imagen_id": 0,
              "evento_finish_id": 0,
              "nivel": 0
          }
      ],
      salas: [],
      enemigos: [],
      dialogos: [],
      eventos: [],
      celdas: [],
      nombre: "",
      nombreId: "Mazmorra"
    }

    this.inicializarReticula();
    //this.observarDesarrolladorService.next("reloadReticula");
    this.observarDesarrolladorService.next("reloadForm");
    this.mazmorraInicializada= true;
  }

  cerrarMazmorra(){
    this.mazmorra= {}
    //this.inicializarReticula();
    this.mazmorraInicializada=false;
    this.salaSeleccionadaId=0;
    return;
  }

  async cargarMazmorra(){
    var token = await this.appService.getToken();
    this.http.post(this.appService.ipRemota+"/deliriumAPI/listaMazmorra",{token: token}).subscribe((res) => {
      if(res){
        console.log("Lista de mazmorras");
        console.log(res);
        this.listaMazmorra= res;
        this.mostrarCargarMazmorra=true;
      }else{
        console.log("Fallo en la obtención de mazmorras");
      }
    },(err) => {
      console.log(err);
    });
  }

  seleccionarMazmorra(index){

    //Cargar Mazmorra:
    this.mazmorra= this.listaMazmorra[index];

    //Inicializar variables de control Builder:
    for(var i=0; i <this.mazmorra.salas.length; i++){
        this.mazmorra.salas[i].mostrarIsometrico = true;
    }

    this.visorFila= [];
    this.visorColumna=[];
    for (var i = 0; i < this.visorNumFilaIni; ++i) {this.visorFila.push(i);}
    for (var i = 0; i < this.visorNumColumnaIni; ++i) {this.visorColumna.push(i);}
    this.renderReticula.celdas= this.mazmorra.celdas;
    this.mostrarCargarMazmorra= false;
    this.observarDesarrolladorService.next("reloadForm");
    this.mazmorraInicializada= true;
  }

  async guardarMazmorra(){

    //Procesar Guardado de celdas:
    //this.mazmorra.celdas = this.procesarGuardadoCeldas();

    console.log(this.mazmorra);

    this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarMazmorra",{mazmorra: this.mazmorra, token: await this.appService.getToken()}).subscribe((res) => {
      if(res){
        console.log("Mazmorra guardada en Base de datos");
        this.mostrarBotonAceptar= true;
        this.mostrarSpinner= false;
        this.mensaje= "Mazmorra guardada con exito";
        this.mostrarMensaje= true;
      }else{
        console.log("Fallo en el guardado");
      }
    },(err) => {
      console.log(err);
    });

    return;
  }

  procesarGuardadoCeldas(){
        var objetoReticula = Object.assign([],this.renderReticula.celdas)

        //Procesar Celdas:
        //Procesado eje X:
        var flagBorrado = true;
        for(var i=0; i <objetoReticula.length; i++){
            flagBorrado= true;
            for(var j=0; j <objetoReticula[i].length; j++){ if(objetoReticula[i][j].pieza!= "none"){
                    flagBorrado= false;
                }
            }

            if(flagBorrado){
                objetoReticula.splice(i,1);
                i--;
            }
        }

        //Procesar Eje Y:
        for(var i=0; i <objetoReticula[0].length; i++){
            flagBorrado= true;
            for(var j=0; j <objetoReticula.length; j++){
               if(objetoReticula[j][i].pieza!= "none"){
                    flagBorrado= false;
                }
            }

            if(flagBorrado){
                for(var j=0; j <objetoReticula.length; j++){
                    objetoReticula[j].splice(i,1);
                }
                i--;
            }
        }

        return objetoReticula
  }

  async eliminarMazmorra(){
    this.http.post(this.appService.ipRemota+"/deliriumAPI/eliminarMazmorra",{mazmorra: this.mazmorra, token: await this.appService.getToken()}).subscribe((res) => {
      if(res){
        console.log("Mazmorra eliminada con exito");
      }else{
        console.log("Fallo en la eliminación de la mazmorra");
      }
    },(err) => {
      console.log(err);
    });

    return;
  }

  inicializarReticula(){

    this.renderReticula= {
      estado: '',
      comando: '',
      celdas: []
    }

    this.visorFila= [];
    this.visorColumna=[];
    for (var i = 0; i < this.visorNumFilaIni; ++i) {this.visorFila.push(i);}
    for (var i = 0; i < this.visorNumColumnaIni; ++i) {this.visorColumna.push(i);}

    var numFilas = this.numFilasIni;
    var numColumnas = this.numColumnasIni;

    var vectorFila= []
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }

    //Creación reticula:
    for(var i= 0; i <numFilas; i++){

      //Creación de la fila:
      vectorFila= []
      for(var j= 0; j <numColumnas; j++){
        objetoSector.X= i-this.margenReticula;
        objetoSector.Y= j-this.margenReticula;

        vectorFila.push(Object.assign({},objetoSector));
      }

      this.renderReticula.celdas.push(Object.assign([],vectorFila));
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    //Ajuste de 0:
    for (var i = 0; i < this.visorColumna.length; ++i) {
      this.visorColumna[i]= this.visorColumna[i]+this.margenReticula;
    }

    for (var i = 0; i < this.visorFila.length; ++i) {
      this.visorFila[i]= this.visorFila[i]+this.margenReticula;
    }

    console.log(this.renderReticula)
    return this.renderReticula;
  }

  addFilaReticula(posicion){
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }

    var vectorFila = [];
    var numColumnas = this.renderReticula.celdas[0].length;
    var numFilas = this.renderReticula.celdas.length;

    switch (posicion) {
      case "bottom":
          for(var j= 0; j <numColumnas; j++){
            objetoSector.X= numFilas-this.margenReticula;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.push(Object.assign([],vectorFila));
        break;

      case "top":
          for(var j= 0; j <numColumnas; j++){
            objetoSector.X= this.numFilasIni-numFilas-this.margenReticula-1;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.unshift(Object.assign([],vectorFila));
        break;
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    return;
  }

  addColumnaReticula(posicion){
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }
    var numColumnas = this.renderReticula.celdas[0].length;
    var numFilas = this.renderReticula.celdas.length;

    switch (posicion) {
      case "right":
        for (var i = 0; i < numFilas; ++i) {
          objetoSector.X= i-this.margenReticula;
          objetoSector.Y= numColumnas-this.margenReticula;
          this.renderReticula.celdas[i].push(Object.assign({},objetoSector))
        }
        break;

      case "left":
        for (var i = 0; i < numFilas; ++i) {
          objetoSector.X= i-this.margenReticula;
          objetoSector.Y= this.numColumnasIni-numColumnas-this.margenReticula-1;
          this.renderReticula.celdas[i].unshift(Object.assign({},objetoSector))
        }
        break;
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    return;
  }

  getReticula(){return this.renderReticula;}
  getRegion(){return this.appService.getRegion();}

  async getTile(x:number,y:number){
      return this.appService.getTile(x,y);
  }

  async setTile(x:number,y:number,formGeneral:any,formTerreno:any,formEventos,formMisiones:any){
      return this.appService.setTile(x,y,formGeneral,formTerreno,formEventos,formMisiones);
  }

  moverReticula(movimiento){
    console.log("Cambiando Reticula")
    switch (movimiento) {
      case "right":
        if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1] <this.margenReticula+2){
          this.addColumnaReticula("right")
        }
        for (var i = 0; i < this.visorColumna.length; ++i) {
          this.visorColumna[i]++;
        }
        break;

      case "left":

        if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1]>this.margenReticula){
            this.addColumnaReticula("left")
        }else{
          for (var i = 0; i < this.visorColumna.length; ++i) {
            this.visorColumna[i]--;
          }
        }
        break;

      case "up":
        if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1]>this.margenReticula){
          this.addFilaReticula("top")
        }else{
          for (var i = 0; i < this.visorFila.length; ++i) {
            this.visorFila[i]--;
          }
        }

        break;

      case "down":

        if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1] <this.margenReticula+2){
          this.addFilaReticula("bottom")
        }

        for (var i = 0; i < this.visorFila.length; ++i) {
          this.visorFila[i]++;
        }
        break;

      default:
        // code...
        break;
    }
  }

  addPieza(tipoPieza){
    this.log("Añadir pieza: "+tipoPieza,"orange");
    this.renderReticula.estado="add"
    this.renderReticula.comando= tipoPieza;
    return;
  }

  renderAnchoSector(){
    var width = 5;
    width= 100/this.visorColumna.length;
    return width+"%";
  }

  renderAltoSector(){
    var height = 8.33;
    height= 100/this.visorFila.length
    return height+"%";
  }

  toggleIsometrico(){
    this.mostrarIsometrico= !this.mostrarIsometrico;

    if(this.mostrarIsometrico){
        this.estadoMazmorra="isometrico";
    }else{
        this.estadoMazmorra="seleccionar"
    }

    console.log("Isometrico: "+this.mostrarIsometrico);
    return;
  }

  toggleVerCapaIsometrico(capa: string){
      switch(capa){
          case "grid":
            this.mostrarGrid = !this.mostrarGrid;
              break;
          case "decorado":
            this.mostrarDecorado = !this.mostrarDecorado;
              break;
      }
    return;
  }

  zoomIn(){
    this.visorFila.pop();
    this.visorColumna.pop();
    return;
  }

  zoomOut(){

    this.visorFila.push(this.visorFila[this.visorFila.length-1]+1);
    this.visorColumna.push(this.visorColumna[this.visorColumna.length-1]+1);
    if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1] <this.margenReticula){
      this.addColumnaReticula("right")
    }
    if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1] <this.margenReticula){
      this.addFilaReticula("bottom")
    }

    return;
  }

  clickSector(x,y){
    console.log("X: "+x);
    console.log("Y: "+y);
    console.log(this.renderReticula.celdas[x][y])

    switch (this.renderReticula.estado) {
      case "add":
        var colision= false;
        var bordeSize = 3;
        var bordeColor = "black";
        this.cuentaIndexPieza++;

        switch (this.renderReticula.comando) {

          case "6x6":
            //Comprobar Colision:
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Border
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "2x2":


            //Comprobar Colision:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "2x1":

            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 1;
              jRotacion= 2;
            }else{
              iRotacion= 2;
              jRotacion= 1;
            }

            //Comprobar colision
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar Pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "6x4":

            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 4;
              jRotacion= 6;
            }else{
              iRotacion= 6;
              jRotacion= 4;
            }

            //Comprobar colision:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

             //Render Border:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                 //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "4x2":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 2;
              jRotacion= 4;
            }else{
              iRotacion= 4;
              jRotacion= 2;
            }

            //Comprobar colision
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}
            //Dibujar pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "T":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;
            var iRotacion2= 0;
            var jRotacion2= 0;
            var iOffset=0;
            var jOffset=0;
            var iOffset2=0;
            var jOffset2=1;

            if(this.rotacion==0){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=1;
            }

            if(this.rotacion== 90){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=2;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=1;
              jOffset2=0;
            }

            if(this.rotacion== 180){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=2;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=1;
            }

            if(this.rotacion== 270){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=0;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=1;
              jOffset2=0;
            }

            //Comprobar Colision:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujado de pieza:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

          break;

          case "X":
            //Comprobar colision:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none"  && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar Pieza:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "L":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;
            var iRotacion2= 0;
            var jRotacion2= 0;
            var iOffset=0;
            var jOffset=0;
            var iOffset2=0;
            var jOffset2=0;

            if(this.rotacion==0){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=2;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=2;
              jOffset2=0;
            }

            if(this.rotacion== 90){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=0;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=2;
              jOffset2=0;
            }

            if(this.rotacion== 180){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=0;
            }

            if(this.rotacion== 270){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=2;
            }

            //Comprobar colision:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none"  && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          default:
            // code...
            break;
        }
        break; //Fin estado add

      case "eliminar":
      var indexPiezaEliminar= this.renderReticula.celdas[x][y].indexPieza;
        for (var i = 0; i < this.renderReticula.celdas.length; ++i) {
          for (var j = 0; j < this.renderReticula.celdas[0].length; ++j) {
            if(this.renderReticula.celdas[i][j].indexPieza===indexPiezaEliminar){
             this.renderReticula.celdas[i][j]= {
                X: i,
                Y: j,
                tipo: "none",
                oriantacion: 1,
                pieza: "none",
                indexPieza: 0,
                ancla: false,
                seleccionada: false,
                color: "inherit",
                border: ["none", "none", "none", "none"]
              }
            }
          }
        }
        break;
      default:
        // code...
        break;
    }
    return;
  }

  seleccionarHerramienta(herramienta){
    switch (herramienta) {
      case "seleccion":
        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="seleccionar";
        this.estadoMazmorra= "seleccionar";
        this.renderReticula.comando= "";
        break;

      case "add":
        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="add";
        this.estadoMazmorra= "add";
        this.renderReticula.comando= "";
        break;

      case "eliminar":
        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="eliminar";
        this.estadoMazmorra= "add";
        this.renderReticula.comando= "";
        break;

      case "rotar":
        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="add";
        this.estadoMazmorra= "add";
        this.renderReticula.comando= "";
        if(this.rotacion==270){
          this.rotacion=0;
        }else{
          this.rotacion+=90;
        }
        break;

      case "parametros":

        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="parametros";
        if(this.estadoMazmorra=="parametros"){
            this.estadoMazmorra= "";
        }else{
            this.estadoMazmorra= "parametros";
        }
        this.renderReticula.comando= "";
        break;

      case "cargarArchivoIsometrico":
        this.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="parametros";
        this.estadoMazmorra= "isometrico";
        this.renderReticula.comando= "";
        break;

      default:
        this.log("Herramienta no valida: "+herramienta,"red");
        this.renderReticula.estado=""
        this.renderReticula.comando= "";
        break;
    }
    return;
  }

  seleccionarPanelParametros(parametros){
    this.estadoParametros= parametros;
    switch(parametros){
      case "Salas":
        console.log(this.mazmorra.salas);
      break;

    }
    return;
  }

  seleccionarSala(salaID: number){
    this.salaSeleccionadaId = salaID;
    this.observarDesarrolladorService.next("reloadFormSala");
  }

  seleccionarEnemigoMazmorra(enemigoID: number){
    this.enemigoSeleccionadoId = enemigoID;
    var tipoId= 0;

    //Buscar ID Enemigo:
    for(var i = 0; i <this.mazmorra.salas.length; i++){
        for(var j = 0; j <this.mazmorra.salas[i].enemigos.length; j++){
            if(this.mazmorra.salas[i].enemigos[j].enemigo_id == enemigoID){
                tipoId = this.mazmorra.salas[i].enemigos[j].tipo_enemigo_id;
                this.enemigoSeleccionadoSalaIndex = i;
                this.enemigoSeleccionadoIndex = j;
                break;
            }
        }
        if(tipoId!=0){break;}
    }
    if(tipoId==0){console.log("ERROR: No se ha encontrado ningun enemigo con ID: "+enemigoID);return}

    this.tipoEnemigoSeleccionado = this.enemigos.enemigos_stats.find(i=> i.id== tipoId);
    this.observarDesarrolladorService.next("reloadFormEnemigo");
    return;
  }

  seleccionarTipoEnemigo(tipoEnemigoID: number){
    this.tipoEnemigoSeleccionado = this.enemigos.enemigos_stats.find(i=> i.id== tipoEnemigoID);

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].tipo_enemigo_id= tipoEnemigoID;

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].nombre= this.tipoEnemigoSeleccionado.nombre;

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].imagen_id= this.tipoEnemigoSeleccionado.imagen_id;

    this.observarDesarrolladorService.next("reloadFormEnemigo");
    return;
  }

  seleccionarEventoMazmorra(eventoID: number){
    this.eventoSeleccionadoId = eventoID;
    this.observarDesarrolladorService.next("reloadFormEventosMazmorra");
    return;
  }

  crearSala(){

    //Check ID de salas: (Se asigan un ID que este disponible)
    var cuentaID = 1;

    while(this.mazmorra.salas.find(i=> i.sala_id==cuentaID)){
      cuentaID++;
    }

    console.log("Creando sala con ID: "+cuentaID);
    var nombreSala= "Sala "+cuentaID;
    this.mazmorra.salas.push({
      sala_id: cuentaID,
      nombre: nombreSala,
      descripcion: "",
      evento_inicial_id: 0,
      evento_final_id: 0,
      mostrarIsometrico: true
    });

    this.seleccionarSala(cuentaID);
  }

  crearEnemigo(indexSala){

    //Check ID de salas: (Se asigan un ID que este disponible)
    var cuentaID = 1;
    var idOcupados = [];

    for(var i = 0;i <this.mazmorra.salas.length;i++){
        for(var j = 0;j <this.mazmorra.salas[i].enemigos.length;j++){
            idOcupados.push(parseInt(this.mazmorra.salas[i].enemigos[j].enemigo_id));
        }
    }

    while((idOcupados.indexOf(cuentaID))!=-1){
      cuentaID++;
    }

    console.log("Creando enemigo con ID: "+cuentaID);

    var nombreEnemigo= "Enemigo_ID_"+cuentaID;
    this.mazmorra.salas[indexSala].enemigos.push({
      enemigo_id: cuentaID,
      tipo_enemigo_id: 1,
      num_sala: 0,
      nombre: nombreEnemigo,
      imagen_id: 1,
      nivel: 0,
      loot_id: 0,
      loot_prob: 0,
      buffo_perma_id: 0,
      evento_muerte_id: 0,
      evento_spawn_id: 0,
      evento_intervalo_id: 0,
      evento_intervalo_tiempo: 0
    });

    this.seleccionarEnemigoMazmorra(cuentaID);
    this.seleccionarTipoEnemigo(1);
  }

  crearEvento(){

    //Check ID de salas: (Se asigan un ID que este disponible)
    var cuentaID = 1;

    while(this.mazmorra.eventos.find(i=> i.id_evento==cuentaID)){
      cuentaID++;
    }

    console.log("Creando Evento con ID: "+cuentaID);

    var nombreEvento= "Evento "+cuentaID;

    this.mazmorra.eventos.push({
            id_evento: cuentaID,
            id_mazmorra: 0,
            id_sala: 0,
            tipo: 0,
            codigo: 0,
            rng: 0,
            rng_fallo_evento_id: 0,
            buff: 0,
            insta_buff: 0,
            objetivo_buff: 0,
            loot_id: 0,
            loot_prob: 0,
            objetivo_loot: 0,
            dialogo_id: 0,
            objetivo_dialogo: 0,
            spawn_enemigo_id: 0,
            set_evento_watcher: 0,
            remove_evento_watcher: 0,
            evento_watcher_id: 0,
            expire_watcher_id: 0,
            intervalo_trigger_watcher: 0,
            variable_trigger_watcher: 0,
            add_variable: 0,
            elimina_variable: 0,
            if_condicion_variable: 0,
            if_falso_evento_id: 0,
            cinematica_id: 0,
            sonido_id: 0,
            evento_next_id: 0
    });

    this.seleccionarEvento(cuentaID);
  }


//*************************************************
//      PANEL DATOS:
//*************************************************

    seleccionarAccionDato(opcion:string):void{
        this.estadoDatos= opcion;
        return;
    }

  //Funcion activa cuando se hace click en un archivo del panel de archivos:
    seleccionarArchivoDato(archivo: string):void{
        this.archivoSeleccionado= archivo;

        switch (archivo) {

            case "Hechizos":
                this.archivoDato= this.appService.getHechizos()
          this.indexArchivoSeleccionado= 1;
                break;

            case "Enemigos":
                this.archivoDato= this.appService.getEnemigos()
          this.indexArchivoSeleccionado= 2;
                break;

            case "Buff":
                this.archivoDato= this.appService.getBuff()
          this.indexArchivoSeleccionado= 3;
                break;

            case "Objetos":
                this.archivoDato= this.appService.getObjetos()
          this.indexArchivoSeleccionado= 4;
                break;

            case "Animaciones":
                this.archivoDato= this.appService.getAnimaciones()
          this.indexArchivoSeleccionado= 5;
                break;

            case "Perfil":
                this.archivoDato= this.appService.getPerfil()
          this.indexArchivoSeleccionado= 7;
                break;

        }
        return;
  }

  cancelarArchivo(){
    this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).workbook= {};
    this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).objetoArchivo= {};
    this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).estado= "subir";
    this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).verificado= false;

    this.log("Cancelando Archivo: "+this.archivoSeleccionado,"bisque");
  }

  modificarDatos(change):void{
        this.archivoDatoProvisional = change;
        this.archivoSeleccionadoProvisional = this.archivoSeleccionado;
    }

  cambiarEstadisticas(path){

    /*
    $("#botonCambiarEstadisticas").removeClass("visible");
    $("#botonCambiarEstadisticas").addClass("oculto");

    $("#contenedorSubirExcel").removeClass("visible");
    $("#contenedorSubirExcel").addClass("oculto");

    $("#progresoActualizacionDatos").removeClass("oculto");
    $("#progresoActualizacionDatos").addClass("visible");
    $("#barraCargaDatos").attr("style","width:0%;");
    */
    console.log(path)
    var documentos = new Array(13);

    //*************************************************
    //    Construir documento Generico
    //*************************************************

    //Declaración de variables Generales:
    var documento= {};
    var columnas = [];
    var columnasAtrib= [];
    var result= {};
    var vectorPaginas= [];

    for (var docIndex =0; docIndex < documentos.length; docIndex++) {

      if(typeof path[docIndex] != "undefined"){

        documento= {};
        columnas = [];
        columnasAtrib= [];

        switch(docIndex){
          case 0: //HEROE STATS
            vectorPaginas= ['MINOTAURO','CRUZADO','CAZADOR','CHRONOMANTE','HECHICERO','INGENIERO','CLERIGO','SEGADOR_DE_ALMAS']
            documento={
              nombreId: "Heroes_Stats"
            };
          break;
          case 1: //HECHIZOS
            vectorPaginas= ['HECHIZOS']
            documento={
              nombreId: "Hechizos"
            };
          break;
          case 2: //ENEMIGOS
            vectorPaginas= ['ENEMIGOS_STATS','ENEMIGOS_HECH','ENEMIGOS_PASIVAS','ENEMIGOS_BUFFOS']
            documento={
              nombreId: "Enemigos"
            };
          break;
          case 3: //BUFF
            vectorPaginas= ['BUFF']
            documento={
              nombreId: "Buff"
            };
          break;
          case 4: //OBJETOS
            vectorPaginas= ['EQUIPO','CONSUMIBLE']
            documento={
              nombreId: "Objetos"
            };
          break;
          case 5: //MAZMORRA SNACK
            vectorPaginas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
            documento={
              nombreId: "MazmorraSnack"
            };
          break;
          case 6: //GUARDADO SNACK
            vectorPaginas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
            documento={
              nombreId: "GuardadoSnack"
            };
          break;
          case 7: //MAZMORRA DUMMY
            vectorPaginas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
            documento={
              nombreId: "MazmorraDummy"
            };
          break;
          case 8: //GUARDADO DUMMY
            vectorPaginas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
            documento={
              nombreId: "GuardadoDummy"
            };
          break;
          case 9: //ANIMACIONES
            vectorPaginas= ['ANIMACIONES','SONIDOS']
            documento={
              nombreId: "Animaciones"
            };
          break;
          case 10: //PARAMETROS
            vectorPaginas= ['PERSONAJES','ATRIBUTOS','ESCALADO']
            documento={
              nombreId: "Parametros"
            };
          break;
          case 11: //PERFIL
            vectorPaginas= ['CONFIGURACION','LOGROS','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
            documento={
              nombreId: "Perfil"
            };
          break;
          case 12: //PERSONAJES
            vectorPaginas= ['PERSONAJES']
            documento={
              nombreId: "Personajes"
            };
          break;
        }

        /*result = excelToJson({
          sourceFile: path[docIndex],
          header: {
            rows: 12
          },
          sheets: vectorPaginas
        });*/

        // Iteracion por pagina:
        for (var i = 0; i < vectorPaginas.length; i++) {

        documento[vectorPaginas[i].toLowerCase()] = [];
        columnas= result[vectorPaginas[i]][0];
        columnasAtrib = Object.keys(columnas);

        //Iteracion por fila:
        for (var j = 1; j < result[vectorPaginas[i]].length; j++) {

          documento[vectorPaginas[i].toLowerCase()].push({});

          //Iteracion por columna:
          for (var k = 0; k < columnasAtrib.length; k++) {
            documento[vectorPaginas[i].toLowerCase()][documento[vectorPaginas[i].toLowerCase()].length-1][columnas[columnasAtrib[k]].toLowerCase()] = result[vectorPaginas[i]][j][columnasAtrib[k]]
          }
        }
        }

        console.log("DOCUMENTO: ");
        console.log(documento);

        documentos[docIndex]= documento;
      }
    }
  }

  incluirArchivo(evt: any) {

      //Lectura de evento Input
      const target: DataTransfer = <DataTransfer>(evt.target);

      //Gestion de errores
      if(target.files.length !== 1) throw new Error('No se pueden seleccionar varios archivos');

      //Lectura de archivo
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {

        /* Leer workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        /* grab first sheet */
        const wsname: string = wb.SheetNames[1];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        this.archivoDato = (XLSX.utils.sheet_to_json(ws, {header: 1,range: 13}));

        this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).workbook= wb;
        this.archivosExcel.find(i => i.nombreArchivo== this.archivoSeleccionado).estado= "info";

        this.log("Cargando Archivo: "+this.archivoSeleccionado,"lightblue");

        console.log(this.archivosExcel);
        //this.path[0]= archivoInput.target.files[0].path;

      };
      reader.readAsBinaryString(target.files[0]);
  }

  incluirIsometrico(evt: any) {

      //Lectura de evento Input
      const target: DataTransfer = <DataTransfer>(evt.target);

      //Gestion de errores
      if(target.files.length !== 1) throw new Error('No se pueden seleccionar varios archivos');

      //Lectura de archivo
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(target.files[0]);
      reader.onload = (e: any) => {

        this.log("Cargando Archivo Isometrico...","lightblue");
        var obj = JSON.parse(e.target.result);

        delete obj.MapSave["-xmlns:xsd"]
        delete obj.MapSave["-xmlns:xsi"]

        for(var i= 0; i <obj.MapSave.Placeables.Placeable.length; i++){
            delete obj.MapSave.Placeables.Placeable[i].Credits
            obj.MapSave.Placeables.Placeable[i].oculto = false;
            obj.MapSave.Placeables.Placeable[i].sala = 0;
            obj.MapSave.Placeables.Placeable[i].evento = 0;
            obj.MapSave.Placeables.Placeable[i].seleccionado = false;
            if(obj.MapSave.Placeables.Placeable[i].Name=="Floor Grid"){
                obj.MapSave.Placeables.Placeable[i].tipo = "grid";
            }else{
                obj.MapSave.Placeables.Placeable[i].tipo = "decorado";
            }
        }

        this.mazmorra.isometrico = Object.assign({}, obj);
        console.log(this.mazmorra)
        console.log("Mapa Isometrico: ");
        console.log(obj);
      }
  }

  async reloadDatos(forzarEstadoVer:boolean){

    this.log("Obteniendo datos (Perfil: "+this.appService.getCuenta().then((result) => {return result.nombre})+" + Oficial)","orange");
    this.mostrarMensaje= true;
    this.mostrarSpinner= true;
    this.mensaje= "Actualizando Datos..."

    var token = await this.appService.getToken()
    console.log("Usando token: ",token)

    this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarDatosJuego",{token: token}).subscribe((data) => {

        console.log("Datos: ")
        console.log(data)
            if(data){
                this.appService.setDatosJuego(data);
              if(forzarEstadoVer){
                this.archivoSeleccionado="null";
                this.estadoDatos= "ver";
              }
              this.archivoDato={}
              this.mostrarMensaje= false;
              this.log("Adquisición de datos exitosa!","green");
            }

          },(err) => {
            this.log("Error de adquisición de datos","red");
    });

    //Peticion Eventos:
    this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarEventos",{token: token}).subscribe((data) => {

        console.log("Eventos: ")
        console.log(data)
            if(data){
                this.appService.setEventos(data[0]);
                this.log("Adquisición de datos exitosa!","green");
            }

          },(err) => {
                this.log("Error de adquisición de datos","red");
    });
  }

  seleccionarElementoIsometrico(indexElemento: number){
        this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado = !this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado;
    return;
  }

  asignarSala(idSala: number){
      //Verificar Sala;
      var salaValida= false;
      for(var i=0; i <this.mazmorra.salas.length; i++){
          if(this.mazmorra.salas[i].sala_id == idSala){
              salaValida = true;
          }
      }

      if(!salaValida && idSala!=0){
          this.mostrarPanelAsignarSala= true;
          this.mensaje= "Id Sala Invalido"
          this.mostrarMensaje= true;
          this.mostrarSpinner= false;
          this.mostrarBotonAceptar= true;
          console.log("Error: id_sala invalido"+idSala);
          return;
      }

      //Asignando ID SALA;
      for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
          if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
            this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala = idSala;
            this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
          }
      }

      this.mostrarPanelAsignarSala= false;
      this.mensaje = "Selección asignada"
      this.mostrarMensaje= true;
      this.mostrarSpinner= false;
      this.mostrarBotonAceptar= true;
      console.log("Sala Asignada: "+idSala);

    return;
  }

  eliminarSala(salaSeleccionadaId: number){

        //Elimina elemento sala del Array de salas:
        this.mazmorra["salas"].splice(this.mazmorra.salas.indexOf(this.mazmorra.salas.find(i=> i.sala_id==this.salaSeleccionadaId)),1);
        //Quita asignación de sala a elementos de sala eliminada:
        for(var i= 0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length;i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala==this.salaSeleccionadaId){
                this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala= 0;
            }
        }

        //Deselecciona la sala seleccionada:
        this.salaSeleccionadaId=0;

    return;
  }

  eliminarEnemigoMazmorra(){

        //Elimina elemento sala del Array de salas:
        this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex]["enemigos"].splice(this.enemigoSeleccionadoIndex,1);

        //Deselecciona la sala seleccionada:
        this.enemigoSeleccionadoId=0;

    return;
  }

  eliminarEventoMazmorra(){

        //Elimina el evento:
        this.mazmorra["eventos"].splice(this.mazmorra.eventos.indexOf(this.mazmorra.eventos.find(i=> i.id_evento==this.eventoSeleccionadoId)),1);

        //Deselecciona la sala seleccionada:
        this.eventoSeleccionadoId=0;

    return;
  }

  setEstadoDatos(estadoDatos:TipoDatos){

    this.estadoHerramientaDatos = estadoDatos;

    switch(estadoDatos){
        case "Enemigos":
            this.seleccionarEnemigo(this.enemigoSeleccionadoIndex)
            break;
    }
    if(estadoDatos=="Animaciones"){
        this.setEstadoPanelDerecho('Sonidos');
    }else{
        this.setEstadoPanelDerecho("")
    }
    return;
  }

  findAvailableID(objeto:any):number{
    if(objeto[0].id == undefined){console.error("Error Asignando nuevo ID");return 0}
    var index = 0;
    var encontrado = false;
    do{
      index++;
      encontrado= false;
      for(var i = 0; i < objeto.length; i++){
        if(objeto[i].id==index){encontrado=true;break;}
      }
    }while(encontrado);
    return index;
  }

  addDato(){
      switch(this.estadoHerramientaDatos){
            case "Hechizos":

                this.hechizos.hechizos.push(Object.assign({},datosDefecto.hechizos));
                this.hechizos.hechizos.at(-1)["id"]= this.findAvailableID(this.hechizos.hechizos);
                this.hechizos.hechizos.at(-1)["nombre"]= "Hechizo "+this.hechizos.hechizos.length;
                console.log(this.hechizos.hechizos)
            break;

            case "Buff":
                this.buff.buff.push(Object.assign({},datosDefecto.buff));
                this.buff.buff.at(-1)["id"]= this.findAvailableID(this.buff.buff);
                this.buff.buff.at(-1)["nombre"]= "Buff "+this.buff.buff.length;
            break;

            case "Animaciones":
              console.error("AÑADIENDO")
                this.animaciones.animaciones.push(Object.assign({},datosDefecto.animaciones));
                this.animaciones.animaciones.at(-1)["id"]= this.findAvailableID(this.animaciones.animaciones);
                this.animaciones.animaciones.at(-1)["nombre"]= "Animacion "+this.animaciones.animaciones.length;
            break;

            case "Enemigos":
                this.enemigos.enemigos.push(Object.assign({},datosDefecto.enemigos));
                this.enemigos.enemigos.at(-1)["id"]= this.findAvailableID(this.enemigos.enemigos);
                this.enemigos.enemigos.at(-1)["nombre"]= "Enemigos "+this.enemigos.enemigos.length;
            break;

            case "Eventos":
                this.eventos.eventos.push(Object.assign({},datosDefecto.eventos));
                console.error(this.findAvailableID(this.eventos.eventos));
                this.eventos.eventos.at(-1)["id"]= this.findAvailableID(this.eventos.eventos);
                this.eventos.eventos.at(-1)["nombre"]= "Evento "+this.eventos.eventos.length;
            break;

            case "Misiones":
                this.misiones.misiones.push(Object.assign({},datosDefecto.misiones));
                this.misiones.misiones.at(-1)["id"]= this.findAvailableID(this.misiones.misiones);
                this.misiones.misiones.at(-1)["nombre"]= "Mision "+this.misiones.misiones.length;
            break;

            case "Objetos":
                switch(this.tipoObjetoSeleccionado){
                    case "Equipo":
                        this.objetos.equipo.push(Object.assign({},datosDefecto.equipo));
                        this.objetos.equipo.at(-1)["id"]= this.findAvailableID(this.objetos.equipo);
                        this.objetos.equipo.at(-1)["nombre"]= "Equipo "+this.objetos.equipo.length;
                        break;
                    case "Consumible":
                        this.objetos.consumible.push(Object.assign({},datosDefecto.consumible));
                        this.objetos.consumible.at(-1)["id"]= this.findAvailableID(this.objetos.consumible);
                        this.objetos.consumible.at(-1)["nombre"]= "Consumible "+this.objetos.consumible.length;
                        break;
                }
            break;
        }//Fin switch
  }

  seleccionarHechizo(indexHechizo:number){
      this.hechizoSeleccionadoIndex= indexHechizo;

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormHechizos");
  }

  eliminarHechizo(){

      console.log("Eliminando Hechizo:"+this.hechizoSeleccionadoIndex)
      this.hechizos.hechizos.splice(this.hechizoSeleccionadoIndex,1)

      //Cambia el indice de seleccion:
      if(this.hechizoSeleccionadoIndex>0){
        this.hechizoSeleccionadoIndex= this.hechizoSeleccionadoIndex-1;
      }else{
          this.hechizoSeleccionadoIndex = 0;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormHechizos");
  }

  addAnimacionHechizo(indexAnimacion:number){
      var animacionId = this.animaciones.animaciones[indexAnimacion].id;
      this.hechizos.hechizos[this.hechizoSeleccionadoIndex].animacion_id = animacionId;
  }

  addAnimacionBuff(indexAnimacion:number){
      var animacionId = this.animaciones.animaciones[indexAnimacion].id;
      this.buff.buff[this.buffSeleccionadoIndex].animacion_id = animacionId;
  }

  addSonido(){
      var sonido = this.animaciones.sonidos[0];
      if(this.animaciones.animaciones[this.animacionSeleccionadoIndex].sonidos.length <= 0){
        this.sonidoSeleccionadoIndex=-1;
      }
      this.animaciones.animaciones[this.animacionSeleccionadoIndex].sonidos.push(sonido);
      this.sonidoSeleccionadoIndex++;
  }

  asignarSonidoAnimacion(indexSonido:number){
      var sonido = this.animaciones.sonidos[indexSonido];
      this.animaciones.animaciones[this.animacionSeleccionadoIndex].sonidos[this.sonidoSeleccionadoIndex]=sonido;
  		this.efectoSonido.src = "./assets/sounds/"+sonido.id+"."+sonido.extension;
  		this.efectoSonido.load();
  		this.efectoSonido.play();
  		this.efectoSonido.volume= 1;
  }

  eliminarSonidoAnimacion(){
      if(this.animaciones.animaciones[this.animacionSeleccionadoIndex].sonidos.length <= 0){return}
      this.animaciones.animaciones[this.animacionSeleccionadoIndex].sonidos.splice(this.sonidoSeleccionadoIndex,1);
      if(this.sonidoSeleccionadoIndex!=0){this.sonidoSeleccionadoIndex--;}
  }

  seleccionarBuff(indexBuff:number){

      this.buffSeleccionadoIndex= indexBuff;

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormBuff");
  }

  eliminarBuff(){

      console.log("Eliminando Buff:")
      this.buff.buff.splice(this.buffSeleccionadoIndex,1)

      //Cambia el indice de seleccion:
      if(this.buffSeleccionadoIndex>0){
        this.buffSeleccionadoIndex= this.buffSeleccionadoIndex-1;
      }else{
          this.buffSeleccionadoIndex = 0;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormBuff");
  }

  seleccionarEnemigo(indexEnemigo:number){
      this.enemigoSeleccionadoIndex= indexEnemigo;
      var familia = this.enemigos.enemigos[this.enemigoSeleccionadoIndex].familia;
      this.pathImagenes = directorioAssets.find(i => i.categoria.toLowerCase()==familia.toLowerCase()).path;

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormEnemigo");
  }

  eliminarEnemigo(){

      console.log("Eliminando Enemigo:")
      this.enemigos.enemigos.splice(this.enemigoSeleccionadoIndex,1)

      //Cambia el indice de seleccion:
      if(this.enemigoSeleccionadoIndex>0){
        this.enemigoSeleccionadoIndex= this.enemigoSeleccionadoIndex-1;
      }else{
          this.enemigoSeleccionadoIndex = 0;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormEnemigo");
  }

  seleccionarAnimacion(indexAnimacion:number){

    console.warn("ANIMACION:",this.animaciones.animaciones[indexAnimacion])
      this.animacionSeleccionadoIndex= indexAnimacion;

      this.subanimaciones = this.animaciones.animaciones[indexAnimacion].subanimaciones;
      this.sonidos = this.animaciones.animaciones[indexAnimacion].sonidos;

      this.subanimacionSeleccionadoIndex= 0;

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormSubAnimacion");
        this.observarDesarrolladorService.next("reloadFormAnimaciones");
  }

  seleccionarObjeto(indexObjeto:number){

      if(this.tipoObjetoSeleccionado == "Equipo"){
          this.indexEquipoSeleccionado = indexObjeto;
      }

      if(this.tipoObjetoSeleccionado == "Consumible"){
          this.indexConsumibleSeleccionado = indexObjeto;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormObjetos");
  }

  eliminarAnimacion(){

      console.log("Eliminando Animacion:"+this.animacionSeleccionadoIndex)
      this.animaciones.animaciones.splice(this.animacionSeleccionadoIndex,1)

      //Cambia el indice de seleccion:
      if(this.animacionSeleccionadoIndex>0){
        this.animacionSeleccionadoIndex= this.animacionSeleccionadoIndex-1;
      }else{
          this.animacionSeleccionadoIndex = 0;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormAnimaciones");
  }

  seleccionarSubanimacion(indexSubAnimacion:number){
      this.subanimacionSeleccionadoIndex= indexSubAnimacion;

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormSubAnimacion");
  }
  seleccionarSonido(indexSonido:number){
      this.sonidoSeleccionadoIndex= indexSonido;
  }

  addSubanimacion(){

      var indexSubanimacion = this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.length

      this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.push({
          id: this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.length,
          nombre: "Subanimacion "+(indexSubanimacion+1),
          sprite_id: 0,
          duracion: 1,
          num_frames: 1,
          frame_ref: 1,
          hue_filter: 0,
          sepia: 0,
          brillo: 0,
          delay: 0,
          offset_x: 0,
          offset_y: 0,
          saturation: 0
      })

      this.subanimacionSeleccionadoIndex= indexSubanimacion;
      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormSubAnimacion");
  }

  eliminarSubanimacion(){

      var indexSubanimacion = this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.length

      //Evita la eliminación si es el ultimo elemento:
      if(this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.length <=1){
        return;
      }

      this.animaciones.animaciones[this.animacionSeleccionadoIndex].subanimaciones.splice(this.subanimacionSeleccionadoIndex,1)

      //Cambia el indice de seleccion:

      if(this.subanimacionSeleccionadoIndex>0){
        this.subanimacionSeleccionadoIndex= this.subanimacionSeleccionadoIndex-1;
      }else{
          this.subanimacionSeleccionadoIndex = 0;
      }

      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormSubAnimacion");
  }

  seleccionarMision(indexMision:number){
      this.misionSeleccionadaIndex= indexMision;
      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormEnemigo");
  }

  eliminarMision(){
      console.log("Eliminando Mision:")
      this.misiones.misiones.splice(this.misionSeleccionadaIndex,1)

      //Cambia el indice de seleccion:
      if(this.misionSeleccionadaIndex>0){
        this.misionSeleccionadaIndex= this.misionSeleccionadaIndex-1;
      }else{
          this.misionSeleccionadaIndex = 0;
      }
      //Actualizar Formulario:
        this.observarDesarrolladorService.next("reloadFormMisiones");
  }

  seleccionarObjetivoMision(objetivoMisionIndex:number){
      console.log("Seleccionando Objetivo Mision: " + this.misiones.misiones[this.misionSeleccionadaIndex].objetivos[objetivoMisionIndex].texto);
      this.objetivoMisionSeleccionadoIndex = objetivoMisionIndex;
      this.observarDesarrolladorService.next("reloadFormMisiones");
      return;
  }

  abrirSelectorImagen(categoria:string){
    console.log(categoria)
    this.estadoSelectorImagen = categoria.toLowerCase();
    var numeroImagenes = directorioAssets.find(i => i.categoria.toLowerCase()==categoria.toLowerCase()).numeroImagenes;
    this.pathImagenes = directorioAssets.find(i => i.categoria.toLowerCase()==categoria.toLowerCase()).path;

    //Inicializar Imagenes:
    this.imagenes= [];
    for(var i=1; i <numeroImagenes; i++){
        this.imagenes.push(i);
    }

    this.mostrarSelectorImagen = true;
    return;
  }

  seleccionarImagen(indexImagen:number){

      console.log(this.estadoSelectorImagen)
      console.log(this.tipoObjetoSeleccionado)

      switch(this.estadoSelectorImagen){
          case "arco":
          case "báculo":
          case "botas":
          case "casco":
          case "daga":
          case "escudo":
          case "espada":
          case "hacha":
          case "lanza":
          case "pantalón":
          case "pechera":
          case "miscelaneo":
              if(this.tipoObjetoSeleccionado=="Equipo"){
                    this.objetos.equipo[this.indexEquipoSeleccionado].imagen_id = indexImagen;
                }
              if(this.tipoObjetoSeleccionado=="Consumible"){
                    this.objetos.consumible[this.indexConsumibleSeleccionado].imagen_id = indexImagen;
                }
              break;
          case "hechizo":
              this.hechizos.hechizos[this.hechizoSeleccionadoIndex].imagen_id = indexImagen;
              break;
          case "buff":
              this.buff.buff[this.buffSeleccionadoIndex].imagen_id = indexImagen;
              break;
            case "tile":
                this.seleccionarImgTile(indexImagen)
      }
      this.mostrarSelectorImagen=false;
  }//Fin SeleccionarImagen

  seleccionarImgTile(tileIndex: number){
        this.opcionesDesarrolloInMap.tileImgSeleccionado = tileIndex;
        this.tileImgSeleccionado = this.opcionesDesarrolloInMap.tileImgSeleccionado;
  }

  setEstadoBuffRelacionado(estado,indexSeleccionado?){
    this.estadoPanelBuffRelacionado = estado;
    this.indexBuffRelacionadoIndex = indexSeleccionado;
    this.setEstadoPanelDerecho("Buff");
  }

  setEstadoPanelDerecho(estado:string){
      this.estadoPanelDatosDerecha = estado;
  }

  addBuff(indexBuff:number){
      if(this.estadoPanelBuffRelacionado == "Add"){
        this.hechizos.hechizos[this.hechizoSeleccionadoIndex].buff_id.push(this.buff.buff[indexBuff].id);
      }
      if(this.estadoPanelBuffRelacionado == "Modificar"){
        this.hechizos.hechizos[this.hechizoSeleccionadoIndex].buff_id[this.indexBuffRelacionadoIndex]= this.buff.buff[indexBuff].id;
      }
  }

  renderImagenBuff(indexHechizo:number,indexBuffRelacionado: number){
    return this.buff.buff.find(i=> i.id == this.hechizos.hechizos[indexHechizo].buff_id[indexBuffRelacionado]).imagen_id;
  }

  renderImagenEncadenado(indexHechizo:number){
    return this.hechizos.hechizos.find(i=> i.id == this.hechizos.hechizos[indexHechizo].hech_encadenado_id).imagen_id;
  }

  eliminarEncadenado(){
    this.hechizos.hechizos[this.hechizoSeleccionadoIndex].hech_encadenado_id=0;
  }

  eliminarBuffHechizo(){
      if(this.estadoPanelBuffRelacionado == "Modificar"){
        this.hechizos.hechizos[this.hechizoSeleccionadoIndex].buff_id.splice(this.indexBuffRelacionadoIndex,1);
        this.estadoPanelBuffRelacionado = "";
        this.setEstadoPanelDerecho("");
      }
  }

  addEncadenado(indexEncadenado:number){
      this.hechizos.hechizos[this.hechizoSeleccionadoIndex].hech_encadenado_id = this.hechizos.hechizos[indexEncadenado].id;
  }

  async guardarPanelDatos(){

      console.log("GUARDANDO: "+this.estadoHerramientaDatos)

      switch(this.estadoHerramientaDatos){

          case "Objetos":
            console.log(this.objetos)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarObjetos",{objetos: this.objetos, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto 'Objetos' guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos guardados con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Hechizos":
            console.log(this.hechizos)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarHechizos",{hechizos: this.hechizos, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto Hechizos guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos guardados con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Buff":
            console.log(this.buff)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarBuff",{buff: this.buff, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto Buff guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos Buff con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Animaciones":
            console.log(this.animaciones)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarAnimaciones",{animaciones: this.animaciones, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto animaciones guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos animaciones con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Enemigos":
            console.log(this.enemigos)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarEnemigos",{enemigos: this.enemigos, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto Enemigos guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos guardados con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Clases":
            console.log(this.clases)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarClases",{clases: this.clases, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto Clases guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos guardados con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;

          case "Eventos":
            console.log(this.eventos)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarEventos",{eventos: this.eventos, token: await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto eventos guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos eventos guardados con exito";
                this.reloadDatos(true);
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;
      }

    return;
  }

  // *************************************************
  //    INMAP:
  // *************************************************

  async guardarInMap(){

      console.log("GUARDANDO MAPA: ")
      this.region = this.appService.getRegion();
      console.log(this.region);

      switch(this.region.nombreId){
          case "Asfaloth":
            console.log(this.region)
            this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarRegion",{region: this.region, token:await this.appService.getToken()}).subscribe((res) => {
              if(res){
                console.log("Objeto Region guardado con exito");
                this.mostrarBotonAceptar= true;
                this.mostrarSpinner= false;
                this.mensaje= "Datos guardados con exito";
                this.mostrarMensaje= true;
              }else{
                console.log("Fallo en el guardado");
              }
            },(err) => {
              console.log(err);
            });
          break;
      } //End Switch

    return;
  }

  seleccionarHerramientaInMap(herramienta:string){

      console.log("Cambiando Herramienta: "+herramienta);
      switch(herramienta){

        case "add":
        case "eliminar":
            this.opcionesDesarrolloInMap.herramientaInMap = herramienta;
        break;

        case "overlay":
            this.opcionesDesarrolloInMap.opcionOverlay = true;
        break;

        case "base":
            this.opcionesDesarrolloInMap.opcionOverlay = false;
        break;

        case "general":
            this.opcionPropiedades = "general";
        break;

        case "terreno":
            this.opcionPropiedades = "terreno";
        break;

        case "trigger":
            this.opcionPropiedades = "trigger";
        break;

        case "misiones":
            this.opcionPropiedades = "misiones";
        break;
      }
  }

  //Setter de formularios:
  setInMapGeneral(val){
      //console.log(val)
    //this.region.isometrico[this.coordenadaX][this.coordenadaY]["nombre"] = val["inMapNombre"]
    //this.region.isometrico[this.coordenadaX][this.coordenadaY]["descripcion"] = val["inMapDescripcion"]
    //this.region.isometrico[this.coordenadaX][this.coordenadaY]["indicadorEvento"] = val["inMapIndicador"]
  }

  setInMapTerreno(val){
  }

  setInMapEventos(val){
  }

  setInMapMisiones(val){
  }

  // *************************************************
  //    EVENTOS:
  // *************************************************


  seleccionarOrden(ordenIndex:number){
      console.log("Seleccionando Orden: " + this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex].nombre);
      this.ordenSeleccionadaIndex = ordenIndex;
      this.tipoOrdenSeleccionada = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex].tipo;
    this.observarDesarrolladorService.next("reloadFormEventos");
      return;
  }

  seleccionarTipoOrden(tipoOrden:string){
      console.log("Seleccionando Tipo Orden: " + tipoOrden);
      this.tipoOrdenSeleccionada = tipoOrden;
      return;
  }

  seleccionarEvento(eventoIndex: number){
      this.eventoSeleccionadoIndex = eventoIndex;
      console.log("Seleccionando Eventos: " + this.eventos.eventos[this.eventoSeleccionadoIndex].nombre);
      console.warn("Evento: ",this.eventos.eventos[this.eventoSeleccionadoIndex]);
        this.observarDesarrolladorService.next("reloadFormEventos");
      return;
  }

  addEvento(){
      this.eventos.eventos[this.eventoSeleccionadoIndex].push({
          id: this.eventos.eventos.length,
          nombre: "Nuevo Evento",
          descripcio: "Descripcion de evento",
          categoria: "null",
          ordenes: []
      });
    return;
  }

  eliminarEvento(){
    //Elimina el evento seleccionado:
      this.eventos.eventos.splice(this.eventoSeleccionadoIndex,1);
      if(this.eventoSeleccionadoIndex>0){
          this.eventoSeleccionadoIndex -= 1;
      }
      this.tipoOrdenSeleccionada = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[0].tipo;
      this.ordenSeleccionadaIndex = 0;
      this.observarDesarrolladorService.next("reloadFormEventos");
  }

  addOrden(tipoOrden: string){
      //Inicialización de campos de Ordenes:
      switch(tipoOrden){
          case "condicion":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  variable: null,
                  valorVariable: null,
                  operador: null,
                  tipoEncadenadoTrue: null,
                  encadenadoTrue: null,
                  tipoEncadenadoFalse: null,
                  encadenadoFalse: null
              });
          break;
          case "variable":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  variableTarget: null,
                  valorNuevo: null,
                  valorOperador: null
              });
          break;
          case "mision":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  mision_id: null,
                  tarea_id: null
              });
          break;
          case "trigger":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  trigger_id: null,
                  trigger: null
              });
          break;
          case "dialogo":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  tipoDialogo: null,
                  contenido: null,
                  opciones: null,
                  encadenadoId: null,
                  tipoEncadenado: null
              });
          break;
          case "multimedia":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  tipoMultimedia: null,
                  nombreAsset: null
              });
          break;
          case "loot":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  objetivo: null,
                  oro: 0,
                  exp: 0,
                  objetos: null,
              });
          break;
          case "enemigo":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  idEnemigo: null,
                  tipoEnemigo: null
              });
          break;
          case "mazmorra":
              this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                  id: this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length+1,
                  nombre: "Nueva "+tipoOrden,
                  tipo: tipoOrden,
                  comando: null,
                  mazmorraId: null,
                  salaOpenId: null
              });
          break;
      }

      this.tipoOrdenSeleccionada = tipoOrden;
      this.ordenSeleccionadaIndex = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length-1;
      this.observarDesarrolladorService.next("reloadFormEventos");

    return;
  }

  eliminarOrden(){
    //Elimina la orden Seleccionada:
      this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.splice(this.ordenSeleccionadaIndex,1);
      if(this.ordenSeleccionadaIndex>0){
          this.ordenSeleccionadaIndex -= 1;
      }
      this.tipoOrdenSeleccionada = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex].tipo;
      this.observarDesarrolladorService.next("reloadFormEventos");
  }


  seleccionarClase(clase){
        switch(clase){
            case "Guerrero":
                this.claseSeleccionada=clase;
                this.indexClaseSeleccionada=0;
                this.observarDesarrolladorService.next("reloadFormClases");
                break;
            case "Hechicero":
                this.claseSeleccionada=clase;
                this.indexClaseSeleccionada=1;
                this.observarDesarrolladorService.next("reloadFormClases");
                break;
            case "Cazador":
                this.claseSeleccionada=clase;
                this.indexClaseSeleccionada=2;
                this.observarDesarrolladorService.next("reloadFormClases");
                break;
            case "Sacerdote":
                this.claseSeleccionada=clase;
                this.indexClaseSeleccionada=3;
                this.observarDesarrolladorService.next("reloadFormClases");
                break;
            case "Ladrón":
                this.claseSeleccionada=clase;
                this.indexClaseSeleccionada=4;
                this.observarDesarrolladorService.next("reloadFormClases");
                break;
        }
        return;
}

  seleccionarTipoObjeto(tipoObjeto){
      this.tipoObjetoSeleccionado = tipoObjeto;
}

    formatearNombre(nombre: string): string{
        var nombreNuevo = nombre
        return nombreNuevo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }


    patchObject(patchableObj: Object, obj: Object) {
      try {
        for (const [key, value] of Object.entries(obj)) {

          if (value != null && value != undefined) {
            (patchableObj as any)[key] = value
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    abrirTrigger(tipo:string, triggers: any){

      const dialogRef = this.dialog.open(TriggerComponent,{
          width: "100px", panelClass: ["trigger", "generalContainer"],backdropClass: "fondoDialogo", disableClose:false, data: triggers
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('Fin del dialogo trigger');
          if(!result){ return }

          console.log("Guardando Trigger: ")
          console.log(result)

          switch(tipo){
              case "inmap-evento":
                  this.appService.region.isometrico[this.coordenadaX,this.coordenadaY].triggersInMapEventos = result;

                  break
              case "inmap-mision":
                  this.appService.region.isometrico[this.coordenadaX,this.coordenadaY].triggersInMapMisiones = result;
                  break
          }

        });
        return;
    }

    testEvento(){
        this.appService.mostrarDialogo("Dialogo",{titulo: "",contenido: "", opciones: "", personajeDerecha: 1, personajeIzquierda: 1})
    }

} //FIN EXPORT










