
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { IndexService } from './index.service';
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SocketService } from '../socket/socket.service';
import { BotonComponent } from '../boton/boton.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})

export class IndexComponent implements OnInit{

	constructor(public appService: AppService, public indexService: IndexService/*, public electronService: ElectronService*/, private http: HttpClient, private socketService:SocketService, ) { }

	private cursorSuscripcion: Subscription = null;
	
	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private cuenta: any = {};
	public procesando: boolean= false;
	private pantalla: string= "inicio";
	private errorInicio: string = null;
  	
  	@ViewChild('clave',{static: false}) claveElement:ElementRef; 
  	@ViewChild('usuario',{static: false}) usuarioElement:ElementRef; 

	async ngOnInit(){

		this.logout(); //Logout al cargar pagina 

		this.appService.claveValida= false;
		this.cursor= this.cursorMin;
		this.cursorSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );

      console.log("HOLAAA")
		//this.cuenta= await this.appService.getCuenta();
      //
      this.cuenta = {}

		console.log(this.cuenta);

		if(this.cuenta.nombre==undefined){
			this.cuenta = {
				nombre: "Sesión no iniciada."
			};
		}else{
			this.appService.claveValida= true;
		}

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
 		}, 3000);

	}


	actualizarComponente(): void{
		
		if(this.appService.control=="null"){
        	this.appService.setControl("index");
        	this.appService.setEstadoApp("index");
        	return;
      	}

		if(this.appService.control!="index"){return;}

		switch(this.tecla){
			
			case "Enter":
				this.checkClave();
			break;
		}
	}

	jugar():void{
		this.pantalla= "jugar";
	}

	configuracion():void{
		this.pantalla= "inicio";
		this.appService.mostrarDialogo("Informativo",{contenido:"Opción no disponible"})
	}

	mostrarCrearCuenta(){
		this.appService.mostrarCrearCuenta()
	}

	retroceder():void{
		this.pantalla="inicio";
	}

	logout():void{
		this.cuenta = {};
		this.socketService.enviarSocket("logout",this.cuenta);
		this.appService.claveValida = false;
		this.appService.setCuenta(this.cuenta);
		this.appService.setSala({});
	}

	renderizarPantalla(pantalla):string{
		var clase:string;
		if(this.pantalla==pantalla){
			clase="visible";
		}else{
			clase="oculto";
		}
		return clase;
	}

	checkClave():void{

		if(this.appService.claveValida==false){
					this.procesando=true;
					console.log("Comprobando credenciales: ");
					console.log("Usuario: "+ this.usuarioElement.nativeElement.value);
					console.log("Password: "+ this.claveElement.nativeElement.value);

					var credenciales = {
						usuario: this.usuarioElement.nativeElement.value,
						password: this.claveElement.nativeElement.value
					}

					this.http.post(this.appService.ipRemota+"/deliriumAPI/login",credenciales).subscribe((data) => {

                        //Error 
                        if(!data["success"]){
						    this.procesando= false;
						    this.appService.claveValida= false;
						    this.appService.mostrarDialogo("Error",{contenido:"El usuario o la contraseña no son validos."});
                        }else{

                            if(data){

                                console.log("DATOS RECIBIDOS")
                                console.log(data)

                                //Inicialización de datos:
                                this.appService.setCuenta(data["cuenta"])
                                this.appService.setToken(data["token"]);
                                this.appService.setDatosJuego(data["datosJuego"]);
                                this.appService.setEventos(data["eventos"]);
                                this.appService.setPerfil(data["perfil"]);

                                this.socketService.enviarSocket('validacion', data["cuenta"]);
                                
                                //Retirar Pantalla Carga:
                                this.appService.claveValida= true;
                                this.errorInicio = null;
                                this.procesando= false;
                                this.appService.mostrarPantallacarga(true);
                                this.appService.finalizarLogin();
                            }
                        }

					},(err) => {
						console.log(err);
						this.procesando= false;
						this.appService.claveValida= false;
						this.errorInicio= err.error;
						this.appService.mostrarDialogo("Error",{contenido:"El usuario o la contraseña no son validos."});
					});
						
					this.claveElement.nativeElement.value = "";
				}
	}

}




