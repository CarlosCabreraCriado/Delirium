
import { Component , Input  } from '@angular/core';

@Component({
  selector: 'panelTiendaComponent',
  templateUrl: './panel-tienda.component.html',
  styleUrls: ['./panel-tienda.component.sass']
})

export class PanelTiendaComponent {

	@Input() texto: string; 

	constructor() {}


}





