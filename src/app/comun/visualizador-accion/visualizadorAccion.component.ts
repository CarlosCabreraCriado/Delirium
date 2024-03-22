
import { Component , Input } from '@angular/core';

@Component({
  selector: 'visualizadorAccionComponent',
  templateUrl: './visualizadorAccion.component.html',
  styleUrls: ['./visualizadorAccion.component.sass']
})

export class VisualizadorAccionComponent {

	@Input() texto: string; 

	constructor() {}

}





