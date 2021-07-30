
import { Component , Input  } from '@angular/core';

@Component({
  selector: 'panelMazmorraComponent',
  templateUrl: './panel-mazmorra.component.html',
  styleUrls: ['./panel-mazmorra.component.sass']
})

export class PanelMazmorraComponent {

	@Input() texto: string; 

	constructor() {}


}





