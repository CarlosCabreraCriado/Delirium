
import { Component , Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import {
  CdkDragDrop,
  CdkDragEnter,
  CdkDragMove,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'panelEquipoComponent',
    templateUrl: './panel-equipo.component.html',
    styleUrls: ['./panel-equipo.component.sass']
})

export class PanelEquipoComponent {

    inventario = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    @ViewChild('dropListContainer') dropListContainer?: ElementRef;
    @Input() texto: string; 

    public zindexBolsa: number= 20
    public zindexBanco: number= 10

	public heroeSeleccionado : any = null;
    public sesion: any;
    public indexHeroeSesion: number;

    constructor(private appService: AppService) {}

    //DRAG AND DROP:
    dropListReceiverElement?: HTMLElement;

    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };


	async ngOnInit(){

		console.log("Importando Datos de AppService... ")
		this.sesion= await this.appService.getSesion();
		this.heroeSeleccionado= await this.appService.getHeroeSeleccionado();

        this.indexHeroeSesion = this.sesion.render.heroes.findIndex(i => i.nombre == this.heroeSeleccionado.personaje) 

    }

dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {
      phContainer.removeChild(phElement);
      phContainer.parentElement?.insertBefore(phElement, phContainer);

      moveItemInArray(this.inventario, dragIndex, dropIndex);
    }
  }

dragMoved(event: CdkDragMove<number>) {
    if (!this.dropListContainer || !this.dragDropInfo) return;

    const placeholderElement =
      this.dropListContainer.nativeElement.querySelector(
        '.cdk-drag-placeholder'
      );

    const receiverElement =
      this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;

    if (!receiverElement) {
      return;
    }

    receiverElement.style.display = 'none';
    this.dropListReceiverElement = receiverElement;
  }

  dragDropped(event: CdkDragDrop<number>) {
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }


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





