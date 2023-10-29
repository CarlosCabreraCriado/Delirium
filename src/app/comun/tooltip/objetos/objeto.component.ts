
import { Component, Input, OnInit } from '@angular/core';
import { BotonComponent } from '../../boton/boton.component';

@Component({
  selector: 'tooltipObjeto',
  templateUrl: './objeto.component.html',
  styleUrls: ['./objeto.component.sass']
})

export class TooltipObjetoComponent {

  constructor() {}

  public styleTop: string = "auto";
  public styleBottom: string = "auto";
  public styleLeft: string = "auto";
  public styleRight: string = "auto";

  @Input() tooltipTextoBoton = null;
  @Input() left = 0;
  @Input() top = 0;
  @Input() bottom = 0;
  @Input() right = 0;
  @Input() posicion: "top"|"bottom"|"left"|"right" = "top";
  @Input() objeto: any;

  ngOnInit(){
      console.log("Iniciando")
      console.log(this.objeto)

      this.styleTop = "auto"
      this.styleBottom = "auto"
      this.styleLeft = "auto"
      this.styleRight = "auto"

      switch(this.posicion){
          case "top":
              this.styleBottom = "calc(100vh - "+(this.top-10)+"px)"; 
              this.styleLeft = ((this.right-this.left)/2+this.left) + "px"; 
              break;

          case "bottom":
              this.styleTop = this.bottom+"px"; 
              this.styleLeft = ((this.right-this.left)/2+this.left) + "px"; 
              break;

          case "left":
              this.styleRight = "calc(100vw - "+(this.left-10)+"px)"; 
              this.styleTop = ((this.top-this.bottom)/2+this.bottom)+"px"; 
              break;

          case "right":
              this.styleLeft = (this.right+10)+"px"; 
              this.styleTop = ((this.top-this.bottom)/2+this.bottom)+"px"; 
              break;
      }
  }

}






