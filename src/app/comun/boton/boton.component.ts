
import { Component , Input } from '@angular/core';

@Component({
  selector: 'botonComponent',
  templateUrl: './boton.component.html',
  styleUrls: ['./boton.component.sass']
})

export class BotonComponent {

	@Input() color: string; 
	@Input() texto: string; 

	constructor() {}

}





