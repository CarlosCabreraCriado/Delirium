
import { Component , Input  } from '@angular/core';

@Component({
  selector: 'panelEquipoComponent',
  templateUrl: './panel-equipo.component.html',
  styleUrls: ['./panel-equipo.component.sass']
})

export class PanelEquipoComponent {

	@Input() texto: string; 

	private zindexBolsa: number= 20
	private zindexBanco: number= 10

	constructor() {}

	cambiarPestanaInventario(tipoInventario:string){
		if(tipoInventario == "Bolsa"){
		   this.zindexBanco= 10
		   this.zindexBolsa= 20
		}	
		if(tipoInventario == "Banco"){
		   this.zindexBanco= 20
		   this.zindexBolsa= 10
		}	
	}

}





