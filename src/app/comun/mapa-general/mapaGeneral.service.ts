
import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AppService } from '../../app.service';
import { TriggerService } from "../../trigger.service"
import * as cloneDeep from 'lodash/cloneDeep';

@Injectable({
  providedIn: 'root'
})

export class MapaGeneralService {

    //Variables Inmap:
    public estadoInMap: "global"|"region" = "global";
    private regionInmap:number = 1;
    public region: any = {};
    public renderIsometrico: any = [];
    private coordenadaX: number = 0; 
    private coordenadaY: number = 0; 
    private regionCargada: string = null;
    public opcionOverlay: boolean = false;
    public radioRenderIsometrico: number = 6;
    private desarrollador: boolean = false;
    private sesion: any;

    private triggerRegion: any; //DECOMISION?

    constructor(private triggerService: TriggerService, public appService: AppService, private http: HttpClient) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
    }

    @Output() eventoMapaGeneral: EventEmitter<string> = new EventEmitter();

  // *************************************************
  //    INMAP:
  // ************************************************* 

  setDesarrollador(val:boolean){
      this.desarrollador = val;
      return;
  }

  async cargarRegion(zona:string){

        console.warn("CARGAR REGION: ",zona);
        if(zona== undefined || zona== null || zona==""){ console.error("Zona no valida"); return;} 

        if(zona=="Global"){
            this.eventoMapaGeneral.emit("cargarMapa");
            this.estadoInMap= "global"      
            this.appService.setEstadoInMap(this.estadoInMap);
            setTimeout(()=>{
                this.eventoMapaGeneral.emit("cargaMapaCompleta");
            },1500);
            return;
        }

        /*
        if(this.regionCargada == zona){
            console.warn("Region cargada previamente");
            this.eventoMapaGeneral.emit("cargarMapa");
            this.estadoInMap= "region"      
            this.appService.setEstadoInMap(this.estadoInMap);
            setTimeout(()=>{
                this.eventoMapaGeneral.emit("cargaMapaCompleta");
            },1500);
            return;
        }
        */

        //Mostrar NUBES de Carga:
        this.eventoMapaGeneral.emit("cargarMapa");

        //Solicita la carga de la region a la appService:
        //this.region = Object.assign(new Object({}),await this.appService.peticionHttpRegion(zona));

        this.region= cloneDeep(await this.appService.peticionHttpRegion(zona));

        this.regionCargada = zona;
        //this.inicializarIsometricoMapa(); //Fuerza la carga de isometrico generado en desarrolladoService;
        
        var radioVision = this.radioRenderIsometrico;
        this.renderIsometrico = [];

        if(this.sesion.render.variablesMundo["tutorial"] == "true" && !this.desarrollador){
            for(var i = 0; i < this.region.dimensionX; i++){
                for(var j = 0; j < this.region.dimensionY; j++){
                    this.region.isometrico[i][j]["atravesable"]= false;
                }
            }
            //Casillas Atravesables Tutorial:
            this.region.isometrico[56][48]["atravesable"]= true;
            this.region.isometrico[56][49]["atravesable"]= true;
            this.region.isometrico[56][50]["atravesable"]= true;
            this.region.isometrico[57][50]["atravesable"]= true;
            this.region.isometrico[58][50]["atravesable"]= true;
            this.region.isometrico[59][50]["atravesable"]= true;
            this.region.isometrico[59][49]["atravesable"]= true;
            this.region.isometrico[59][51]["atravesable"]= true;
            this.region.isometrico[60][50]["atravesable"]= true;
            this.region.isometrico[61][50]["atravesable"]= true;
            this.region.isometrico[62][50]["atravesable"]= true;
            this.region.isometrico[63][50]["atravesable"]= true;
            this.region.isometrico[63][49]["atravesable"]= true;
            this.region.isometrico[62][49]["atravesable"]= true;
        }

        if(!this.desarrollador){
            var coordenadaMinX = this.sesion.render.inmap.posicion_x - radioVision;
            var coordenadaMinY = this.sesion.render.inmap.posicion_y - radioVision;
            var coordenadaMaxX = this.sesion.render.inmap.posicion_x + radioVision+1;
            var coordenadaMaxY = this.sesion.render.inmap.posicion_y + radioVision+1;

            //Bloqueo de valores de coordenadas:
            //if(coordenadaMinX < 0){ coordenadaMinX = 0; }
            //if(coordenadaMinY < 0){ coordenadaMinY = 0; }
            //if(coordenadaMaxX > this.region.isometrico.length){ coordenadaMaxX = this.region.isometrico.length; }
            //if(coordenadaMaxY > this.region.isometrico.length){ coordenadaMaxY = this.region.isometrico.length; }

            var slice = [];

            for(var i = coordenadaMinX; i < coordenadaMaxX; i++){
                slice = [];

                if(this.region.isometrico[i]){

                    var sliceAnterior = [];
                    var slicePosterior = [];
                    slice = this.region.isometrico[i].slice(coordenadaMinY,coordenadaMaxY)

                    if(coordenadaMinY < 0){
                        for(var j=0; j < (coordenadaMinY*(-1)); j++){
                            sliceAnterior.push(this.crearTileFinMapa(0,0))
                        }
                        slice = this.region.isometrico[i].slice(0,coordenadaMaxY) 
                    }
                    if(coordenadaMaxY > this.region.isometrico[0].length){
                        for(var j=0; j < (coordenadaMaxY-this.region.isometrico[0].length); j++){
                            slicePosterior.push(this.crearTileFinMapa(0,0))
                        }
                        slice = this.region.isometrico[i].slice(coordenadaMinY,this.region.isometrico[0].length) 
                    }

                    slice= sliceAnterior.concat(slice).concat(slicePosterior);

                }else{
                    for(var j=0; j < coordenadaMaxY-coordenadaMinY; j++){
                        slice.push(this.crearTileFinMapa(0,0))
                    }
                }
                
                this.renderIsometrico.push(slice);

            }
        }else{
            //Si es el panel de desarrollador:
            this.renderIsometrico= this.region.isometrico;
        }

        //Cargar Render Isometrico:
        console.log("RENDER ISOMETRICO: ")
        console.log(this.renderIsometrico)

        //Cargar Triggers de Región:
        var triggersRegion = [];
        for(var i = 0; i < this.region.dimensionX; i++){
            for(var j = 0; j < this.region.dimensionY; j++){
               if(this.region.isometrico[i][j].triggersInMapEventos.length){
                   for(var k = 0; k < this.region.isometrico[i][j].triggersInMapEventos.length; k++){
                    triggersRegion.push(this.region.isometrico[i][j].triggersInMapEventos[k]);
                    triggersRegion[triggersRegion.length-1]["posicion_x"]=i;
                    triggersRegion[triggersRegion.length-1]["posicion_y"]=j;
                   }
               }
            }
        }


        //Verifica los posibles movimientos:
        this.eventoMapaGeneral.emit("verificarMovimiento");

        //SET TRIGGERS DE REGION:
        this.triggerService.setTriggerRegion(triggersRegion);

        this.estadoInMap= "region"      
        this.appService.setEstadoInMap(this.estadoInMap);

        this.eventoMapaGeneral.emit("cargaMapaCompleta");
        //this.regularizarRegion();
  }

  desplazarCoordenada(posicionX,posicionY){
    this.sesion.render.inmap.posicion_x = posicionX;
    this.sesion.render.inmap.posicion_y = posicionY;
    this.cargarRegion("Asfaloth");
  }


  regularizarRegion(){
      console.log("REGULARIZANDO RENDER ISOMETRICO")

      for(var i=0; i < this.region.isometrico.length; i++){
      /*
          this.region.isometrico[i].forEach(function(v){
              delete v.probabilidadEventoCamino
              delete v.categoriaEventoCamino
              delete v.eventoId
              delete v.indicadorCogerMision
              delete v.indicadorEvento
              delete v.indicadorPeligro
              delete v.indicadorTerrenoDificil
          })
        */
          
        for(var j=0; j < this.region.isometrico[i].length; j++){

            this.region.isometrico[i][j]["probabilidadEvento"] = 0;
            //this.region.isometrico[i][j]["categoriaEvento"] = "camino";
            //this.region.isometrico[i][j]["indicador"] = null;
            this.region.isometrico[i][j]["eventoInspeccion"] = 0;
            //this.region.isometrico[i][j]["ubicacionEspecial"] = null;
            this.region.isometrico[i][j]["checkMisiones"] = [];
            //this.region.isometrico[i][j]["nombre"] = null;
            //this.region.isometrico[i][j]["descripcion"] = null;
            this.region.isometrico[i][j]["atravesable"] = true;

            //Defecto Mar:
            if(this.region.isometrico[i][j].tileImage == 122){ 
                this.region.isometrico[i][j].atravesable = false;
            }

            //Defecto Montaña:
            if(this.region.isometrico[i][j].tileImage == 14){ 
                this.region.isometrico[i][j].atravesable = false;
            }

            if(this.region.isometrico[i][j].tileImage == 118){ 
                this.region.isometrico[i][j].atravesable = false;
            }

            //Caminos
            if(
                this.region.isometrico[i][j].tileImageOverlay == 104 ||
                this.region.isometrico[i][j].tileImageOverlay == 105 ||
                this.region.isometrico[i][j].tileImageOverlay == 106 ||
                this.region.isometrico[i][j].tileImageOverlay == 107 ||
                this.region.isometrico[i][j].tileImageOverlay == 108 ||
                this.region.isometrico[i][j].tileImageOverlay == 109 
              ){ 
                this.region.isometrico[i][j].atravesable = true;
                this.region.isometrico[i][j]["categoriaEvento"] = "camino";
                this.region.isometrico[i][j]["probabilidadEvento"] = 0.15;
            }

            //Bosque;
            if(
                this.region.isometrico[i][j].tileImage == 118 ||
                this.region.isometrico[i][j].tileImage == 47  ||
                this.region.isometrico[i][j].tileImage == 113 ||
                this.region.isometrico[i][j].tileImage == 200 ||
                this.region.isometrico[i][j].tileImage == 208 
              ){ 
                this.region.isometrico[i][j].tipoTerreno = "bosque";
                this.region.isometrico[i][j]["categoriaEvento"] = "bosque";
                this.region.isometrico[i][j]["probabilidadEvento"] = 0.33;
            }
        }

      }

      console.log("REGION REGULARIZADA: ");
      console.log(this.region)
  }

  getRegion(){
      return this.region;
  }

  setRegion(){
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

  realizarMovimientoInMap(direccion:"NorEste"|"SurEste"|"SurOeste"|"NorOeste"){
      switch(direccion){
          case "NorEste":
                this.eventoMapaGeneral.emit("movimientoNorEste");
              break
          case "SurEste":
                this.eventoMapaGeneral.emit("movimientoSurEste");
              break
          case "SurOeste":
                this.eventoMapaGeneral.emit("movimientoSurOeste");
              break
          case "NorOeste":
                this.eventoMapaGeneral.emit("movimientoNorOeste");
              break
      }
  }

  crearTileFinMapa(posicionX:number,posicionY:number){
      return {
            "coordenadaX": posicionX,
            "coodenadaY": posicionY,
            "tileImage": 122,
            "tipoTerreno": "mar",
            "atravesable": false,
            "indicadorTerronoDificil": false,
            "nombre": null,
            "descripcion": null,
            "animacionId": 0,
            "estado": "",
            "inspeccionable": false,
            "mensajeInspeccion": "",
            "tileImageOverlay": 0,
            "probabilidadEvento": 0,
            "categoriaEvento": "mar",
            "indicador": null,
            "eventoInspeccion": 0,
            "ubicacionEspecial": null,
            "triggersInMapEventos": [],
            "triggersInMapMisiones": [],
            "checkMisiones": []
        }
  }

  verificarMovimiento(){
    this.eventoMapaGeneral.emit("verificarMovimiento");
  }

}

