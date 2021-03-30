
import { Component, OnInit , ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { DesarrolladorService } from './desarrollador.service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { RenderReticula } from './renderReticula.class'
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { Subscription } from "rxjs";

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-desarrollador',
  templateUrl: './desarrollador.component.html',
  styleUrls: ['./desarrollador.component.sass']
})

export class DesarrolladorComponent implements OnInit{

	public editorVerOptions: JsonEditorOptions;
	public editorModificarOptions: JsonEditorOptions;
  	public data: any;
  	public path= [];

  	public renderReticula= {} as RenderReticula;
	private escalaIsometrico: number= 0.5;

  	private desarrolladorSuscripcion: Subscription = null;

  	//Variables Parametros Enemigos:
  	private mostrarTipoEnemigo: boolean= false;

  	//Formularios
  	private formGeneral: FormGroup;
  	private formSala: FormGroup;
  	private formEnemigos: FormGroup;
  	private formAsignarSala: FormGroup;
  	private formAsignarEvento: FormGroup;

  	//Campos General:
  	private nombre_General = new FormControl("Primera mazmorra");
  	private descripcion_General = new FormControl('Mazmorra de ejemplo');
  	private imagen_id_General = new FormControl('0');
  	private nivel_General = new FormControl('0');
  	private evento_start_id_General = new FormControl('0');
  	private evento_finish_id_General = new FormControl('0');
  	private loot_finish_id_General = new FormControl('0');

  	//Campos Sala:
  	private sala_id_Sala = new FormControl('0');
  	private nombre_Sala = new FormControl('Sala');
  	private descripcion_Sala = new FormControl('Sala de ejemplo');
  	private evento_inicial_id_Sala = new FormControl('0');
  	private evento_final_id_Sala = new FormControl('0');
  	private mostrarIsometricoSala = new FormControl(true);

  	//Campos Enemigos:
  	private enemigo_id_Enemigos = new FormControl('0');
  	private tipo_enemigo_id_Enemigos = new FormControl('1');
    private num_sala_Enemigos = new FormControl('0');
    private nombre_Enemigos = new FormControl('Enemigo');
    private imagen_id_Enemigos = new FormControl('0');
    private nivel_Enemigos = new FormControl('0');
    private loot_id_Enemigos = new FormControl('0');
    private loot_prob_Enemigos = new FormControl('0');
    private buffo_perma_id_Enemigos = new FormControl('0');
    private evento_muerte_id_Enemigos = new FormControl('0');
    private evento_spawn_id_Enemigos = new FormControl('0');
    private evento_intervalo_id_Enemigos = new FormControl('0');
    private evento_intervalo_tiempo_Enemigos = new FormControl('0');

	//Campos Asignar Isometrico:
  	private asignar_id_sala = new FormControl('0');
  	private asignar_evento = new FormControl('0');

  	@ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;
  	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;
  	@ViewChild('canvasIsometrico',{static: false}) private canvasIsometrico: ElementRef;

	constructor(public appService: AppService, public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) { 

		this.editorVerOptions = new JsonEditorOptions()
		this.editorModificarOptions = new JsonEditorOptions()
    	this.editorModificarOptions.mode = 'tree'; // set all allowed modes
    	this.editorVerOptions.mode = 'view'; // set all allowed modes
    	//this.options.mode = 'code'; //set only one mode
	}

	ngOnInit(){
		
		this.desarrolladorService.log("-------------------------------","green");
		this.desarrolladorService.log("  Iniciando gestor de datos... ","green");
		this.desarrolladorService.log("-------------------------------","green");
		this.desarrolladorService.inicializarGestor();
		this.desarrolladorService.inicializarArchivos();

		//Inicializar Reticula:
		//this.renderReticula = this.desarrolladorService.inicializarReticula();

		//Inicialización formulario General:
		this.formGeneral = this.formBuilder.group({
		    nombre: this.nombre_General,
		    descripcion: this.descripcion_General,
		    imagen_id: this.imagen_id_General,
		    nivel: this.nivel_General,
		    evento_start_id: this.evento_start_id_General,
		    evento_finish_id: this.evento_finish_id_General,
		    loot_finish_id: this.loot_finish_id_General
	    });

		//Inicialización formulario Sala:
	    this.formSala = this.formBuilder.group({
	   		sala_id: this.sala_id_Sala,
	     	nombre: this.nombre_Sala,
	     	descripcion: this.descripcion_Sala,
	     	evento_inicial_id: this.evento_inicial_id_Sala,
	    	evento_final_id: this.evento_final_id_Sala,
			mostrarIsometrico: this.mostrarIsometricoSala
	    });
		
		//Inicializacion formulario Enemigos:
	    this.formEnemigos = this.formBuilder.group({
	    	enemigo_id: this.enemigo_id_Enemigos,
	    	tipo_enemigo_id: this.tipo_enemigo_id_Enemigos,
        	num_sala: this.num_sala_Enemigos,
        	nombre: this.nombre_Enemigos,
        	imagen_id: this.imagen_id_Enemigos,
        	nivel: this.nivel_Enemigos,
        	loot_id: this.loot_id_Enemigos,
        	loot_prob: this.loot_prob_Enemigos,
        	buffo_perma_id: this.buffo_perma_id_Enemigos,
        	evento_muerte_id: this.evento_muerte_id_Enemigos,
        	evento_spawn_id: this.evento_spawn_id_Enemigos,
        	evento_intervalo_id: this.evento_intervalo_id_Enemigos,
        	evento_intervalo_tiempo: this.evento_intervalo_tiempo_Enemigos
	    });

		//Inicialización formulario Asignar Sala:
	    this.formAsignarSala = this.formBuilder.group({
	   		asignar_id_sala: this.asignar_id_sala
	    });

		//Inicialización formulario Asignar Evento:
	    this.formAsignarEvento = this.formBuilder.group({
	   		asignar_evento: this.asignar_evento
	    });

		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	          switch (val) {
				case "reloadForm":
	          	case "reloadFormGeneral":
	          		this.formGeneral.setValue(this.desarrolladorService.mazmorra["general"][0]);
	          	break;

	          	case "reloadFormSala":
				case "reloadForm":
	          		this.formSala.setValue(this.desarrolladorService.mazmorra["salas"][this.desarrolladorService.mazmorra.salas.indexOf(this.desarrolladorService.mazmorra.salas.find(i=> i.sala_id==this.desarrolladorService.salaSeleccionadaId))]);
	          	break;

	          	case "reloadFormEnemigo":
				case "reloadForm":
	          		this.formEnemigos.setValue(this.desarrolladorService.mazmorra["enemigos"][this.desarrolladorService.mazmorra.enemigos.indexOf(this.desarrolladorService.mazmorra.enemigos.find(i=> i.enemigo_id==this.desarrolladorService.enemigoSeleccionadoId))]);
	          	break;

	          	case "reloadReticula":
	          		 //this.renderReticula = this.desarrolladorService.getReticula();
	          	break;
	          	
	          }
	        }
      	);

		this.formGeneral.valueChanges.subscribe((val) =>{
			this.desarrolladorService.mazmorra["general"][0] = val;
			console.log(val)
		});

		this.formSala.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.salaSeleccionadaId){
				this.desarrolladorService.mazmorra.salas[this.desarrolladorService.mazmorra.salas.indexOf(this.desarrolladorService.mazmorra.salas.find(i=> i.sala_id==this.desarrolladorService.salaSeleccionadaId))] = val;
			}
			console.log(val)
		});

		this.formEnemigos.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoId){
				this.desarrolladorService.mazmorra.enemigos[this.desarrolladorService.mazmorra.enemigos.indexOf(this.desarrolladorService.mazmorra.enemigos.find(i=> i.enemigo_id==this.desarrolladorService.enemigoSeleccionadoId))] = val;
			}
			console.log(val)
		});

		//Crear registro de nombres de enemigos para display de assets:
		var nombreAsset:string;
		for (var i = 0; i < this.desarrolladorService.tipoEnemigos.enemigos_stats.length; ++i) {
			nombreAsset= this.desarrolladorService.tipoEnemigos.enemigos_stats[i].nombre;
			nombreAsset= nombreAsset.toLowerCase().replace(/ /g,'_').replace(/ñ/g,'n');
			this.desarrolladorService.tipoEnemigos.enemigos_stats[i].nombreAsset= nombreAsset;
		}
		return;
	}

	ngAfterViewChecked() {        
        this.scrollToBottom();      
    } 

	/*
	subirArchivo(archivoInput: any){
		console.log("HOLA");
		console.log(archivoInput);
		this.path[0]= archivoInput.target.files[0].path;
	}*/

	scrollToBottom(): void {
        try {
            this.contenedorMensajes.nativeElement.scrollTop = this.contenedorMensajes.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

	renderDatoSeleccionado(datoSeleccionado){
		if(this.desarrolladorService.archivoSeleccionado==datoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderOpcionDatoSeleccionado(opcionSeleccionado){
		if(this.desarrolladorService.estadoDatos==opcionSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderizarSector(i,j){
		return;
	}

	mostrarEstadisticasEnemigo(){
		return;
	}

	abrirSeleccionarTipoEnemigo(){
		this.mostrarTipoEnemigo =true;
		return;
	}

	cerrarSeleccionarEnemigo(){
    	this.mostrarTipoEnemigo= false;
    	return;
  	}

  	seleccionarTipoEnemigo(tipoEnemigoID){
		this.mostrarTipoEnemigo =false;
		this.desarrolladorService.seleccionarTipoEnemigo(tipoEnemigoID);
		return;
	}

	zoomIn(){

		if(this.desarrolladorService.mostrarIsometrico){
			this.escalaIsometrico += 0.1;
		}else{
			this.desarrolladorService.zoomIn();
		}
		return;
	}
	
	zoomOut(){
		if(this.desarrolladorService.mostrarIsometrico){
			this.escalaIsometrico -= 0.1;
		}else{
			this.desarrolladorService.zoomOut();
		}
		return;
	}

	asignarSala(){
		console.log("Asignando Sala..."); 
		this.desarrolladorService.asignarSala(this.asignar_id_sala.value);	
	}

	renderizarElementoIsometrico(elemento: any):any{
		
		var opcionesCanvas = this.desarrolladorService.mazmorra.isometrico.MapSave.MapSettings
		var style = {
			"position": "absolute",
			"top": "",
			"left": "",
			"width": "",
			"height": "",
			"z-index": 0,
			"transform": "translate(-50%,-50%) scaleX(1) scale("+this.escalaIsometrico+")",
			"display": "block",
			"filter": "none"
		}

		//Renderizar Elemento:
		var top = (parseFloat(elemento.Position.y)*this.escalaIsometrico/*+parseFloat(elemento.VisibilityColliderStackingOffset.y)*/) + "px";
		style["top"]= top.replace(/,/g,".")

		var left= (parseFloat(elemento.Position.x)*this.escalaIsometrico/*-parseFloat(elemento.VisibilityColliderStackingOffset.x)*/) + "px";
		style["left"]= left.replace(/,/g,".")

		var zIndex= (parseFloat(elemento.Position.z)+100)*10
		style["z-index"]= Math.floor(zIndex)

		if(elemento.Mirror=="true"){
			style.transform= "translate(-50%,-50%) scaleX(-1) scale("+this.escalaIsometrico+")";
		}

		//Aplicar filtrado de visualizacion:
		style.display = "block";
		if(!this.desarrolladorService.mostrarGrid){
			if(elemento.tipo == "grid"){
				style.display = "none";
			}
		}	
		
		if(!this.desarrolladorService.mostrarDecorado){
			if(elemento.tipo == "decorado"){
				style.display = "none";
			}
		}	

		//Aplicar filtrado de Sala
		if(!this.desarrolladorService.mostrarSalaNula){
			if(elemento.sala==0){
				style.display= "none";
			} 
		}

		for(var i =0; i<this.desarrolladorService.mazmorra.salas.length; i++){
			if((!this.desarrolladorService.mazmorra.salas[i].mostrarIsometrico) && (elemento.sala==this.desarrolladorService.mazmorra.salas[i].sala_id)){
				style.display= "none";
			} 
		}

		//Renderizar Seleccion:
		if(elemento.seleccionado){
			style.filter = "sepia(100%) saturate(100)";
		}

		//Aplicar filtro de Seleccion: 
		//var width= ((window.innerWidth*0.7)/opcionesCanvas.MapSizeX)*100 + "px";
		//style.width= width.replace(/,/g,".")

		//var height= ((window.innerHeight*0.6)/opcionesCanvas.MapSizeY)*100 + "%";
		//style.height= height.replace(/,/g,".")

		return style;
	}

}




