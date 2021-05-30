
import { Component, OnInit} from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-inmap',
  templateUrl: './inmap.component.html',
  styleUrls: ['./inmap.component.sass']
})

export class InMapComponent implements OnInit{

	constructor(public appService: AppService) { }

	private validacion: any;
	private perfil: any;

	ngOnInit(){

		//Comprueba el Logueo:
		this.validacion = this.appService.getValidacion();
		console.log(this.validacion);
		if(!this.validacion){
			this.appService.setControl("index");
			this.appService.cambiarUrl("");
		}

		//Carga el perfil:
		this.perfil=this.appService.getPerfil();

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 1000);
	}

	retroceder():void{
		this.appService.setControl("index");
		this.appService.cambiarUrl("");
		return;
	}




}




