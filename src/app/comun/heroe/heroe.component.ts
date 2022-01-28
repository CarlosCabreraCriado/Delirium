
import { Component , Input } from '@angular/core';

@Component({
  selector: 'heroeComponent',
  templateUrl: './heroe.component.html',
  styleUrls: ['./heroe.component.sass']
})

export class HeroeComponent {

	@Input() Personaje: string; 
	@Input() tipo: string; 
	@Input() Roll: string; 
	@Input() Nivel: string; 
	@Input() Nombre: string; 
	@Input() lider: boolean; 
	@Input() idImagen: number; 
	@Input() renderHeroe: any; 


	constructor() {}

}





