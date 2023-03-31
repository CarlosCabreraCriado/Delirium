
import { Component , Input } from '@angular/core';
import { DesarrolladorService } from '../desarrollador.service';

@Component({
  selector: 'panelSelectorComponent',
  templateUrl: './panelSelector.component.html',
  styleUrls: ['./panelSelector.component.sass']
})

export class PanelSelectorComponent {

    @Input() datos: any= [];
    @Input() tipo: string= "Hechizos";
    @Input() titulo: string= "";
    @Input() lateral: string= "";

    @Input() botonAdd: boolean= false;
    @Input() botonEliminarRelacion: boolean= true;

	constructor(public desarrolladorService: DesarrolladorService) {}

	async ngOnInit(){

    } //Fin OnInit

	renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
		switch(opcionSeleccionado){
			case "hechizo":
				if(this.desarrolladorService.hechizoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "enemigo":
				if(this.desarrolladorService.enemigoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
		}
		return "";
	}
    renderClaseLateral(){
        if(this.lateral == "izquierda"){
            return "contenedorLateral izquierda"
        }else{
            if(this.lateral == "derecha"){
                return "contenedorLateral derecha"
            }else{
                return "contenedorLateral libre"
            }
        }
            
    }

    formatearNombre(nombre: string): string{
        return nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

}





