
import { Component , Input } from '@angular/core';
import { DesarrolladorService } from '../desarrollador.service';
import { Output, EventEmitter } from '@angular/core';

type Selector = {
    tipo: string,
    index: number
}

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

    @Output() selector = new EventEmitter<Selector>();
    @Output() addElementoEmitter = new EventEmitter<void>();

    private indexSeleccionado = 0;

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
			case "trigger":
				if(this.indexSeleccionado==indiceSeleccionado){return "seleccionado"}
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

    seleccionarElemento(indexSeleccionado: number){
        var selector = {
            tipo: this.tipo,
            index: indexSeleccionado
        }
        this.indexSeleccionado = indexSeleccionado;
        this.selector.emit(selector)
    }

    addElemento(){
        if(this.tipo=="Triggers"){
            this.addElementoEmitter.emit();
            this.indexSeleccionado = this.datos.length-1;
        }else{
            this.desarrolladorService.addDato()
        }
    }

}





