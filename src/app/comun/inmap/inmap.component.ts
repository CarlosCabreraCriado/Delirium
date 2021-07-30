
import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { AppService } from '../../app.service';
import { ConfiguracionComponent } from '../../comun/configuracion/configuracion.component';

@Component({
  selector: 'app-inmap',
  templateUrl: './inmap.component.html',
  styleUrls: ['./inmap.component.sass']
})

export class InMapComponent implements OnInit{

	constructor(private dialog: MatDialog, public configuracionDialogo:MatDialog, public appService: AppService) { }

	private validacion: any;
	private perfil: any;

	private pantalla: string = "Inmap";

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

	abrirConfiguracion(){
		//this.configuracionDialogo = this.appService.mostrarConfiguracion("", {})
		var tipoDialogo = "";
		var config:any = {};

		const dialogConfiguracion = this.dialog.open(ConfiguracionComponent,{
		  width: "100px",panelClass: [tipoDialogo, "contenedorConfiguracion"],backdropClass: "fondoConfiguracion", disableClose:true, data: {tipoDialogo: tipoDialogo, titulo: config.titulo, contenido: config.contenido, inputLabel: config.inputLabel}
		});

		dialogConfiguracion.afterClosed().subscribe(result => {
		  console.log('Cierre Configuracion. Devuelve:');
		  console.log(result)
		  return; 
		});
		
	}


	retroceder():void{
		console.log("hola")
		//this.appService.setControl("index");
		//this.appService.cambiarUrl("");
		return;
	}

	cambiarPantalla(nombrePantalla:string):void{
		if(this.pantalla == nombrePantalla){
			this.pantalla = 'Inmap';
		}else{
			this.pantalla=nombrePantalla;
		}
		return;
	}



}




