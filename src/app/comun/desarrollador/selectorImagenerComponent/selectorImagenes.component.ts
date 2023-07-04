
import { Component , Input } from '@angular/core';
import { DesarrolladorService } from '../desarrollador.service';

@Component({
  selector: 'selectorImagenesComponent',
  templateUrl: './selectorImagenes.component.html',
  styleUrls: ['./selectorImagenes.component.sass']
})

export class SelectorImagenesComponent {

	@Input() texto: string; 

	constructor(public desarrolladorService: DesarrolladorService) {}

}





