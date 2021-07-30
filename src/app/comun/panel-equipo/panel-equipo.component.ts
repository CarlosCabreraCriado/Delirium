
import { Component , Input  } from '@angular/core';

@Component({
  selector: 'panelEquipoComponent',
  templateUrl: './panel-equipo.component.html',
  styleUrls: ['./panel-equipo.component.sass']
})

export class PanelEquipoComponent {

	@Input() texto: string; 

	constructor() {}


}





