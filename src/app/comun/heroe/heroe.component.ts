
import { Component , Input } from '@angular/core';

@Component({
  selector: 'heroeComponent',
  templateUrl: './heroe.component.html',
  styleUrls: ['./heroe.component.sass']
})

export class HeroeComponent {

    //Datos:
	@Input() renderMazmorra: any; 
	@Input() renderHeroe: any; 

    //Opciones:
	@Input() marcador: string = "DPS"; 
	@Input() lider: boolean = false; 
	@Input() seleccionable: boolean = false;
	@Input() desplegable: boolean = false;
	@Input() pantalla: string = "mazmorra"; 

    public estadoDesplegado: boolean= true;

	constructor() {}

	renderizarMarcoHeroe(): string{

		if(this.pantalla == "inMap"){ return;}

		var clases = "";

		if(this.seleccionable){
			clases = clases + " seleccionable";
		}

		//Renderiza marco de turno:
		if(this.renderHeroe.turno){
			clases = clases + " animate__animated animate__infinite animate__pulse";
		}

		//Detecta quien es el caster (Heroes/Enemigo), asigna propiedades y consume recurso:
		var esHeroe = false;
		var esEnemigo = false;
		for(var k=0; k <this.renderMazmorra.heroes.length; k++){
			if(this.renderMazmorra.heroes[k].turno){
				esHeroe= true;
				break;
			}
		}

		for(var k=0; k <this.renderMazmorra.enemigos.length; k++){
			if(this.renderMazmorra.enemigos[k].turno){
				esEnemigo= true;
				break;
			}
		}


		//Renderiza Marco de objetivoAuxiliar:
		if(this.renderHeroe.objetivoAuxiliar){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAuxiliarAliado";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoAuxiliarEnemigo";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAuxiliarAliado";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAuxiliarEnemigo";
				}
			}
		}

		//Renderiza Marco de objetivo:
		if(this.renderHeroe.objetivo){
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EU"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AU"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAliado";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoEnemigo";
				}
			}
		}
		return clases;
	}

	renderizarEscudoHeroe(): string{
		var left= 0;
		//Si el escudo cabe en la vida que falta
		if(100-this.renderHeroe.vida >= this.renderHeroe.escudo){
			left= this.renderHeroe.vida + (this.renderHeroe.escudo/2);
		}else{
			left= 100 - (this.renderHeroe.escudo/2);
		}
		
		return left+"%";
	}

	renderizarClaseBuffosHeroe(j:number): string{
		var clases;

		//Renderiza buffo o debuffo:
		if(this.renderHeroe.buff[j].tipo2== "DEBUF"){
			clases = "DeBuffo-Heroe";
		}

		//Renderiza buffo o debuffo:
		if(this.renderHeroe.buff[j].tipo2== "BUFF"){
			clases = "Buffo-Heroe";
		}
		return clases;
	}

	renderizarEstiloBuffosHeroe(j:number,buff:any):any{
		var estilo={}
		console.log(buff)
		var  indexVertical= Math.floor(buff.icon_id/10);
        var  indexHorizontal= buff.icon_id-indexVertical*10;
		estilo={
			'background':'url(./assets/Buffos/Buff.png) '+0.5+11*indexHorizontal+'% '+0.5+9.9*indexVertical+'%',
			'background-size': '1000% 1100%'
		}
		return estilo;
	}


}





