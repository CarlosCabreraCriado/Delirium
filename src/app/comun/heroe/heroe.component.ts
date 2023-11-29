
import { Component , ChangeDetectionStrategy, Input , OnInit } from '@angular/core';

@Component({
  selector: 'heroeComponent',
  templateUrl: './heroe.component.html',
  styleUrls: ['./heroe.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeroeComponent implements OnInit {

    //Datos:
	@Input() estadoControl: any = null;
	@Input() renderHeroe: any;
	@Input() indexHeroe: number;

    //Opciones:
	@Input() marcador: string = "DPS";
	@Input() lider: boolean = false;
	@Input() seleccionable: boolean = false;
	@Input() desplegable: boolean = false;
	@Input() pantalla: string = "mazmorra";
	@Input() desplegadoDefecto: boolean = true;
  @Input() tipoDesplegable: string = "radial";
  @Input() modoMazmorra: string = "mapa";

  public estadoDesplegado: boolean= true;
  public identificador: string = "";

	constructor() {}

    ngOnInit(){
        this.estadoDesplegado = this.desplegadoDefecto
        this.identificador = this.renderHeroe.nombre.replace(/\W/g,'_')
    }

    toggleDesplegable(){
        if(this.desplegable){this.estadoDesplegado = !this.estadoDesplegado}
    }

	renderizarMarcoHeroe(): string{

		if(this.pantalla == "inMap"){ return;}
        if(!this.estadoControl){ return;}

		var clases = "";

		if(this.seleccionable){
			clases = clases + " seleccionable";
		}

		return clases;
	}

    renderizarObjetivoHeroe():string{
		if(this.pantalla == "inMap"){ return;}
        if(!this.estadoControl){ return;}
		var clases = "";

        //Determina si es objetivo:
        var esObjetivo = false;
        for(var i = 0; i < this.estadoControl.objetivosHeroes.length; i++){
          if(this.estadoControl.objetivosHeroes[i] == this.indexHeroe){
            esObjetivo = true;
            break;
          }
        }

		//Renderiza Marco de objetivo:
		if(esObjetivo){
			if(this.estadoControl.tipoObjetivo=="EU"){
				clases = clases + " ObjetivoEnemigo";
			}
			if(this.estadoControl.tipoObjetivo=="AU"){
				clases = clases + " animacionCircularFocus";
			}
			if(this.estadoControl.tipoObjetivo=="EM"){
				clases = clases + " animacionCircularFocus";
			}
			if(this.estadoControl.tipoObjetivo=="AM"){
				clases = clases + " animacionCircularFocus";
			}
			if(this.estadoControl.tipoObjetivo=="OM"){
				if(this.estadoControl.esTurnoHeroe){
					clases = clases + " ObjetivoAliado";
				}
				if(this.estadoControl.esTurnoEnemigo){
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





