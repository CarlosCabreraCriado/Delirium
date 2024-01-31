
import { Component , Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'panelControlComponent',
  templateUrl: './panel-control.component.html',
  styleUrls: ['./panel-control.component.sass']
})

export class PanelControlComponent {

  @Input() tipo: string;
  @Input() vida: number;
  @Input() energia: number;
  @Input() energiaFutura: number;
  @Input() turno: boolean = true;
  @Input() habilitar:boolean = true;
  @Input() movimientoRestante:number = 0;
  @Input() mensajeControl:string = "";
  @Input() orientacion:string = "vertical";

  //Emision de eventos
  @Output() comandoPanelControl: EventEmitter<any> = new EventEmitter();

  constructor() {}

  enviarComando(comando:string){
    if(this.tipo == "inMap"){
      switch(comando){
        case "centro":
          if(this.turno || this.habilitar){
            this.comandoPanelControl.next(comando);
          }
        break;
      }
    }

    if(this.tipo == "mazmorra"){
      switch(comando){

        case "centro":
          if(this.turno || this.habilitar){
            this.comandoPanelControl.next(comando);
          }
        break;

        case "derecha":
          if(this.turno || this.habilitar){
            this.comandoPanelControl.next('elegirHechizo')
          }
        break;

        case "izquierda":
          if(this.turno || this.habilitar){
            this.comandoPanelControl.next('elegirMovimiento')
          }
        break;

      }
    }
  }
}





