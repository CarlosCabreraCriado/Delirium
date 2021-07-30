
import { Component , Input } from '@angular/core';

@Component({
  selector: 'creditoComponent',
  templateUrl: './credito.component.html',
  styleUrls: ['./credito.component.sass']
})

export class CreditoComponent {

	@Input() gemas: number; 
	@Input() monedas: number; 

	constructor() {}

}





