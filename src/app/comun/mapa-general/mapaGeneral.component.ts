
import { Component , Input, ViewChild, ElementRef} from '@angular/core';
import { MapaGeneralService } from './mapaGeneral.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'mapaGeneralComponent',
  templateUrl: './mapaGeneral.component.html',
  styleUrls: ['./mapaGeneral.component.sass']
})

export class MapaGeneralComponent {

	@Input() texto: string; 

  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;

	constructor(public appService: AppService, public mapaGeneralService: MapaGeneralService) {}

}





