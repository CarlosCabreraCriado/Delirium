
import { Component , Input } from '@angular/core';

@Component({
  selector: 'experienciaComponent',
  templateUrl: './experiencia.component.html',
  styleUrls: ['./experiencia.component.sass']
})

export class ExperienciaComponent {

	@Input() texto: string; 

	constructor() {}

}





