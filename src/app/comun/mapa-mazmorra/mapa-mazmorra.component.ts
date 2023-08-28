
import { Component , Input, ElementRef , ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { PinchZoomComponent } from '../../comun/pinch-zoom/pinch-zoom.component';

@Component({
  selector: 'mapaMazmorraComponent',
  templateUrl: './mapa-mazmorra.component.html',
  styleUrls: ['./mapa-mazmorra.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapaMazmorraComponent {

	@Input() isometrico: any;
	@Input() salasDescubiertas: any;
	@Input() escalaIsometrico: number;

	constructor() {}

  	@ViewChild('canvasIsometrico',{static: false}) canvasIsometrico: ElementRef;
  	@ViewChild('pinchZoom',{static: false}) private pinchZoom: PinchZoomComponent;

    public estiloContenedorIsometrico: any
    public estiloIsometrico: any

	//********************
	// RENDER ISOMETRICO
	//********************

	renderizarCanvasIsometrico(){

		var posicionMax_x = 0;
		var posicionMax_y = 0;

		for(var i = 0; i < this.isometrico.MapSave.Placeables.Placeable.length; i++){
			if(this.isometrico.MapSave.Placeables.Placeable[i].Position.x > posicionMax_x && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
				posicionMax_x = this.isometrico.MapSave.Placeables.Placeable[i].Position.x;
			}
			if(this.isometrico.MapSave.Placeables.Placeable[i].Position.y > posicionMax_y && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
				posicionMax_y = this.isometrico.MapSave.Placeables.Placeable[i].Position.y;
			}
		}

		console.log("Posicion Max X: "+ posicionMax_x);
		console.log("Posicion Max Y: "+ posicionMax_y);

		this.estiloIsometrico = {
			"width": ""+(posicionMax_x*1.8)+"px",
			"height": ""+(posicionMax_y*1)+"px",
			//"margin-left": ""+(posicionMax_x/2)+"px",
			//"margin-top": ""+(posicionMax_y/2)+"px",
			//"margin-right": ""+(posicionMax_x/2)+"px",
			//"margin-bottom": ""+(posicionMax_y/2)+"px"
		}

		//Centrar el isometrico:
		//this.canvasIsometrico.nativeElement.scrollTop = posicionMax_y/2
		//this.canvasIsometrico.nativeElement.scrollLeft = posicionMax_x/2

	}

	renderizarElementoIsometrico(elemento: any):any{

		var opcionesCanvas = this.isometrico.MapSave.MapSettings
		var style = {
			"position": "absolute",
			"top": "",
			"left": "",
			"width": "",
			"height": "",
			"z-index": 0,
			"transform": "translate(-50%,-50%) scaleX(1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")",
			"-webkit-mask-image": "url('"+elemento.ImagePath+"')",
			//"mix-blend-mode": "multiply"',
			"display": "block",
      "pointer-events": ""
		}

		//Renderizar Elemento:
		var top = (parseFloat(elemento.Position.y)*this.escalaIsometrico/*+parseFloat(elemento.VisibilityColliderStackingOffset.y)*/) + "px";
		style["top"]= top.replace(/,/g,".")

		var left= (parseFloat(elemento.Position.x)*this.escalaIsometrico/*-parseFloat(elemento.VisibilityColliderStackingOffset.x)*/) + "px";
		style["left"]= left.replace(/,/g,".")

		var zIndex= (parseFloat(elemento.Position.z)+100)*10
		style["z-index"]= Math.floor(zIndex)

		if(elemento.Mirror=="true"){
			style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
		}
		if(elemento.Mirror==true){
			style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
		}

		//Aplicar filtrado de visualizacion:
		style["display"] = "none";

    if(elemento.seleccionable){
		  style["pointer-events"] = "all";
    }else{
		  style["pointer-events"] = "none";
    }

		for(var i =0; i <this.salasDescubiertas.length; i++){
			if(Number(this.salasDescubiertas[i])==Number(elemento.sala)){
				style.display= "block";
			}
		}

		//Renderizar Seleccion:
		if(elemento.seleccionado){
			style["filter"] = "sepia(100%) saturate(100)";
		}

		//Aplicar filtro de Seleccion:
		//var width= ((window.innerWidth*0.7)/opcionesCanvas.MapSizeX)*100 + "px";
		//style.width= width.replace(/,/g,".")

		//var height= ((window.innerHeight*0.6)/opcionesCanvas.MapSizeY)*100 + "%";
		//style.height= height.replace(/,/g,".")

		return style;
	}

    centrarMazmorra(){
        console.log("Centrando")
        if(this.pinchZoom==undefined){return}
        this.pinchZoom.pinchZoom.moveX = -388
        this.pinchZoom.pinchZoom.moveY = -596
        this.pinchZoom.pinchZoom.scale = 1
        this.pinchZoom.pinchZoom.transformElement(1000);
        this.pinchZoom.pinchZoom.updateInitialValues();
    }
}





