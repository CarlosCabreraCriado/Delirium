
import { Component , Input  } from '@angular/core';

@Component({
  selector: 'panelDiarioComponent',
  templateUrl: './panel-diario.component.html',
  styleUrls: ['./panel-diario.component.sass']
})

export class PanelDiarioComponent {

	@Input() texto: string; 

	constructor() {}


}





