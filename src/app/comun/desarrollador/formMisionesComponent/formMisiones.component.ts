
import { Component , Input } from '@angular/core';

@Component({
  selector: 'formMisionesComponent',
  templateUrl: './formMisiones.component.html',
  styleUrls: ['./formMisiones.component.sass']
})

export class FormMisionesComponent {

	@Input() texto: string; 

	constructor() {}

}





