
import { Injectable, OnInit} from '@angular/core';
import { AppService } from '../../app.service';
import { HttpClient } from "@angular/common/http";
import { RenderReticula } from './renderReticula.class';
import { Subject } from "rxjs";
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})

export class DesarrolladorService implements OnInit{

  //Variables de control:
	public validacion: any= {}

  //Variables de Estado Paneles Principales:
	public panel= "mazmorra";
	public estadoInmap= "";
	public estadoMazmorra= "parametros";
	public estadoParametros= "General";
	public estadoDatos= "subir";
	public estadoAssets= "";
	public estadoDatosSubir= "subir";
	
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

  //Logger Consola
	public logger=[];
	private loggerColor=[];

  //Variables Mazmorra
	public mazmorra:any = {};
	public listaMazmorra:any= [];
	public mostrarCargarMazmorra= false;
	
	private mazmorraInicializada= false;
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

  //Variables Isometrico
	public mostrarIsometrico = false;
	public isometrico: any = null; 
	public mostrarGrid= true
	public mostrarDecorado = true;
	public mostrarSalaNula = true;

	public mostrarPanelAsignarSala = false;
	public mostrarPanelAsignarEvento = false;

   //Variables de parametros:
	public salaSeleccionadaId = 0;
	public enemigoSeleccionadoId = 0;
	public eventoSeleccionadoId = 0;

	public tipoEnemigos: any;
	public tipoEnemigoSeleccionado:any;
	private rotacion=0;

  // Observable string sources
	private observarDesarrolladorService = new Subject<string>();

  // Observable string streams
  observarDesarrolladorService$ = this.observarDesarrolladorService.asObservable();


  constructor(public appService: AppService, private http: HttpClient)  { 
  }

  ngOnInit(){

  }

  inicializarGestor(){
    console.log("INICIANDO HERRAMIENTA DESARROLLADOR");
    this.validacion= this.appService.getValidacion();
    this.tipoEnemigos= this.appService.getEnemigos();
    console.log(this.tipoEnemigos);
  }

  inicializarArchivos(){
    console.log("Iniciando")
    //Inicializar Estructura de Datos:
    this.archivosExcel= [];
    var nombresArchivos= ["Heroes_Stats","Heroes_Hech","Enemigos","Buff","Objetos","Animaciones","Parametros","Perfil","Personajes"];

    for(var i = 0; i<nombresArchivos.length; i++){
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


  //*************************************************
  //    CONSOLA:
  //************************************************* 

  log(mensaje:any,color?:any):void{
     this.logger.push(mensaje);
     if(color=="undefined"){
       this.loggerColor.push("white");
     }else{
       this.loggerColor.push(color);
     }
   }

//*************************************************
//    PANEL MAZMORRA:
//************************************************* 
  
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

  cargarMazmorra(){
    this.http.post(this.appService.ipRemota+"/deliriumAPI/listaMazmorra",{token: this.appService.getToken()}).subscribe((res) => {
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
	for(var i=0; i<this.mazmorra.salas.length; i++){
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

  guardarMazmorra(){  

	//Procesar Guardado de celdas: 
	this.mazmorra.celdas = this.procesarGuardadoCeldas();
	
    console.log(this.mazmorra);
	
    this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarMazmorra",{mazmorra: this.mazmorra, token: this.appService.getToken()}).subscribe((res) => {
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
		for(var i=0; i<objetoReticula.length; i++){ 
			flagBorrado= true;
			for(var j=0; j<objetoReticula[i].length; j++){ if(objetoReticula[i][j].pieza!= "none"){
					flagBorrado= false;
				}
			}

			if(flagBorrado){
				objetoReticula.splice(i,1);
				i--;
			}
		}

		//Procesar Eje Y: 
		for(var i=0; i<objetoReticula[0].length; i++){ 
			flagBorrado= true;
			for(var j=0; j<objetoReticula.length; j++){
			   if(objetoReticula[j][i].pieza!= "none"){
					flagBorrado= false;
				}
			}

			if(flagBorrado){
				for(var j=0; j<objetoReticula.length; j++){
					objetoReticula[j].splice(i,1);
				}
				i--;
			}
		}

		return objetoReticula 
  }

  eliminarMazmorra(){
    this.http.post(this.appService.ipRemota+"/deliriumAPI/eliminarMazmorra",{mazmorra: this.mazmorra, token: this.appService.getToken()}).subscribe((res) => {
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
    for(var i= 0; i<numFilas; i++){

      //Creación de la fila:
      vectorFila= []
      for(var j= 0; j<numColumnas; j++){
        objetoSector.X= i-this.margenReticula;
        objetoSector.Y= j-this.margenReticula;

        vectorFila.push(Object.assign({},objetoSector));
      }

      this.renderReticula.celdas.push(Object.assign([],vectorFila));
    }

    //Paso por valor:
    for(var i= 0; i<numFilas; i++){
      for(var j= 0; j<numColumnas; j++){
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
          for(var j= 0; j<numColumnas; j++){
            objetoSector.X= numFilas-this.margenReticula;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.push(Object.assign([],vectorFila));
        break;

      case "top":
          for(var j= 0; j<numColumnas; j++){
            objetoSector.X= this.numFilasIni-numFilas-this.margenReticula-1;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.unshift(Object.assign([],vectorFila));
        break;
    }

    //Paso por valor:
    for(var i= 0; i<numFilas; i++){
      for(var j= 0; j<numColumnas; j++){
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
    for(var i= 0; i<numFilas; i++){
      for(var j= 0; j<numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    return;
  }

  getReticula(){return this.renderReticula;}

  moverReticula(movimiento){
    console.log("Cambiando Reticula")
    switch (movimiento) {
      case "right":
        if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1]<this.margenReticula+2){
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

        if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1]<this.margenReticula+2){
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
    if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1]<this.margenReticula){
      this.addColumnaReticula("right")
    }
    if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1]<this.margenReticula){
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

  seleccionarEnemigo(enemigoID: number){
    this.enemigoSeleccionadoId = enemigoID;
    this.tipoEnemigoSeleccionado = this.tipoEnemigos.enemigos_stats.find(i=> i.id== this.mazmorra.enemigos.find(j=> j.enemigo_id== enemigoID).tipo_enemigo_id);
    this.observarDesarrolladorService.next("reloadFormEnemigo");
    return;
  }

  seleccionarTipoEnemigo(tipoEnemigoID: number){
    this.tipoEnemigoSeleccionado = this.tipoEnemigos.enemigos_stats.find(i=> i.id== tipoEnemigoID);
    this.mazmorra.enemigos[this.mazmorra.enemigos.indexOf(this.mazmorra.enemigos.find(i=> i.enemigo_id==this.enemigoSeleccionadoId))].tipo_enemigo_id= tipoEnemigoID;
    this.mazmorra.enemigos[this.mazmorra.enemigos.indexOf(this.mazmorra.enemigos.find(i=> i.enemigo_id==this.enemigoSeleccionadoId))].nombre= this.tipoEnemigoSeleccionado.nombre;
    this.observarDesarrolladorService.next("reloadFormEnemigo");
    return;
  }

  seleccionarEvento(eventoID: number){
    this.eventoSeleccionadoId = eventoID;
    this.observarDesarrolladorService.next("reloadFormEventos");
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

  crearEnemigo(){

    //Check ID de salas: (Se asigan un ID que este disponible)
    var cuentaID = 1;

    while(this.mazmorra.enemigos.find(i=> i.enemigo_id==cuentaID)){
      cuentaID++;
    }
    console.log("Creando enemigo con ID: "+cuentaID);
    var nombreEnemigo= "Enemigo_ID_"+cuentaID;
    this.mazmorra.enemigos.push({
      enemigo_id: cuentaID,
      tipo_enemigo_id: 1,
      num_sala: 0,
      nombre: nombreEnemigo,
      imagen_id: 0,
      nivel: 0,
      loot_id: 0,
      loot_prob: 0,
      buffo_perma_id: 0,
      evento_muerte_id: 0,
      evento_spawn_id: 0,
      evento_intervalo_id: 0,
      evento_intervalo_tiempo: 0
    });
    this.seleccionarEnemigo(cuentaID);
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
//		PANEL DATOS:
//************************************************* 

	seleccionarAccionDato(opcion:string):void{
  		this.estadoDatos= opcion;
  		return;
	}

  //Funcion activa cuando se hace click en un archivo del panel de archivos:
	seleccionarArchivoDato(archivo: string):void{
  		this.archivoSeleccionado= archivo;

  		switch (archivo) {
  			case "Heroes_Stats":
  				this.archivoDato= this.appService.getHeroesStats()
          this.indexArchivoSeleccionado= 0;
  				break;
	
  			case "Heroes_Hech":
  				this.archivoDato= this.appService.getHeroesHech()
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
	
  			case "Parametros":
  				this.archivoDato= this.appService.getParametros()
          this.indexArchivoSeleccionado= 6;
  				break;
	
  			case "Perfil":
  				this.archivoDato= this.appService.getPerfil()
          this.indexArchivoSeleccionado= 7;
  				break;

        case "Personajes":
          this.archivoDato= this.appService.getPersonajes()
          this.indexArchivoSeleccionado= 8;
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
          case 1: //HEROES HECH
            vectorPaginas= ['ANGEL_CAIDO','CABALLERO','CAZADOR','CHRONOMANTE','CLERIGO','CRUZADO','ENANO','GLADIADOR','HECHICERO','INGENIERO','LICH','MINOTAURO','SEGADOR_DE_ALMAS']
            documento={
              nombreId: "Heroes_Hech"
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
            vectorPaginas= ['ANIMACIONES']
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

		for(var i= 0; i<obj.MapSave.Placeables.Placeable.length; i++){
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

  verificarDatos(){

    this.log("***** INICIANDO VERIFICACION ("+this.archivoSeleccionado+") ****** ","aqua");

    var archivoVerificacion= this.archivosExcel[this.indexArchivoSeleccionado].workbook;
    var nombresHojas= [];
    var hojasArchivo= [];
    var cabecerasHojas= [];
    var worksheet: XLSX.WorkSheet;
    var objetoArchivo = {};
    var errorVerificacion= false;

    //Deteccion Hojas:
    this.log("-----------------------------", "orange")
    this.log("Detectando Hojas: ", "orange")
    this.log(archivoVerificacion.SheetNames,"orange");
    this.log("-----------------------------", "orange")

    //Selección de hojas para Schema:
    switch(this.archivoSeleccionado){
      
      case "Heroes_Stats":
        nombresHojas= ['MINOTAURO','CRUZADO','CAZADOR','CHRONOMANTE','HECHICERO','INGENIERO','CLERIGO','SEGADOR_DE_ALMAS']
      break;
      case "Heroes_Hech":
        nombresHojas= ['ANGEL_CAIDO','CABALLERO','CAZADOR','CHRONOMANTE','CLERIGO','CRUZADO','ENANO','GLADIADOR','HECHICERO','INGENIERO','LICH','MINOTAURO','SEGADOR_DE_ALMAS']
      break;
      case "Enemigos":
        nombresHojas= ['ENEMIGOS_STATS','ENEMIGOS_HECH','ENEMIGOS_PASIVAS','ENEMIGOS_BUFFOS']
      break;
      case "Buff":
        nombresHojas= ['BUFF']
      break;
      case "Objetos":
        nombresHojas= ['EQUIPO','CONSUMIBLE']
      break;
      case "MazmorraSnack":
        nombresHojas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
      break;
      case "GuardadoSnack":
        nombresHojas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
      break;
      case "MazmorraDummy":
        nombresHojas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
      break;
      case "GuardadoDummy":
        nombresHojas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
      break;
      case "Animaciones":
        nombresHojas= ['ANIMACIONES']
      break;
      case "Parametros":
        nombresHojas= ['PERSONAJES','ATRIBUTOS','ESCALADO']
      break;
      case "Perfil":
        nombresHojas= ['CONFIGURACION','LOGROS','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
      break;
      case "Personajes":
        nombresHojas= ['PERSONAJES']
      break;
    }

    //Descomposicion de Hojas:
    for(var i=0; i<nombresHojas.length; i++){
      try{

        this.log("Obteniendo Hoja: "+nombresHojas[i], "orange")

        worksheet = archivoVerificacion.Sheets[nombresHojas[i]];
        cabecerasHojas.push(XLSX.utils.sheet_to_json(worksheet, {header: 1,range: 12})[0]);

        //Formateo de columnas:
        for(var j= 0; j<cabecerasHojas[i].length;j++){
          cabecerasHojas[i][j]= cabecerasHojas[i][j].toLowerCase();
          cabecerasHojas[i][j]= cabecerasHojas[i][j].replace(/ /g,"_");
        }
  
        hojasArchivo.push((XLSX.utils.sheet_to_json(worksheet, {header: cabecerasHojas[i],range: 13})));
      }catch(error){
        this.log("ERROR obteniendo hoja: "+nombresHojas[i],"red");
        errorVerificacion=true;
        console.log(error);
      }
    }

    if(errorVerificacion){
      this.log("**ERROR: Verificacion de "+this.archivoSeleccionado+" no superada","red");
      this.archivosExcel[this.indexArchivoSeleccionado].error= true;
    return;}else{
      this.log("**EXITO: La verificacion se ha superado con exito","green");
    }

    //CONSTRUCTOR DE ARCHIVO:
    for(var i=0; i<nombresHojas.length; i++){
      objetoArchivo[nombresHojas[i].toLowerCase().replace(/ /g,"_")]=hojasArchivo[i];
    }

    //Incluir nombreID
    objetoArchivo["nombreId"]= this.archivoSeleccionado;

    console.log("Archivo Verificado: ");
    console.log(objetoArchivo);

    //Guardando archivo:
    this.archivosExcel[this.indexArchivoSeleccionado].objetoArchivo= objetoArchivo;
    this.archivosExcel[this.indexArchivoSeleccionado].verificado= true;

    return;
  }

  subirArchivo(){
    this.archivosExcel[this.indexArchivoSeleccionado].estado="subido";
    this.log("Subiendo archivo...","orange");
    this.mostrarMensaje= true;
    this.mostrarSpinner= true;
    this.mensaje= "Subiendo archivo: "+this.archivoSeleccionado;
    if(this.appService.subirArchivo(this.archivosExcel[this.indexArchivoSeleccionado].objetoArchivo)){
      this.log("Archivo subido con exito.","green");
      this.mostrarMensaje= false;
      this.reloadDatos(false);
    }else{
      this.log("Error en la subida del archivo","red");
      this.mostrarMensaje= false;
    }
  }

  toggleDatosOficiales(){
    this.archivoSeleccionado="null";
    this.estadoDatos= "ver";
    this.archivoDato={}
    this.log("Datos Oficiales = "+!this.appService.activarDatosOficiales,"orange");
    this.appService.toggleDatosOficialesDesarrollador();
  }

  reloadDatos(forzarEstadoVer:boolean){
    this.log("Obteniendo datos (Perfil: "+this.appService.getValidacion().nombre+" + Oficial)","orange");
    this.mostrarMensaje= true;
    this.mostrarSpinner= true;
    this.mensaje= "Actualizando Datos..."

    var clave = {
            clave: parseInt(this.appService.getValidacion().clave)
          }
		  console.log("CLAVEEE: "+clave);
		  console.log(clave)
		  
    this.http.post(this.appService.ipRemota+"/deliriumAPI/validacion",clave).subscribe((data) => {
            
            if(data){
				this.appService.setInicio(data["datos"]);
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
  }

  seleccionarElementoIsometrico(indexElemento: number){
		this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado = !this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado;
	return;
  }

  asignarSala(idSala: number){
	  //Verificar Sala;
	  var salaValida= false; 
	  for(var i=0; i<this.mazmorra.salas.length; i++){
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
	  for(var i=0; i<this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
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
		for(var i= 0; i<this.mazmorra.isometrico.MapSave.Placeables.Placeable.length;i++){
			if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala==this.salaSeleccionadaId){
				this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala= 0;
			}
		}
		
		//Deselecciona la sala seleccionada:
		this.salaSeleccionadaId=0;

	return;
  }
  
  eliminarEnemigo(){
	  
		//Elimina elemento sala del Array de salas:
		this.mazmorra["enemigos"].splice(this.mazmorra.enemigos.indexOf(this.mazmorra.enemigos.find(i=> i.enemigo_id==this.enemigoSeleccionadoId)),1);

		//Deselecciona la sala seleccionada:
		this.enemigoSeleccionadoId=0;

	return;
  }

  eliminarEvento(){
	  
		//Elimina el evento:
		this.mazmorra["eventos"].splice(this.mazmorra.eventos.indexOf(this.mazmorra.eventos.find(i=> i.id_evento==this.eventoSeleccionadoId)),1);

		//Deselecciona la sala seleccionada:
		this.eventoSeleccionadoId=0;

	return;
  }
 
} //FIN EXPORT










