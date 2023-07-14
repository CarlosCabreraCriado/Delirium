
import { Component , Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'panelControlComponent',
  templateUrl: './panel-control.component.html',
  styleUrls: ['./panel-control.component.sass']
})

export class PanelControlComponent {

	@Input() tipo: string;
	@Input() habilitar:boolean = true;

	//Emision de eventos
	@Output() comandoPanelControl: EventEmitter<any> = new EventEmitter();

	private textoBotonCentral = "Iniciar Misión"
	private textoBotonLateralDerecho = "Mover"
	private textoBotonLateralIzquierdo = "Objeto"

	constructor() {}

	enviarComando(comando:string){
		if(this.tipo == "inMap"){
			switch(comando){
				case "centro":
					console.log("inMap")
					this.comandoPanelControl.next(comando);
				break;
			}
		}

		if(this.tipo == "mazmorra"){
			switch(comando){
				case "centro":
					this.comandoPanelControl.next(comando);
				break;
				case "derecha":
					this.comandoPanelControl.next('elegirHechizo')
				break;
				case "izquierda":
					this.comandoPanelControl.next('elegirMovimiento')
				break;
			}
		}
	}
}





