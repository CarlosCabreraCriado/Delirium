
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

  	private desarrolladorSuscripcion: Subscription = null;

  	//Formularios
  	private formGeneral: FormGroup;
  	private formSala: FormGroup;

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


  	@ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;
  	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;

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

		this.formGeneral = this.formBuilder.group({
	      nombre: this.nombre_General,
	      descripcion: this.descripcion_General,
	      imagen_id: this.imagen_id_General,
	      nivel: this.nivel_General,
	      evento_start_id: this.evento_start_id_General,
	      evento_finish_id: this.evento_finish_id_General,
	      loot_finish_id: this.loot_finish_id_General
	    });

	    this.formSala = this.formBuilder.group({
	   		sala_id: this.sala_id_Sala,
	     	nombre: this.nombre_Sala,
	     	descripcion: this.descripcion_Sala,
	     	evento_inicial_id: this.evento_inicial_id_Sala,
	    	evento_final_id: this.evento_final_id_Sala
	    });

		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	          switch (val) {
	          	case "reloadFormGeneral":
	          		 this.formGeneral.setValue(this.desarrolladorService.mazmorra["general"][0]);
	          	break;

	          	case "reloadFormSala":
	          		 this.formSala.setValue(this.desarrolladorService.mazmorra["salas"][this.desarrolladorService.mazmorra.salas.indexOf(this.desarrolladorService.mazmorra.salas.find(i=> i.sala_id==this.desarrolladorService.salaSeleccionadaId))]);
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
 
}




