
import { Component , Input  } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'panelUbicacionComponent',
  templateUrl: './panel-ubicacion.component.html',
  styleUrls: ['./panel-ubicacion.component.sass']
})

export class PanelUbicacionComponent {

	@Input() sesion: any; 

	constructor(private appService: AppService) {}


}





