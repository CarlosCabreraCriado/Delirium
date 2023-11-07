

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger,state,style,animate,transition, keyframes } from '@angular/animations';

@Component({
  selector: 'appAnimacionEfecto',
  templateUrl: './animacion-efecto.component.html',
  styleUrls: ['./animacion-efecto.component.sass'],
  animations: [
    trigger('animacionEfecto', [
      // ...

      state('*', style({
        backgroundPosition: "-1000%",
        opacity: 0
      })),

      state('inicio', style({
        backgroundPosition: "-1000%",
        opacity: 0
      })),

      state('fin', style({
        backgroundPosition: "0%",
          opacity: 0
      })),


      transition('inicio => fin', [
        animate('{{tiempoEfectoParam}}s {{delayEfectoParam}}s steps({{stepsParam}})', keyframes([
                style({
            backgroundPosition: "{{stepsParam}}00%",
                        opacity: 1,
                        'background-size': "{{stepsParam}}00% 100%",
                      offset: 0
                }),
                style({
            backgroundPosition: "0%",
                        opacity: 1 ,
                        offset: 1,
                        'background-size': "{{stepsParam}}00% 100%"})
        ]))
      ],{params : { tiempoEfectoParam: "0", stepsParam: "1", hue: "0"}}),
    ]),
  ],
})

export class AnimacionEfectoComponent implements OnChanges, OnInit {

    private efectoSonido = new Audio();
    private flagLoop:boolean = true;
    public estadoAnimacion: string= null;

    public tiempoEfecto = 0;
    public stepsEfecto: string= "1";
    public hue: string= "0";
    public spriteId: string= "0";

    @Input() animacion: any;
    @Input() mostrarAnimacion: boolean;
    @Input() loop: any;
    @Input() mute: any;
    @Input() desarrollador: boolean = false;

  constructor() {
  }

  ngOnInit(){
      if(this.desarrollador){
          this.estadoAnimacion = "inicio";
      }
  }


  finAnimacion(indexSubanimacion:number): void{

    if(this.loop && this.estadoAnimacion=="fin"){
        if(this.flagLoop){
            this.flagLoop = false;
            setTimeout(()=>{
                if(!this.mute){
                    this.efectoSonidoPlay(this.animacion.sonidos[0]);
                }
                    this.estadoAnimacion = "inicio";
            }, this.tiempoEfecto*1000+2000);
        }
    }

  }

  inicioAnimacion(indexSubanimacion: number): void{

    //Determinar duracion total de la animacion:
    for(var i=0;i <this.animacion.subanimaciones.length; i++){
        if(this.animacion.subanimaciones[i].duracion>this.tiempoEfecto){
            this.tiempoEfecto = this.animacion.subanimaciones[i].duracion;
        }
    }

    if(this.estadoAnimacion=="inicio"){
        this.estadoAnimacion = "fin";
        this.flagLoop=true;
    }
  }

  renderIndividual(): any{
    var clase= "";

    //if(this.mazmorraService.getDispositivo()=="Movil"){
     // clase= clase+" Individual"
    //}

    return clase;
  }

  //Sonido Efecto:
    efectoSonidoPlay(sonido:any): void{
        this.efectoSonido.src = "./assets/sounds/"+sonido.id+"."+sonido.extension;
        this.efectoSonido.load();
        this.efectoSonido.volume= 1;
        this.efectoSonido.play();
    }

   ngOnChanges(changes: SimpleChanges) {

    if(((changes.mostrarAnimacion && changes.mostrarAnimacion?.firstChange == false) ||
        (changes.animacion && changes.animacion?.firstChange == false))
        && this.mostrarAnimacion == true){

        if(!this.mute){
            this.efectoSonidoPlay(this.animacion.sonidos[0]);
        }

        if(!this.loop){
            this.estadoAnimacion = "inicio";
        }

    }


  } //Final ngOnChanges

}


