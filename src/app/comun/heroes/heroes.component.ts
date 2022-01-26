
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { Subscription } from "rxjs";
import { HeroesInfoComponent} from '../heroesInfo/heroesInfo.component'
import { HeroesInfoService} from '../heroesInfo/heroesInfo.service'
import { HeroesCrearComponent} from '../heroesCrear/heroesCrear.component'
import { HeroesCrearService} from '../heroesCrear/heroesCrear.service'
//import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.sass']
})

export class HeroesComponent implements OnInit{

	constructor(public appService: AppService, public heroesInfoService: HeroesInfoService, public heroesCrearService: HeroesCrearService/*, public electronService: ElectronService*/) { }

	private cursorSuscripcion: Subscription = null;
	
	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private validacion: any;
	public usuario: string = "Sesión no iniciada.";
	private perfil: any;
	private pantalla = "seleccionHeroe"
	private heroeSeleccionado: any;

	public partidasCargadas: any=[
	{
		nombre: "Partida 1",
		descripcion: "Prueba de descripcion 1",
		jugadores: ["Jug1","Jug2","Jug3","Jug4"]
	},
	{
		nombre: "Partida 2",
		descripcion: "Prueba de descripcion 2",
		jugadores: ["Jug1","Jug2","Jug3","Jug4"]
	},
	{
		nombre: "Partida 3",
		descripcion: "Prueba de descripcion 3",
		jugadores: ["Jug1","Jug2","Jug3","Jug4"]
	},
	{
		nombre: "Partida 4",
		descripcion: "Prueba de descripcion 4",
		jugadores: ["Jug1","Jug2","Jug3","Jug4"]
	}
	]

	ngOnInit(){
		this.cursor= this.cursorMin;
		this.cursorSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );

		this.validacion = this.appService.getValidacion();
		console.log(this.validacion);
		if(!this.validacion){
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}

		this.perfil=this.appService.getPerfil();
		
		this.appService.setProgresoCarga("100");

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 1000);
	}

	actualizarComponente(): void{
		
		if(this.appService.control=="null"){
        	this.appService.setControl("sala");
        	return;
      	}

		if(this.appService.control!="sala"){return;}

		switch(this.tecla){
			case "ArrowUp":
				
			break;
			case "ArrowDown":
				
			break;
			case "Enter":

			break;
		}
	}

	cargarPartida(indicePartida):void{
		this.appService.setSala(this.partidasCargadas[indicePartida]);
		this.appService.setControl("sala");
		this.appService.cambiarUrl("sala");
		return;
	}

	retroceder():void{
		this.appService.setControl("index");
		this.appService.cambiarUrl("");
		return;
	}

	seleccionarHeroe(index):void{
		console.log("Heroe seleccionado: ");
		this.heroesInfoService.setPersonaje(index);
		this.heroesInfoService.mostrarHeroesInfo=true;

		//Formateo Mayusculas y espacios:
		//this.heroeSeleccionado.clase= this.heroeSeleccionado.clase.replace(/_/g," ");
		//this.heroeSeleccionado.clase= this.heroeSeleccionado.clase.charAt(0).toUpperCase() + this.heroeSeleccionado.clase.slice(1).toLowerCase();
		//console.log(this.heroeSeleccionado.nombre - this.heroeSeleccionado.clase);
		return;
	}

	crearHeroe():void{
		console.log("Creando Heroe")
		//this.heroesCrearService.setPersonaje(0);
		this.heroesCrearService.mostrarHeroesCrear=true;
		return;
	}


}




