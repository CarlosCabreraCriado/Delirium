
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
        })

  }

  getRegion(){
      return this.region;
  }



}

