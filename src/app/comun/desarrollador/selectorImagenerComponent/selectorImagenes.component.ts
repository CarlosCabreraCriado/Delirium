
import { Component , Input } from '@angular/core';

@Component({
  selector: 'selectorImagenesComponent',
  templateUrl: './selectorImagenes.component.html',
  styleUrls: ['./selectorImagenes.component.sass']
})

export class SelectorImagenesComponent {

	@Input() texto: string; 

	constructor() {}

}





