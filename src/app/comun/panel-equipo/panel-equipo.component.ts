
import { Component , Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { LogicService } from '../../logic.service';
import {
  CdkDragDrop,
  CdkDragEnter,
  CdkDragMove,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

interface Estadisticas {
   armadura: number,
   resistenciaMagica: number,
   vitalidad: number,
   ad: number,
   ap: number,
   critico: number
}

@Component({
    selector: 'panelEquipoComponent',
    templateUrl: './panel-equipo.component.html',
    styleUrls: ['./panel-equipo.component.sass'],
    //changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PanelEquipoComponent {

    @ViewChild('dropListContainer') dropListContainer?: ElementRef;

    public inventario = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    public sesion: any = null;
    public perfil: any = null;
    public estadoApp: any;
    public equipado: any = [null,null,null,null,null,null];
    public pathImagenEquipado: string[] = ["","","","","",""];
    public estadisticas: Estadisticas = {
       armadura: 0,
       resistenciaMagica: 0,
       vitalidad: 0,
       ad: 0,
       ap: 0,
       critico: 0
    };

    constructor(private cdr: ChangeDetectorRef, private appService: AppService, private logicService: LogicService) {}

    //DRAG AND DROP:
    dropListReceiverElement?: HTMLElement;

    dragDropInfo?: {
        dragIndex: number;
        dropIndex: number;
    };

    async ngOnInit(){
        this.sesion= await this.appService.getSesion();

        this.perfil= await this.appService.getPerfil();
		this.estadoApp= await this.appService.getEstadoApp();

        this.checkItemsEquipados();
        this.estadisticas = this.logicService.calcularEstadisticasBaseHeroe(this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex]);

        this.cdr.detectChanges();
    }

    ngOnDestroy(){
        console.warn("Cerrando Panel Equipo...")
        this.appService.setPerfil(this.perfil);
        this.appService.checkSincPerfil();
    }


    checkItemsEquipados(){

        // [Casco, Pechera, Pantalón, Botas, Mano 1, Mano 2]   
        var checkObjetosEquipados = [null,null,null,null,null,null]; 
        var objetosEquipados = this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.equipado;
        var objetosDescartados = [];

      console.warn("Objetos Equipados",objetosEquipados)

        for(var i = 0; i < objetosEquipados.length; i++){
            if(objetosEquipados[i]==null){continue}
            switch(objetosEquipados[i].pieza){
                case "Casco":
                    if(checkObjetosEquipados[0]!=null){objetosDescartados.push(checkObjetosEquipados[0])}
                    checkObjetosEquipados[0]= objetosEquipados[i];
                    break;
                case "Pechera":
                    if(checkObjetosEquipados[1]!=null){objetosDescartados.push(checkObjetosEquipados[1])}
                    checkObjetosEquipados[1]= objetosEquipados[i];
                    break;
                case "Pantalón":
                    if(checkObjetosEquipados[2]!=null){objetosDescartados.push(checkObjetosEquipados[2])}
                    checkObjetosEquipados[2]= objetosEquipados[i];
                    break;
                case "Botas":
                    if(checkObjetosEquipados[3]!=null){objetosDescartados.push(checkObjetosEquipados[3])}
                    checkObjetosEquipados[3]= objetosEquipados[i];
                    break;
                case "Escudo":
                    if(checkObjetosEquipados[4]?.tipo != "Arma dos manos"){
                        if(checkObjetosEquipados[5]!=null){objetosDescartados.push(checkObjetosEquipados[5])}
                        checkObjetosEquipados[5]= objetosEquipados[i];
                    }else{
                        objetosDescartados.push(checkObjetosEquipados[4]);
                        checkObjetosEquipados[4]= null;
                        checkObjetosEquipados[5]= objetosEquipados[i];
                    }
                    break;

                case "Arco":
                case "Báculo":
                case "Lanza":

                    //Descarta arma secundaria:
                    if(checkObjetosEquipados[5] != null){
                        objetosDescartados.push(checkObjetosEquipados[5]);
                        checkObjetosEquipados[5] = null;
                    }

                    //Descarta arma principal:
                    if(checkObjetosEquipados[4] != null){
                        objetosDescartados.push(checkObjetosEquipados[4]);
                        checkObjetosEquipados[4] = null;
                    }

                    //Equipa el arma de dos manos
                    checkObjetosEquipados[4] = objetosEquipados[i];
                    break;

                case "Daga":
                case "Espada":
                case "Hacha":

                    //ARMA DE UNA MANO:
                    if(objetosEquipados[i]?.tipo == "Arma una mano"){
                        //Si el arma es de una mano
                        if(checkObjetosEquipados[4] == null){
                            if(checkObjetosEquipados[4]!=null){objetosDescartados.push(checkObjetosEquipados[4])}
                            checkObjetosEquipados[4]= objetosEquipados[i];

                        }else if(checkObjetosEquipados[5] == null && checkObjetosEquipados[4].tipo != "Arma dos manos"){
                            if(checkObjetosEquipados[5]!=null){objetosDescartados.push(checkObjetosEquipados[5])}
                            checkObjetosEquipados[5]= objetosEquipados[i];
                        }else{
                            objetosDescartados.push(checkObjetosEquipados[4]);
                            checkObjetosEquipados[4]= objetosEquipados[i];
                        }
                    }

                    //ARMA DE DOS MANOS:
                    if(objetosEquipados[i]?.tipo == "Arma dos manos"){

                        //Descarta arma secundaria:
                        if(checkObjetosEquipados[5] != null){
                            objetosDescartados.push(checkObjetosEquipados[5]);
                            checkObjetosEquipados[5] = null;
                        }

                        //Descarta arma principal:
                        if(checkObjetosEquipados[4] != null){
                            objetosDescartados.push(checkObjetosEquipados[4]);
                            checkObjetosEquipados[4] = null;
                        }

                        //Equipa el arma de dos manos
                        checkObjetosEquipados[4] = objetosEquipados[i];
                    }
                    break;
            }
        }

        //Asignando objetos Equipados:
        this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.equipado= checkObjetosEquipados;
        this.equipado = checkObjetosEquipados;

        //Asignar PATH de imagenes:
        for(var i = 0; i < this.equipado.length; i++){
            if(this.equipado[i] == null){continue;}
            this.pathImagenEquipado[i] = ""+this.formatearNombre(this.equipado[i].pieza)+"/"+this.equipado[i].imagen_id+".png"
        }

        //Detectar Objetos no validos y devolver al inventario:
        for(var j = 0; j < objetosDescartados.length; j++){
            console.warn("OBJETO DESCARTADO: ", objetosDescartados[j])
            this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario.push(objetosDescartados[j])
        }

        //Recalcular estadisticas: 
        this.estadisticas = this.logicService.calcularEstadisticasBaseHeroe(this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex]);

    }

  dragEntered(event: CdkDragEnter<number>) {

    if(event.container.id == "containerEliminar"){
        return;
    }

    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    if(dragIndex == dropIndex){return};
    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {

      phContainer.removeChild(phElement);
      phContainer.parentElement?.insertBefore(phElement, phContainer);

      moveItemInArray(this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario, dragIndex, dropIndex);
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

    if(event.container.id == "containerEliminar"){
        this.eliminarObjeto(event.item.data);
        return;
    }

    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

  formatearNombre(nombre: string): string{
    var nombreNuevo = nombre
    return nombreNuevo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  desequipar(indexObjetoEquipado){
      var objetoDesequipado = this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.equipado[indexObjetoEquipado];

      this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.equipado[indexObjetoEquipado] = null;

      this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario.push(objetoDesequipado);
      this.checkItemsEquipados();
  }

  equipar(indexInventarioEquipar){
      var objetoEquipar = this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario[indexInventarioEquipar]
      this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.equipado.push(objetoEquipar);
      this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario.splice(indexInventarioEquipar,1);
      this.checkItemsEquipados();
  }

  eliminarObjeto(indexObjetoEliminar){
        const dialogoEliminarObjeto = this.appService.mostrarDialogo("Confirmacion",{titulo: "¿Seguro que quieres eliminar este objeto?",contenido: "Esta acción no se puede deshacer.", deshabilitado: false});

        dialogoEliminarObjeto.afterClosed().subscribe(async (result) => {
          console.log(result);
          if(result){
              console.error("Eliminando Objeto: ",indexObjetoEliminar);
              this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].objetos.inventario.splice(indexObjetoEliminar,1);
          }
        })


  }


}





