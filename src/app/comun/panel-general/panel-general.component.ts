
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'panelGeneralComponent',
  templateUrl: './panel-general.component.html',
  styleUrls: ['./panel-general.component.sass']
})

export class PanelGeneralComponent {


	//Emision de eventos
	@Output() comandoPanelGeneral: EventEmitter<any> = new EventEmitter();
  public desplegado: boolean = false;

	constructor() {}

    public pantalla = null;

	cambiarPantalla(pantalla:string){
        if(this.pantalla==pantalla){
            this.pantalla = null
        }else{
            this.pantalla = pantalla;
        }
		this.comandoPanelGeneral.next(pantalla);
	}

  toggleDesplegado(){
    this.desplegado = !this.desplegado;
    if(this.desplegado){
		  this.comandoPanelGeneral.next("desplegado");
    }else{
		  this.comandoPanelGeneral.next("replegado");
    }
  }

}





