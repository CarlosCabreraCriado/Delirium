
import { Component, OnInit  } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { AppService } from '../../app.service';
import { InMapService } from './inmap.service';
import { Subscription } from "rxjs";
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-inmap',
  templateUrl: './inmap.component.html',
  styleUrls: ['./inmap.component.sass']
})

export class InMapComponent implements OnInit{

	constructor(private dialog: MatDialog, public appService: AppService, private inmapService: InMapService, private socketService:SocketService) { }


	private pantalla: string = "Inmap";
	private idCuenta: string;

	//Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription = null;
	//Declara Suscripcion Evento AppService:
	private appServiceSuscripcion: Subscription = null;

	ngOnInit(){

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 3000);

		//Observar Eventos AppService:
		this.appServiceSuscripcion = this.appService.observarAppService$.subscribe(
			(val) => {
				switch(val){
					case "actualizarHeroeSeleccionado":
						this.inmapService.importarHeroeSeleccionado();
						this.inmapService.iniciarInMap();
						break;
				}
		});

		//Suscripcion Socket:
      	this.socketSubscripcion = this.socketService.eventoSocket.subscribe(async(data) => {

            var cuenta = await this.appService.getCuenta();

      		if(data.emisor== cuenta.nombre && data.tipoEmisor == cuenta.tipo){console.log("EVITANDO "+data.peticion);return;}
      		switch(data.peticion){
      			case "log":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      			break;
      			
      			case "estadoSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	//this.sala = data.contenido;
      		    	console.log("SALA: ")
      		    	//console.log(this.sala);
      		    	
      			break;
				
      			case "cerrarSala":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	//this.appService.setSala(this.sala);
      		    	//console.log(this.sala); 	
      			break;

      			case "iniciarPartida":
      				console.log("Peticion: "+data.peticion);
      		    	console.log("Contenido: ");
      		    	console.log(data.contenido);
      		    	//this.sala = data.contenido;
      		    	//this.appService.setSala(this.sala);
      		    	//this.socketSubscripcion.unsubscribe();
      		    	//this.appService.setControl("mazmorra");
					//this.appService.setEstadoApp("mazmorra");
      			break;
      		}
      	});

		//Comprueba el Logueo carga el perfil en Servicio InMap:
		this.inmapService.cargarPerfil().then(() => {

            //Get id Cuenta;
            console.log("Cargando Cuenta");
            this.idCuenta = this.inmapService.getIDCuenta();

        }).then(() => {

    		//Importar Datos Generales al servicio Inmap:
            console.log("Importando Datos Generales: ");
	    	this.inmapService.importarDatosGenerales();	

        }).then(() => {

            //Cargar Grupo:
            console.log("Cargando Grupo: ");
            this.inmapService.iniciarInMap();

        });
	}

	ngOnDestroy(){
        console.log("Destruyendo INMAP");
        this.appServiceSuscripcion.unsubscribe;
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
			this.inmapService.iniciarPartida("MazmorraSnack");	
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

}




