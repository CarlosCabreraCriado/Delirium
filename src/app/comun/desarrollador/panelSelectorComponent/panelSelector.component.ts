
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
    @Input() indexSeleccionado: number= 0;

    @Input() botonAdd: boolean= false;
    @Input() botonEliminarRelacion: boolean= true;

    @Output() selector = new EventEmitter<Selector>();
    @Output() copiar = new EventEmitter<number>();
    @Output() addElementoEmitter = new EventEmitter<void>();

	constructor(public desarrolladorService: DesarrolladorService) {}

	async ngOnInit(){

    } //Fin OnInit

	renderListaSeleccionado(indiceRender:number,opcionEncadenado?:string){

        if(opcionEncadenado){
		switch(opcionEncadenado){
			case "animacionHechizo":
                var animacionId = this.desarrolladorService.animaciones.animaciones[indiceRender].id;
				if(this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex].animacion_id==animacionId){return "seleccionado"}
				break;

			case "animacionBuff":
                var animacionId = this.desarrolladorService.animaciones.animaciones[indiceRender].id;
				if(this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex].animacion_id==animacionId){return "seleccionado"}
				break;

		}
        }else{

            if(this.indexSeleccionado == indiceRender){return "seleccionado"}
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
        console.warn("SELECIONANDO",indexSeleccionado)
        var selector = {
            tipo: this.tipo,
            index: indexSeleccionado
        }
        this.indexSeleccionado = indexSeleccionado;
        this.selector.emit(selector)
    }

    addElemento(){
        this.addElementoEmitter.emit();
        this.indexSeleccionado = this.datos.length-1;
        //this.desarrolladorService.addDato()
    }

    clickAuxElemento(event:any,index: number){
        console.log("COPIANDO:",event)
        if(event.which === 3){
            this.copiar.emit(index);
        }
    }

}





