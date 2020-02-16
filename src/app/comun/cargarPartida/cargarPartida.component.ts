
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { Subscription } from "rxjs";
//import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-cargarPartida',
  templateUrl: './cargarPartida.component.html',
  styleUrls: ['./cargarPartida.component.sass']
})

export class CargarPartidaComponent implements OnInit{

	constructor(public appService: AppService/*, public electronService: ElectronService*/) { }

	private cursorSuscripcion: Subscription = null;
	
	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private validacion: any;
	public claveValida: boolean= true;
	public usuario: string = "Sesión no iniciada.";

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
		if(!this.validacion){
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}

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
	}

	retroceder():void{
		this.appService.setControl("index");
		this.appService.cambiarUrl("");
	}
}




