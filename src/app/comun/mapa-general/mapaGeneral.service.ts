
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AppService } from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class MapaGeneralService {

    //Variables Inmap:
	public estadoInmap= "global";
    private regionInmap:number = 1;
    public region: any = {};
    private coordenadaX: number = 0; 
    private coordenadaY: number = 0; 
    private regionSeleccionada: string = "";
    public opcionOverlay: boolean = false;

  	constructor(public appService: AppService, private http: HttpClient) { }

  // *************************************************
  //    INMAP:
  // ************************************************* 

  async seleccionarZona(zona:string){

        if(zona== undefined || zona== null || zona==""){ console.log("Zona no valida"); return;} 

		console.log("Cargando Region: "+zona);
        var token = await this.appService.getToken();
		this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarRegion",{nombreRegion: zona, token: token}).subscribe((data) => {
			console.log("Región: ");
			console.log(data);	
			this.region= data;
            this.regionSeleccionada = zona;
            //this.inicializarIsometricoMapa(); //Fuerza la carga de isometrico generado en desarrolladoService;
            this.estadoInmap= "isometrico"      

            //this.regularizarRegion();
        })

  }

  regularizarRegion(){
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

  getTile(x:number,y:number){
      return this.region.isometrico[x][y];
  }

  setTile(x:number,y:number,formGeneral:any,formTerreno:any,formEventos,formMisiones:any){
      
        //Fomrulario General:
        this.region.isometrico[x][y].nombre = formGeneral.inMapNombre
        this.region.isometrico[x][y].descripcion = formGeneral.inMapDescripcion
        this.region.isometrico[x][y].indicador = formGeneral.inMapIndicador

        //Fomrulario General:
        this.region.isometrico[x][y].atravesable = formTerreno.inMapAtravesable
        this.region.isometrico[x][y].inspeccionable = formTerreno.inMapInspeccionable
        this.region.isometrico[x][y].tipoTerreno = formTerreno.inMapTipoTerreno
        this.region.isometrico[x][y].ubicacionEspecial = formTerreno.inMapUbicacionEspecial
        this.region.isometrico[x][y].visitado = formTerreno.inMapVisitado

        //Fomrulario Eventos:
        this.region.isometrico[x][y].categoriaEvento = formEventos.inMapCategoriaRandom
        this.region.isometrico[x][y].probabilidadEvento = formEventos.inMapProbabilidadRandom
        this.region.isometrico[x][y].checkEventos = formEventos.inMapCheckTrigger

        //Fomrulario Eventos:
        this.region.isometrico[x][y].checkMisiones = formMisiones.inMapCheckMisiones

      return true;
  }





}

