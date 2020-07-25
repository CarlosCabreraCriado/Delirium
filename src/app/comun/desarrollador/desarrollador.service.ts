
import { Injectable, OnInit} from '@angular/core';
import { AppService } from '../../app.service';
import { HttpClient } from "@angular/common/http";
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})

export class DesarrolladorService implements OnInit{

  //Variables de control:
  public validacion: any= {}

  //Variables de Estado Paneles Principales:
	public panel= "datos";
	public estadoInmap= "";
	public estadoMazmorra= "";
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
  public mensaje= "Actualizando Datos..."

  //Logger Consola
  public logger=[];
  private loggerColor=[];

  constructor(public appService: AppService, private http: HttpClient)  { 
  }

  ngOnInit(){
    
  }

  inicializarGestor(){
    console.log("INICIANDO HERRAMIENTA DESARROLLADOR");
    this.validacion= this.appService.getValidacion();
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
            vectorPaginas= ['GUERRERO','CRUZADO','CAZADOR','CHRONOMANTE','HECHICERO','INGENIERO','ILUMINADO','MAGO_DE_SANGRE']
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
        nombresHojas= ['GUERRERO','CRUZADO','CAZADOR','CHRONOMANTE','HECHICERO','INGENIERO','ILUMINADO','MAGO_DE_SANGRE']
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
    this.http.post(this.appService.ipRemota+"/deliriumAPI/validacion",clave).subscribe((data) => {
            
            if(data){
              this.appService.setInicio(data);
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
 
} //FIN EXPORT










