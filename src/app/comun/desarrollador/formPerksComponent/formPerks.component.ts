
import { Component , Input } from '@angular/core';

@Component({
  selector: 'formPerksComponent',
  templateUrl: './formPerks.component.html',
  styleUrls: ['./formPerks.component.sass']
})

export class FormPerksComponent {

	@Input() texto: string; 

	constructor() {}

}





