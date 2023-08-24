
import { Component ,ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

@Component({
  selector: 'enemigoComponent',
  templateUrl: './enemigo.component.html',
  styleUrls: ['./enemigo.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class EnemigoComponent implements OnInit{

	@Input() renderEnemigo: any;
	@Input() renderMazmorra: any = undefined;
	@Input() indexEnemigo: number;
	@Input() seleccionable: boolean;
	@Input() desplegable: boolean = false;
	@Input() desplegadoDefecto: boolean = true;

    public estadoDesplegado: boolean= true;

	constructor(){
    }

  ngOnInit(){
    this.estadoDesplegado = this.desplegadoDefecto
  }

  toggleDesplegable(){
    if(this.desplegable){this.estadoDesplegado = !this.estadoDesplegado}
  }

	renderizarEstiloBuffosEnemigos(buff:any):any{

		var estilo={}

		estilo={
			'background':'url(./assets/Habilidades/Spell/'+buff.imagen_id+'.png) 100% 100%',
			'background-size': '100% 100%',
			'height': '100%'
		}
		return estilo;
	}

	renderizarClaseBuffosEnemigos(j:number): string{
		var clases;

		//Renderiza buffo o debuffo:
		if(this.renderEnemigo.buff[j].tipo== "DEBUF"){
			clases = "Buffo-Enemigo debuf";
		}

		//Renderiza buffo o debuffo:
		if(this.renderEnemigo.buff[j].tipo== "BUFF"){
			clases = "Buffo-Enemigo buff";
		}
		return clases;
	}

	renderizarMarcoEnemigo(): string{
		var clases = "Enemigo-"+(this.indexEnemigo+1);

        //Evita formateo si no se especifica renderMazmorra;
        if(this.renderMazmorra==undefined){
            return clases
        }

		if(this.seleccionable){
			console.log("SELECCIONANDO")
			clases = clases + " seleccionable";
		}

		//Renderiza Marco de turno:
		if(this.renderMazmorra.enemigos[this.indexEnemigo].turno){
			clases = clases + " Turno";
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
		if(this.renderMazmorra.enemigos[this.indexEnemigo].objetivoAuxiliar){

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAuxiliarAliado";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoAuxiliarEnemigo";
			}

			if(this.renderMazmorra.estadoControl.tipoObjetivo=="OM"){
				if(esHeroe){
					clases = clases + " ObjetivoAuxiliarEnemigo";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAuxiliarAliado";
				}
			}
		}

		//Renderiza Marco de objetivo:
		if(this.renderMazmorra.enemigos[this.indexEnemigo].objetivo){
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
					clases = clases + " ObjetivoEnemigo";
				}
				if(esEnemigo){
					clases = clases + " ObjetivoAliado";
				}
			}
		}
		return clases;
	}

}





