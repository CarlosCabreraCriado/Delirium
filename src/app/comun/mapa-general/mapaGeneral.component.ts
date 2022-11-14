
import { Component , Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { MapaGeneralService } from './mapaGeneral.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'mapaGeneralComponent',
  templateUrl: './mapaGeneral.component.html',
  styleUrls: ['./mapaGeneral.component.sass']
})

export class MapaGeneralComponent {

    private casillaSeleccionadaX = 0;
    private casillaSeleccionadaY = 0;

	@Input() tileImgSeleccionado: number;
	@Input() herramientaInMap: string = "";
	@Input() opcionesDesarrolloInMap: any;

	@Input() mostrarNiebla: boolean = true;
	@Input() mostrarInfranqueable: boolean;

    @Output() tileCopiado = new EventEmitter<number>();
    @Output() tileSeleccionado = new EventEmitter<{x: number, y: number, xAntigua: number, yAntigua: number, ignoraGuardado: boolean}>();

  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;


	constructor(public appService: AppService, public mapaGeneralService: MapaGeneralService) {}

  clickTile(i:number,j:number,event: any){
    console.log("Click: i: "+i+" j: "+j) 

    //Detectar Primer Click: 
    if(this.casillaSeleccionadaX != i || this.casillaSeleccionadaY != j){
       //Seleccionando Casilla: 
        var flagIgnoraGuardadoForm = false
        if(this.casillaSeleccionadaX == 0 && this.casillaSeleccionadaY == 0){
            flagIgnoraGuardadoForm = true
        }
        this.tileSeleccionado.emit({x: i,y: j,xAntigua: this.casillaSeleccionadaX,yAntigua: this.casillaSeleccionadaY, ignoraGuardado: flagIgnoraGuardadoForm});
        this.casillaSeleccionadaX = i;
        this.casillaSeleccionadaY = j;
    }else{
    switch(this.opcionesDesarrolloInMap.herramientaInMap){
        case "add":
            console.log("Añadiendo")
            if(!this.opcionesDesarrolloInMap.opcionOverlay){
                this.mapaGeneralService.region.isometrico[i][j].tileImage= this.opcionesDesarrolloInMap.tileImgSeleccionado;
            }else{
                this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay= this.opcionesDesarrolloInMap.tileImgSeleccionado;
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

    } // Fin Else opcion accion de herramienta
  } //Fin click

  clickTileAux(i:number,j:number,event: any){

    //Copiar Tile con click de la rueda del raton:
    if(event.which === 2){
        if(this.opcionesDesarrolloInMap.opcionOverlay){
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay);
        }else{
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImage);
        }
    }
  } //Fin click AUX

  renderTile(i:number, j:number){

      //Si está Seleccionada:
      if(this.casillaSeleccionadaX === i && this.casillaSeleccionadaY === j){
          return "seleccionada";
      }

      if(this.mostrarInfranqueable){
          if(!this.mapaGeneralService.region.isometrico[i][j].atravesable){
              return "infranqueable";
          }
      }

      return "noDisplay";
  }

} //Fin Componente




