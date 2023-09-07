
import { Component ,ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

@Component({
  selector: 'enemigoComponent',
  templateUrl: './enemigo.component.html',
  styleUrls: ['./enemigo.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class EnemigoComponent implements OnInit{

	@Input() renderEnemigo: any;
	@Input() estadoControl: any = undefined;
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
    if(this.estadoControl==undefined){
        return clases
    }

		if(this.seleccionable){
			clases = clases + " seleccionable";
		}

		//Renderiza Marco de turno:
		if(this.renderEnemigo.turno){
			clases = clases + " Turno";
		}

    //Determina si es objetivo:
    var esObjetivo = false;
    for(var i = 0; i < this.estadoControl.objetivosEnemigos.length; i++){
      if(this.estadoControl.objetivosEnemigos[i] == this.indexEnemigo){
        esObjetivo = true;
        break;
      }
    }

		//Renderiza Marco de objetivoAuxiliar:
		if(this.renderEnemigo.objetivoAuxiliar){

			if(this.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAuxiliarAliado";
			}

			if(this.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoAuxiliarEnemigo";
			}

			if(this.estadoControl.tipoObjetivo=="OM"){
				if(this.estadoControl.esTurnoHeroe){
					clases = clases + " ObjetivoAuxiliarEnemigo";
				}
				if(this.estadoControl.esTurnoEnemigo){
					clases = clases + " ObjetivoAuxiliarAliado";
				}
			}
		}

		//Renderiza Marco de objetivo:
		if(esObjetivo){
			if(this.estadoControl.tipoObjetivo=="EU"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.estadoControl.tipoObjetivo=="AU"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " ObjetivoAliado";
			}
			if(this.estadoControl.tipoObjetivo=="OM"){
				if(this.estadoControl.esTurnoHeroe){
					clases = clases + " ObjetivoEnemigo";
				}
				if(this.estadoControl.esTurnoEnemigo){
					clases = clases + " ObjetivoAliado";
				}
			}
		}
		return clases;
	}

}





