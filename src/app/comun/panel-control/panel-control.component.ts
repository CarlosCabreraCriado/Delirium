
import { Component , Input } from '@angular/core';
import { InMapService } from '../inmap/inmap.service';

@Component({
  selector: 'panelControlComponent',
  templateUrl: './panel-control.component.html',
  styleUrls: ['./panel-control.component.sass']
})

export class PanelControlComponent {

	@Input() texto: string; 

	private textoBotonCentral = "Iniciar Misión"
	private textoBotonLateralDerecho = "Mover"
	private textoBotonLateralIzquierdo = "Objeto"

	constructor(private inmapService: InMapService) {}

}





