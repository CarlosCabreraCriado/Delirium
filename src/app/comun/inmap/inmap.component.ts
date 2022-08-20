
import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { AppService } from '../../app.service';
import { InMapService } from './inmap.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-inmap',
  templateUrl: './inmap.component.html',
  styleUrls: ['./inmap.component.sass']
})

export class InMapComponent implements OnInit{

	constructor(private dialog: MatDialog, public appService: AppService, private inmapService: InMapService) { }

	private pantalla: string = "Inmap";
	private idCuenta: string;
	private appServiceSuscripcion: Subscription = null;

	ngOnInit(){

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 1000);


		//Observar Eventos AppService:
		this.appServiceSuscripcion = this.appService.observarAppService$.subscribe(
			(val) => {
				switch(val){
					case "actualizarHeroeSeleccionado":
						this.inmapService.importarHeroeSeleccionado();
						this.inmapService.cargarGrupo();
						break;
				}
		});


		//Comprueba el Logueo carga el perfil en Servicio InMap:
		this.inmapService.cargarPerfil();

		//Get id Cuenta;
		this.idCuenta = this.inmapService.getIDCuenta();

		//Importar Datos Generales al servicio Inmap:
		this.inmapService.importarDatosGenerales();	

		//Cargar Grupo:
		this.inmapService.cargarGrupo();
	}

	abrirConfiguracion(){
		this.appService.mostrarConfiguracion("", {})
		return;
	}

	abrirSocial(){
		this.appService.mostrarSocial("", {})
		return;
	}

	comandoPanelGeneral(pantalla:string){
		this.cambiarPantalla(pantalla);
	}

	comandoPanelControl(comando:any){

		//Si se pulsa el centro accede a mazmorra:
		if(comando=="centro"){
			this.inmapService.iniciarPartida();	
		}
	}

	cambiarPantalla(nombrePantalla:string):void{

		//Realiza el cambio de pantalla:
		if(this.pantalla == nombrePantalla){
			this.pantalla = 'Inmap';
		}else{
			this.pantalla=nombrePantalla;
		}
		return;
	}

	camelize(texto: string){
 		return texto.toLowerCase().charAt(0).toUpperCase() + texto.toLowerCase().slice(1);
	}

	renderizarTipo(jugador:any){

		//Si no hay heroe seleccionado:
		if(jugador.heroe.nombre==null ){
			if(jugador.cuentaID==this.idCuenta){
				return "seleccionar";
			}
		}
		return "jugador";
	}

	clickHeroe(jugador:any){

		switch(this.renderizarTipo(jugador)){
			case "seleccionar":
				this.cambiarPantalla("Personaje");
				break;
			
		}
		return;
	}
}




