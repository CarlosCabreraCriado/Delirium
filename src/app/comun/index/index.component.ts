
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { IndexService } from './index.service';
import { Subscription } from "rxjs";
//import { ElectronService } from 'ngx-electron';
import { HttpClient } from "@angular/common/http";
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})

export class IndexComponent implements OnInit{

	constructor(public appService: AppService, public indexService: IndexService/*, public electronService: ElectronService*/, private http: HttpClient, private socketService:SocketService) { }

	private cursorSuscripcion: Subscription = null;
	
	private tecla: string;
	public cursor: number;
	private cursorMin: number= 1;
	private cursorMax: number= 2;
	private validacion: any = {};
	public procesando: boolean= false;
	private pantalla: string= "inicio";
	private errorInicio: string = null;
  	
  	@ViewChild('clave',{static: false}) claveElement:ElementRef; 

	ngOnInit(){

		this.appService.claveValida= false;
		this.cursor= this.cursorMin;
		this.cursorSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );

		this.validacion= this.appService.getValidacion();
		console.log(this.validacion);
		if(this.validacion.nombre==undefined){
			this.validacion = {
				nombre: "Sesión no iniciada."
			};
		}else{
			this.appService.claveValida= true;
		}
	}

	actualizarComponente(): void{
		
		if(this.appService.control=="null"){
        	this.appService.setControl("index");
        	this.appService.cambiarUrl("/index");
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
		this.appService.mostrarMensaje("Opción no disponible.");
	}

	heroes():void{
		this.appService.mostrarPantallacarga(true);
		this.appService.getDatos(this.appService.getValidacion().clave);
		this.appService.setControl("heroes");
		setTimeout(()=>{    
      		this.appService.cambiarUrl("/heroes");
 		}, 2000);
	}

	crearPartida():void{
		if(this.appService.getValidacion().tipo!="Host"){
			this.appService.mostrarMensaje("Acceso restringido a cuentas Host.");
			return;
		}

		if(this.appService.dispositivo!="Desktop"){
			this.appService.mostrarMensaje("Solo disponible desde Desktop");
			return;
		}

		this.appService.mostrarPantallacarga(true);
		this.appService.setControl("sala");
		setTimeout(()=>{    
			this.appService.setProgresoCarga("100");
      		this.appService.cambiarUrl("/sala");
 		}, 2000);
	}

	unirsePartida():void{

		if(this.appService.getValidacion().tipo!="Cliente"){
			this.appService.mostrarMensaje("Acceso restringido a cuentas Cliente.");
			return;
		}

		this.appService.mostrarPantallacarga(true);
		this.appService.setControl("unirsePartida");
		setTimeout(()=>{    
			this.appService.setProgresoCarga("100");
      		this.appService.cambiarUrl("/unirsePartida");
 		}, 2000);
	}

	retroceder():void{
		this.pantalla="inicio";
	}

	logout():void{
		this.validacion = {};
		this.socketService.enviarSocket("logout",this.validacion);
		this.appService.claveValida = false;
		this.appService.setValidacion(this.validacion);
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
					console.log("Comprobando clave: "+ this.claveElement.nativeElement.value);
					var clave = {
						clave: parseInt(this.claveElement.nativeElement.value)
					}

					this.http.post(this.appService.ipRemota+"/deliriumAPI/validacion",clave).subscribe((data) => {
						
						if(data){
							this.appService.setInicio(data);
							this.validacion= this.appService.getValidacion();
							if(this.validacion){
								this.socketService.enviarSocket('validacion', this.validacion);
								this.appService.getPerfil();
								this.appService.setModelosDatos();
								this.appService.claveValida= true;
								this.errorInicio = null;
								this.procesando= false;
							}
						}
					},(err) => {
						console.log(err);
						this.procesando= false;
						this.appService.claveValida= false;
						this.errorInicio= err.error;
					});
						
					this.claveElement.nativeElement.value = "";
				}
	}
}




