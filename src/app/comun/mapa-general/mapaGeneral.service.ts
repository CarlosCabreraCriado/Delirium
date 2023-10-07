
import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AppService } from '../../app.service';
import { TriggerService } from "../../trigger.service"

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
        this.region = await this.appService.peticionHttpRegion(zona);

        this.regionCargada = zona;
        //this.inicializarIsometricoMapa(); //Fuerza la carga de isometrico generado en desarrolladoService;
        
        var radioVision = this.radioRenderIsometrico;
        this.renderIsometrico = [];

        if(!this.desarrollador){
            var coordenadaMinX = this.sesion.render.inmap.posicion_x - radioVision;
            var coordenadaMinY = this.sesion.render.inmap.posicion_y - radioVision;
            var coordenadaMaxX = this.sesion.render.inmap.posicion_x + radioVision+1;
            var coordenadaMaxY = this.sesion.render.inmap.posicion_y + radioVision+1;

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

  regularizarRegion(){
      console.log("REGULARIZANDO RENDER ISOMETRICO")
      for(var i=0; i < this.region.isometrico.length; i++){
          this.region.isometrico[i].forEach(function(v){
              delete v.probabilidadEventoCamino
              delete v.categoriaEventoCamino
              delete v.eventoId
              delete v.indicadorCogerMision
              delete v.indicadorEvento
              delete v.indicadorPeligro
              delete v.indicadorTerrenoDificil
          })
          
        for(var j=0; j < this.region.isometrico[i].length; j++){
            this.region.isometrico[i][j]["probabilidadEvento"] = 0;
            this.region.isometrico[i][j]["categoriaEvento"] = "camino";
            this.region.isometrico[i][j]["indicador"] = null;
            this.region.isometrico[i][j]["eventoInspeccion"] = 0;
            this.region.isometrico[i][j]["eventoInspeccion"] = 0;
            this.region.isometrico[i][j]["ubicacionEspecial"] = null;
            this.region.isometrico[i][j]["checkMisiones"] = [];
            this.region.isometrico[i][j]["nombre"] = null;
            this.region.isometrico[i][j]["descripcion"] = null;

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
            //Bosque;
            if(this.region.isometrico[i][j].tileImage == 118){ 
                this.region.isometrico[i][j].tipoTerreno = "bosque";
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


}

