
import { Component , Input } from '@angular/core';

@Component({
  selector: 'atributoComponent',
  templateUrl: './atributo.component.html',
  styleUrls: ['./atributo.component.sass']
})

export class AtributoComponent {

	@Input() tipo: string = "alcance"; 
	@Input() valor: number = 0; 

	constructor() {}

}





