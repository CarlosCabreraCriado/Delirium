
import { Component , Input } from '@angular/core';

@Component({
  selector: 'barraComponent',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.sass']
})

export class BarraComponent {

	@Input() texto: string; 
	@Input() tipo: string; 

	constructor() {}

}





