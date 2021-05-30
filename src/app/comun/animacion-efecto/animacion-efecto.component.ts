

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger,state,style,animate,transition, keyframes } from '@angular/animations';
import { DeveloperCombateService } from '../developer-combate/developerCombate.service'

@Component({
  selector: 'appAnimacionEfecto',
  templateUrl: './animacion-efecto.component.html',
  styleUrls: ['./animacion-efecto.component.sass'],
  animations: [
    trigger('animacionEfecto', [
      // ...
      state('inicio', style({
      	backgroundPositionX: "-500%",
       	opacity: 0
      })),

      state('fin', style({
      	backgroundPositionX: "0%",
    	opacity: 0
      })),

      transition('* => true', [
        animate('{{tiempoEfectoParam}}s steps({{stepsParam}})', keyframes([
    			style({ backgroundPositionX: "-{{stepsParam}}00%",opacity: 1 , offset: 0}),
    			style({ backgroundPositionX: "0%", offset: 1})
  		]))
      ],{params : { tiempoEfectoParam: "0.44", stepsParam: "5"}}),
    ]),
  ],
})

export class AnimacionEfectoComponent implements OnInit, OnChanges {

	public mostrarAnimacion: boolean= false;
	private idAnimacion: number= 0;
	private colorNumero: string= "red";
	private efectoSonido = new Audio();
	public nombreEfecto: string= "Basico2";
	private nombreSonido: string= "Basico2.mp3"
	public tiempoEfecto: string= "0.44";
	public stepsEfecto: string= "5";
    private animaciones: any;

	@Input() enemigo: any;
    @Input() enemigoAnimacion = 0;
	@Input() heroe: any;
    @Input() heroeAnimacion = 0;

  constructor(private developerCombateService: DeveloperCombateService) { }

  ngOnInit() {
  	//Inicio suscripcion evento progreso Carga
    	this.developerCombateService.mostrarAnimacionNumero.subscribe(val => {
      		this.mostrarAnimacion= true;
    	});
      this.animaciones = this.developerCombateService.animaciones;
  }

  resetAnimacionNumero(): void{
  	this.mostrarAnimacion = false;
    if(this.enemigo){
      this.enemigo.animacion=0;
    }
    if(this.heroe){
      this.heroe.animacion=0;
    }
  }

  renderIndividual(): any{
    var clase= "";

    if(this.developerCombateService.getDispositivo()=="Movil"){
      clase= clase+" Individual"
    }
    return clase;
  }

  //Sonido Efecto:
	efectoSonidoPlay(nombreSonido:string): void{
  		this.efectoSonido.src = "./assets/sounds/"+nombreSonido;
  		this.efectoSonido.load();
  		this.efectoSonido.play();
  		this.efectoSonido.volume= 1;
		}

   ngOnChanges(changes: SimpleChanges) {

    //Procesar si es enemigo:
    if(changes.enemigoAnimacion){ 
      // Detectar cambio animacion:
      if((changes.enemigoAnimacion.currentValue!=0) && ((changes.enemigoAnimacion.previousValue==0) /* || (changes.enemigoAnimacion.previousValue==undefined)*/)){
       
        this.efectoSonidoPlay(this.animaciones.animaciones.find(i => i.id == changes.enemigoAnimacion.currentValue).sonido_nombre);
        this.tiempoEfecto = this.animaciones.animaciones.find(i => i.id == changes.enemigoAnimacion.currentValue).animacion_tiempo;
        this.stepsEfecto = this.animaciones.animaciones.find(i => i.id == changes.enemigoAnimacion.currentValue).num_frames;
        this.nombreEfecto = this.animaciones.animaciones.find(i => i.id == changes.enemigoAnimacion.currentValue).sprite_nombre;
        this.mostrarAnimacion= true;
      }
    }
    
    //Procesar si es heroe:
    if(changes.heroeAnimacion){
       // Detectar cambio animacion:
      if((changes.heroeAnimacion.currentValue!=0) && (changes.heroeAnimacion.previousValue==0)){
       
        this.efectoSonidoPlay(this.animaciones.animaciones.find(i => i.id == changes.heroeAnimacion.currentValue).sonido_nombre);
        this.tiempoEfecto = this.animaciones.animaciones.find(i => i.id == changes.heroeAnimacion.currentValue).animacion_tiempo;
        this.stepsEfecto = this.animaciones.animaciones.find(i => i.id == changes.heroeAnimacion.currentValue).num_frames;
        this.nombreEfecto = this.animaciones.animaciones.find(i => i.id == changes.heroeAnimacion.currentValue).sprite_nombre;
        this.mostrarAnimacion= true;
      }
    }

  } //Final ngOnChanges

}


