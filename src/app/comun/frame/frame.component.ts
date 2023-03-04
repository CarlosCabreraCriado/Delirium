
import { Component , Input } from '@angular/core';

@Component({
  selector: 'frameComponent',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.sass']
})


export class FrameComponent {

	@Input() ancho: string = "70px"; 
	@Input() tipoFrame: number = 1; 
	@Input() tipoFondo: "negro" | "papiro" = "negro"; 

	constructor() {}

}





