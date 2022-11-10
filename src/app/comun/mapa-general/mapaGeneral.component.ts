
import { Component , Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { MapaGeneralService } from './mapaGeneral.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'mapaGeneralComponent',
  templateUrl: './mapaGeneral.component.html',
  styleUrls: ['./mapaGeneral.component.sass']
})

export class MapaGeneralComponent {

	@Input() tileSeleccionado: number;
	@Input() herramientaInMap: string = "";
	@Input() opcionesDesarrolloInMap: any;

    @Output() tileCopiado = new EventEmitter<number>();

  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;

	constructor(public appService: AppService, public mapaGeneralService: MapaGeneralService) {}

  clickTile(i:number,j:number,event: any){
    console.log("Click: i: "+i+" j: "+j) 
    switch(this.opcionesDesarrolloInMap.herramientaInMap){
        case "add":
            console.log("Añadiendo")
            if(!this.opcionesDesarrolloInMap.opcionOverlay){
                this.mapaGeneralService.region.isometrico[i][j].tileImage= this.opcionesDesarrolloInMap.tileSeleccionado;
            }else{
                this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay= this.opcionesDesarrolloInMap.tileSeleccionado;
            }
            break;
        case "eliminar":
            console.log("Eliminando")
            if(!this.opcionesDesarrolloInMap.opcionOverlay){
                this.mapaGeneralService.region.isometrico[i][j].tileImage=0;
            }else{
                this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay=0;
            }
            break;
    }
  }

  clickTileAux(i:number,j:number,event: any){

    //Copiar Tile con click de la rueda del raton:
    if(event.which === 2){
        if(this.opcionesDesarrolloInMap.opcionOverlay){
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay);
        }else{
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImage);
        }
    }

                
  }

} //Fin Componente




