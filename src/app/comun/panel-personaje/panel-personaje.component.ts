
import { Component , Input, OnInit } from '@angular/core';

@Component({
  selector: 'panelPersonajeComponent',
  templateUrl: './panel-personaje.component.html',
  styleUrls: ['./panel-personaje.component.sass']
})

export class PanelPersonaje implements OnInit {

	@Input() texto: string; 

	private pantalla = "General";

	public idImagenHechizo= [5,1,2,3,4,6];
	public imagenHechHorizontal= [0,0,0,0,0,0];
	public imagenHechVertical= [0,0,0,0,0,0];

	constructor() {}

	ngOnInit(){
		var indexHorizontal=0;
		var indexVertical= 0;

        for(var i=0; i< 5; i++){
          indexVertical= Math.floor(this.idImagenHechizo[i]/18);
          indexHorizontal= this.idImagenHechizo[i]-indexVertical*18;
          
          this.imagenHechHorizontal[i]= 0.4+5.84*indexHorizontal;
          this.imagenHechVertical[i]= 19.8*indexVertical;
        }
		return;
	}

	cambiarPantalla(pantalla:string){
		this.pantalla=pantalla;
		return;	
	}

	renderizarOpcionSeleccionada(pantalla:string){
		var clase = "";
		if(pantalla == this.pantalla){
			clase = "seleccionado"
		}
		return clase;
	}

}





