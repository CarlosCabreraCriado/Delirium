
import { Component , Input } from '@angular/core';

@Component({
  selector: 'checkboxComponent',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.sass']
})

export class CheckboxComponent {

	@Input() color: string; 
	@Input() tipo: number = 1; 
	@Input() seleccionado: boolean = false; 

	constructor() {}

}





