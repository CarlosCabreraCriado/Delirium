
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'panelGeneralComponent',
  templateUrl: './panel-general.component.html',
  styleUrls: ['./panel-general.component.sass']
})

export class PanelGeneralComponent {


	//Emision de eventos
	@Output() comandoPanelGeneral: EventEmitter<any> = new EventEmitter();

	constructor() {}
	
	cambiarPantalla(pantalla:string){
		this.comandoPanelGeneral.next(pantalla);
	}

}





