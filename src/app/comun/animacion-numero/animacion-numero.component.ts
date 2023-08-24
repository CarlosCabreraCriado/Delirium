
import { Component, ChangeDetectionStrategy, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {trigger,state,style,animate,transition, keyframes} from '@angular/animations';
import {MazmorraService} from '../mazmorra/mazmorra.service';

@Component({
  selector: 'appAnimacionNumero',
  templateUrl: './animacion-numero.component.html',
  styleUrls: ['./animacion-numero.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animacionNumero', [
      // ...
      state('inicio', style({
      	top: "0%",
        opacity: 1
      })),

      state('fin', style({
      	top: "0%",
    	opacity: 0
      })),

      transition('inicio => fin', [
        animate('2.5s', keyframes([
    			style({ opacity: 0 ,top: "0%", offset: 0}),
    			style({ opacity: 1 ,top: "0%", offset: 0.2}),
    			style({ opacity: 1 ,top: "0%", offset: 0.8}),
    			style({ opacity: 0 ,top: "0%", offset: 1})
  		]))
      ]),


    ]),
  ],
})

export class AnimacionNumeroComponent implements OnInit, OnChanges {

  public mostrarAnimacion: boolean= false;
	public numeroAnimacion: number= 0;
	public colorNumero: string= "red";

	 @Input() enemigo: any;
	 @Input() enemigoIndex: number;
	 @Input() enemigoVida: any;
	 @Input() heroe: any;
	 @Input() heroeIndex: number;
	 @Input() heroeVida: any;

  constructor(private mazmorraService: MazmorraService) { }

  ngOnInit() {
  	//Inicio suscripcion evento progreso Carga
    	this.mazmorraService.mostrarAnimacionNumero.subscribe(val => {
      		this.mostrarAnimacion= true;
    	});
  }

   ngOnChanges(changes: SimpleChanges) {

    // Detectar cambio en vida:
    if(changes.enemigoVida){
    	//si se ha dañado al enemigo:
    	if(changes.enemigoVida.currentValue <changes.enemigoVida.previousValue){
    		this.numeroAnimacion= Math.round((changes.enemigoVida.previousValue-changes.enemigoVida.currentValue)*10)/10;
    		this.colorNumero="red";
    		this.mostrarAnimacion= true;
  		}
  		//si se ha curado al enemigo:
    	if(changes.enemigoVida.currentValue >changes.enemigoVida.previousValue){
    		this.numeroAnimacion=  Math.round((changes.enemigoVida.currentValue-changes.enemigoVida.previousValue)*10)/10;
    		this.colorNumero="green";
    		this.mostrarAnimacion= true;
  		}
    }

    // Detectar cambio en vida:
    if(changes.heroeVida){
    	//si se ha dañado al enemigo:
    	if(changes.heroeVida.currentValue <changes.heroeVida.previousValue){
    		this.numeroAnimacion=  Math.round((changes.heroeVida.previousValue-changes.heroeVida.currentValue)*10)/10;
    		this.colorNumero="red";
    		this.mostrarAnimacion= true;
  		}
  		//si se ha curado al enemigo:
    	if(changes.heroeVida.currentValue >changes.heroeVida.previousValue){
    		this.numeroAnimacion=  Math.round((changes.heroeVida.currentValue-changes.heroeVida.previousValue)*10)/10;
    		this.colorNumero="green";
    		this.mostrarAnimacion= true;
  		}
    }

  }

  resetAnimacionNumero(): void{
  	this.mostrarAnimacion = false;
  }

}






