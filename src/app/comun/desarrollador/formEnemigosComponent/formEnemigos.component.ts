
import { Component , Input } from '@angular/core';

@Component({
  selector: 'formEnemigosComponent',
  templateUrl: './formEnemigos.component.html',
  styleUrls: ['./formEnemigos.component.sass']
})

export class FormEnemigosComponent {

	@Input() texto: string; 

	constructor() {}

}





