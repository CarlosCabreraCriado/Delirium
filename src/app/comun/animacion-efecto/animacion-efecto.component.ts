

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger,state,style,animate,transition, keyframes } from '@angular/animations';

@Component({
  selector: 'appAnimacionEfecto',
  templateUrl: './animacion-efecto.component.html',
  styleUrls: ['./animacion-efecto.component.sass'],
  animations: [
    trigger('animacionEfecto', [
      // ...
      state('inicio', style({
      	backgroundPositionX: "-1000%",
       	opacity: 1
      })),

      state('fin', style({
      	backgroundPositionX: "0%",
    	opacity: 0
      })),

      transition('* => *', [
        animate('{{tiempoEfectoParam}}s steps({{stepsParam}})', keyframes([
    			style({ backgroundPositionX: "-{{stepsParam}}00%",opacity: 1 , 'background-size': "{{stepsParam}}00% 100%", offset: 0}),
    			style({ backgroundPositionX: "0%", offset: 1, 'background-size': "{{stepsParam}}00% 100%"})
  		]))
      ],{params : { tiempoEfectoParam: "0.44", stepsParam: "9"}}),
    ]),
  ],
})

export class AnimacionEfectoComponent implements OnInit, OnChanges {

	private efectoSonido = new Audio();
	private flagLoop:boolean = true;
	public estadoAnimacion: string= "inicio";

	public tiempoEfecto = 0.44;
	public stepsEfecto: string= "5";
	public hue: string= "0";
	public spriteId: string= "0";

	@Input() animacion: any;
	@Input() loop: any;

  constructor() { }

  ngOnInit() {

  	//Inicio suscripcion evento progreso Carga
    //	this.mazmorraService.mostrarAnimacionNumero.subscribe(val => {
    // 		this.mostrarAnimacion= true;
    //	});

	console.log(this.animacion)
  }

  finAnimacion(): void{

	if(this.loop && this.estadoAnimacion=="fin"){
		if(this.flagLoop){
			this.flagLoop = false;
			setTimeout(()=>{  
					this.estadoAnimacion = "inicio";
			}, this.tiempoEfecto*1000+1000);	
		}
	}

  }

  inicioAnimacion(indexSubanimacion: number): void{
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
	efectoSonidoPlay(sonido_id:string,formato:string): void{
  		this.efectoSonido.src = "./assets/sounds/"+sonido_id+"."+formato;
  		this.efectoSonido.load();
  		this.efectoSonido.play();
  		this.efectoSonido.volume= 1;
		}

   ngOnChanges(changes: SimpleChanges) {

    if(changes.animacion){ 

      // Detectar cambio animacion:
        //this.efectoSonidoPlay(this.animaciones["animaciones"].find(i => i.id == changes.idAnimacion.currentValue).sonido_nombre);
        //this.tiempoEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).animacion_tiempo;
        //this.stepsEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).num_frames;
        //this.nombreEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).sprite_nombre;
        //this.mostrarAnimacion= true;

       //this.efectoSonidoPlay(this.animacion.sonido_id);
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].hue_filter!=null){this.hue = this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].hue_filter;}
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].duracion!=null){this.tiempoEfecto = this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].duracion;}
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].num_frames!=null){this.stepsEfecto = this.animacion.subanimacion[this.desarrolladorService.sub].num_frames;}
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].sprite_id!=null){this.spriteId = this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].sprite_id;}

		if(!this.loop){
			this.estadoAnimacion = "inicio";
		}
    }


  } //Final ngOnChanges

}


