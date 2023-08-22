

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

export class AnimacionEfectoComponent implements OnInit, OnChanges {

	private efectoSonido = new Audio();
	private flagLoop:boolean = true;
	public estadoAnimacion: string= "inicio";

	public tiempoEfecto = 0;
	public stepsEfecto: string= "1";
	public hue: string= "0";
	public spriteId: string= "0";

	@Input() animacion: any;
	@Input() loop: any;
	@Input() mute: any;

  constructor() { }

  ngOnInit() {

  	//Inicio suscripcion evento progreso Carga
    //	this.mazmorraService.mostrarAnimacionNumero.subscribe(val => {
    // 		this.mostrarAnimacion= true;
    //	});

    if(!this.mute){
        this.efectoSonidoPlay(this.animacion.sonidos[0]);
    }

	console.log(this.animacion)

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
  		this.efectoSonido.play();
  		this.efectoSonido.volume= 1;
		}

   ngOnChanges(changes: SimpleChanges) {

	   console.log("CAMBIO ANIMACION")
	   console.log(changes)

    if(changes.animacion){

      // Detectar cambio animacion:
        //this.efectoSonidoPlay(this.animaciones["animaciones"].find(i => i.id == changes.idAnimacion.currentValue).sonido_nombre);
        //this.tiempoEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).animacion_tiempo;
        //this.stepsEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).num_frames;
        //this.nombreEfecto = this.animaciones.animaciones.find(i => i.id == changes.idAnimacion.currentValue).sprite_nombre;
        //this.mostrarAnimacion= true;

       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].hue_filter!=null){this.hue = this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].hue_filter;}
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].duracion!=null){this.tiempoEfecto = this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].duracion;}
       //if(this.animacion.subanimacion[this.desarrolladorService.subanimacionSeleccionadoIndex].num_frames!=null){this.stepsEfecto = this.animacion.subanimacion[this.desarrolladorService.sub].num_frames;}
       //if(this.animacion.subanimacion[this.indexSubanimacion].sprite_id!=null){this.spriteId = this.animacion.subanimacion[this.indexSubanimacion].sprite_id;}

       console.log("EJECUTANDO ANIMACION")
		if(!this.loop){
			this.estadoAnimacion = "inicio";
		}

    }


  } //Final ngOnChanges

}


