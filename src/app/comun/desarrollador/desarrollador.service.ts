
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
import { EventosService } from "../../eventos.service"
import { MapaGeneralService } from "../mapa-general/mapaGeneral.service"

@Injectable({
  providedIn: 'root'
})

export class DesarrolladorService implements OnInit{

  //Variables de control:
    public cuenta: any= {}

  //Variables de Estado Paneles Principales:
    public panel= "datos";
    public estadoInmap= "global";
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

    public hechizoSeleccionadoIndex = 0;
    public buffSeleccionadoIndex = 0;
    public animacionSeleccionadoIndex = 0;
    public subanimacionSeleccionadoIndex = 0;
    public sonidoSeleccionadoIndex = 0;
    public enemigoSeleccionadoIndex = 0;
    public eventoSeleccionadoIndex = 0;
    public eventoSeleccionadoId = 0;
    public tipoOrdenSeleccionada = "Condición";
    public ordenSeleccionadaIndex = null;
    public misionSeleccionadaIndex = 0;
    public objetivoMisionSeleccionadoIndex = 0;

    public imagenes: any= [];

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


  constructor(private mapaGeneralService: MapaGeneralService,private eventosService: EventosService, public appService: AppService, private http: HttpClient, private dialog: MatDialog)  {
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

  getRegion(){return this.mapaGeneralService.getRegion();}

  async getTile(x:number,y:number){
      return this.mapaGeneralService.getTile(x,y);
  }

  async setTile(x:number,y:number,formGeneral:any,formTerreno:any,formEventos,formMisiones:any){
      return this.mapaGeneralService.setTile(x,y,formGeneral,formTerreno,formEventos,formMisiones);
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

  async peticionListaMazmorras(){
    var token = await this.appService.getToken();
    return this.http.post(this.appService.ipRemota+"/deliriumAPI/listaMazmorra",{token: token}).toPromise()
  }

  async peticionGuardarMazmorra(mazmorra){
    console.warn("GUARDANDO: ",mazmorra);
    var token = await this.appService.getToken();
    return this.http.post(this.appService.ipRemota+"/deliriumAPI/guardarMazmorra",{mazmorra: mazmorra, token: token}).toPromise();
  }

  async peticionEliminarMazmorra(mazmorra){
    var token = await this.appService.getToken();
    return this.http.post(this.appService.ipRemota+"/deliriumAPI/eliminarMazmorra",{mazmorra: mazmorra, token: token}).toPromise();
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
      this.region = this.mapaGeneralService.getRegion();
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
      console.log(this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex]);
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
      this.ordenSeleccionadaIndex = null;
      this.eventoSeleccionadoId = this.eventos.eventos[this.eventoSeleccionadoIndex].id;
      this.tipoOrdenSeleccionada = null;
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
      this.ordenSeleccionadaIndex = null;
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
                  nombre: "Nuevo "+tipoOrden,
                  tipo: tipoOrden,
                  tipoDialogo: null,
                  contenido: null,
                  opciones: [],
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
      this.ordenSeleccionadaIndex = null;
      this.tipoOrdenSeleccionada = null;
      /*
      if(this.ordenSeleccionadaIndex>0){
          this.ordenSeleccionadaIndex -= 1;
      }
      this.tipoOrdenSeleccionada = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex].tipo;
      */
      this.observarDesarrolladorService.next("reloadFormEventos");
  }

  ordenarOrden(comando: "subir"|"bajar"){
      if(this.ordenSeleccionadaIndex == null){return;}
      var indexOrigen = this.ordenSeleccionadaIndex;
      var indexDestino = 0;

      if(comando=="subir"){
          indexDestino = indexOrigen-1;
      }else{
          indexDestino = indexOrigen+1;
      }

      //Evitar Swap imposible:
      if(indexOrigen == indexDestino){
          return;
      }else if(indexDestino < 0){
          console.warn("Evitando Swap por overflow")
          return;
      }else if(indexDestino > this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.length-1){
          console.warn("Evitando Swap por overflow")
          return;
      }

      //Comando Swap:
      this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[indexOrigen] = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes.splice(indexDestino, 1, this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[indexOrigen])[0];
      this.ordenSeleccionadaIndex = indexDestino;
      return;

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
                  this.mapaGeneralService.region.isometrico[this.coordenadaX,this.coordenadaY].triggersInMapEventos = result;
                  break;
              case "inmap-mision":
                  this.mapaGeneralService.region.isometrico[this.coordenadaX,this.coordenadaY].triggersInMapMisiones = result;
                  break;
          }

        });
        return;
    }

    testEvento(){
        this.appService.actualizarSesion();
        this.eventosService.setEventos(this.eventos);
        this.eventosService.ejecutarEvento(this.eventoSeleccionadoId);
    }

} //FIN EXPORT










