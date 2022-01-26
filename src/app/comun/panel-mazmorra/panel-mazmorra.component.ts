
import { Component , Input  } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'panelMazmorraComponent',
  templateUrl: './panel-mazmorra.component.html',
  styleUrls: ['./panel-mazmorra.component.sass']
})

export class PanelMazmorraComponent {

	@Input() texto: string; 

	constructor(private appService: AppService) {}


}





