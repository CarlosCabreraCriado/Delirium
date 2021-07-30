
import { Component , Input } from '@angular/core';

@Component({
  selector: 'estadisticasGeneralComponent',
  templateUrl: './estadisticas-general.html',
  styleUrls: ['./estadisticas-general.component.sass']
})

export class EstadisticasGeneralComponent {

	@Input() tipo: string; 
	@Input() valor: string; 

	constructor() {}

	renderizarIcono(){
	
		var path = "../../../assets/Iconos/Icono-Armadura.png"

		switch(this.tipo){
			case "Armadura":
				path = "../../../assets/Iconos/Icono-Armadura.png"
				break;
			case "Vitalidad":
				path = "../../../assets/Iconos/Icono-Vitalidad.png"
				break;
			case "Curación":
				path = "../../../assets/Iconos/Icono-Curacion.png"
				break;
			case "Daño Físico":
				path = "../../../assets/Iconos/Icono-Dano-Fisico.png"
				break;
			case "Daño Mágico":
				path = "../../../assets/Iconos/Icono-Dano-Magico.png"
				break;
			case "Energía":
				path = "../../../assets/Iconos/Icono-Energia-Stat.png"
				break;
		}	

		return path
	}

	renderizarBarra(){
		var clase = {}
		var color = "";

		switch(this.tipo){
			case "Armadura":
				color = "blue";
				break;
			case "Vitalidad":
				color = "green";
				break;
			case "Curación":
				color = "palegreen";
				break;
			case "Daño Físico":
				color = "red";
				break;
			case "Daño Mágico":
				color = "purple";
				break;
			case "Energía":
				color = "yellow";
				break;
		}	

		clase = {"width": this.valor+"%", "background-color": color}

		return clase;
	}

}





