
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
    private region: any = {};
    private coordenadaX: number = 0; 
    private coordenadaY: number = 0; 
    private regionSeleccionada: string = "";
    private tileSeleccionado: number = 1;
    public herramientaInMap: string = "add";
    public opcionOverlay: boolean = false;

  	constructor(public appService: AppService, private http: HttpClient) { }

  // *************************************************
  //    INMAP:
  // ************************************************* 

  seleccionarZona(zona:string){

        if(zona== undefined || zona== null || zona==""){ console.log("Zona no valida"); return;} 

		console.log("Cargando Region: "+zona);
		this.http.post(this.appService.ipRemota+"/deliriumAPI/cargarRegion",{nombreRegion: zona, token: this.appService.getToken()}).subscribe((data) => {
			console.log("Región: ");
			console.log(data);	
			this.region= data;
            this.regionSeleccionada = zona;
            //this.inicializarIsometricoMapa(); //Fuerza la carga de isometrico generado en desarrolladoService;
            this.estadoInmap= "isometrico"      
        })

  }

  seleccionarHerramientaInMap(herramienta:string){
      console.log("Cambiando Herramienta: "+herramienta);

      switch(herramienta){

        case "add":
        case "eliminar":
            this.herramientaInMap = herramienta;
        break;
         
        case "overlay":
            this.opcionOverlay = true;
        break;

        case "base":
            this.opcionOverlay = false;
        break;
      }

  }

  clickTile(i:number,j:number){
    console.log("Click: i: "+i+" j: "+j) 
    switch(this.herramientaInMap){
        case "add":
            if(!this.opcionOverlay){
                this.region.isometrico[i][j].tileImage= this.tileSeleccionado;
            }else{
                this.region.isometrico[i][j].tileImageOverlay= this.tileSeleccionado;
            }
            break;
        case "eliminar":
            if(!this.opcionOverlay){
                this.region.isometrico[i][j].tileImage=0;
            }else{
                this.region.isometrico[i][j].tileImageOverlay=0;
            }
            break;
    }
                
  }

}

