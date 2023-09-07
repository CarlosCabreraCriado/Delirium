
import { Component , Input } from '@angular/core';

@Component({
  selector: 'detalleHechizoComponent',
  templateUrl: './detalle-hechizo.component.html',
  styleUrls: ['./detalle-hechizo.component.sass']
})

export class DetalleHechizoComponent {

	@Input() texto: string; 

	constructor() {}

}





