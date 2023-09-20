
import { Component , Input } from '@angular/core';

@Component({
  selector: 'plantillaComponent',
  templateUrl: './platilla.component.html',
  styleUrls: ['./platilla.component.sass']
})

export class PlantillaComponent {

	@Input() texto: string; 

	constructor() {}

}





