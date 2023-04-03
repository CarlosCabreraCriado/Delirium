
import { Component, OnInit , ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { DesarrolladorService } from './desarrollador.service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { RenderReticula } from './renderReticula.class'
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { Subscription } from "rxjs";

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
	private escalaMapaIsometrico: number= 3;
    private coordenadaSeleccionadaX= 0;
    private coordenadaSeleccionadaY= 0

  	private desarrolladorSuscripcion: Subscription = null;

  	//Variables Parametros Enemigos:
  	private mostrarTipoEnemigo: boolean= false;

  	//Variables Parametros Enemigos:
  	readonly tiposOrdenes = ["Condición","Variable","Misión","Trigger","Diálogo","Hechizo","Loot","Enemigo","Mazmorra","Multimedia","Tiempo"];

  	//Formularios
  	private formGeneral: FormGroup;
  	private formSala: FormGroup;
  	private formEnemigos: FormGroup;
  	private formEventosMazmorra: FormGroup;
  	private formDialogos: FormGroup;
  	private formAsignarSala: FormGroup;
  	private formAsignarEvento: FormGroup;
  	private formInMapGeneral: FormGroup;
  	private formInMapTerreno: FormGroup;
  	private formInMapTrigger: FormGroup;
  	private formInMapMisiones: FormGroup;

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

	//Campos Eventos (MAZMORRA):
	private id_eventoMazmorra = new FormControl('0');
	private id_mazmorra = new FormControl('0');
	private id_sala = new FormControl('0');
	private tipo_evento = new FormControl('0');
	private codigo = new FormControl('0');
	private rng = new FormControl('0');
	private rng_fallo_evento_id = new FormControl('0');
	private buff = new FormControl('0');
	private insta_buff = new FormControl('0');
	private objetivo_buff = new FormControl('0');
	private loot_id = new FormControl('0');
	private loot_prob = new FormControl('0');
	private objetivo_loot = new FormControl('0');
	private dialogo_evento_id = new FormControl('0');
	private objetivo_dialogo = new FormControl('0');
	private spawn_enemigo_id = new FormControl('0');
	private set_evento_watcher = new FormControl('0');
	private remove_evento_watcher = new FormControl('0');
	private evento_watcher_id = new FormControl('0');
	private expire_watcher_id = new FormControl('0');
	private intervalo_trigger_watcher = new FormControl('0');
	private variable_trigger_watcher = new FormControl('0');
	private add_variable = new FormControl('0');
	private elimina_variable = new FormControl('0');
	private if_condicion_variable = new FormControl('0');
	private if_falso_evento_id = new FormControl('0');
	private cinematica_id = new FormControl('0');
	private sonido_id = new FormControl('0');
	private evento_next_id = new FormControl('0');
	
	//Campos Dialogos:
	private dialogo_id = new FormControl('0');
	private tipo_dialogo = new FormControl('0');
	private imagen_id = new FormControl('0');
	private texto1 = new FormControl('0');
	private texto2 = new FormControl('0');
	private texto3 = new FormControl('0');
	private texto_elegir = new FormControl('0');
	private eleccion_evento_id = new FormControl('0');
	private timeout = new FormControl('0');
	private evento_timeout_id = new FormControl('0');
	private minimo_tiempo = new FormControl('0');
	private redirect_dialogo_id = new FormControl('0');
	private next_evento_id = new FormControl('0');

	//Campos Asignar Isometrico:
  	private asignar_id_sala = new FormControl('0');
  	private asignar_evento = new FormControl('0');

	//Campos Campos InMap General:
  	private inMapNombre = new FormControl('null');
  	private inMapDescripcion = new FormControl('null');
  	private inMapIndicador = new FormControl('null');

	//Campos Campos InMap Terreno:
  	private inMapTipoTerreno = new FormControl('normal');
  	private inMapAtravesable = new FormControl(true);
  	private inMapInspeccionable = new FormControl('0');
  	private inMapMensajeInsapeccionable = new FormControl(null);
  	private inMapUbicacionEspecial = new FormControl('0');

	//Campos Campos InMap Eventos:
  	private inMapProbabilidadRandom = new FormControl(0);
  	private inMapCategoriaRandom = new FormControl('???');
  	private inMapLootProb = new FormControl('0');
  	private inMapLootId = new FormControl('0');


    //Configuracion MapaGeneral:
    private mostrarNieblaGuerra = false; 
    private mostrarInfranqueable = false; 

    //Opciones Selectores:
    private opcionesInMapIndicador = ["Mision","Evento"]

  	@ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;
  	@ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;
  	@ViewChild('canvasIsometrico',{static: false}) private canvasIsometrico: ElementRef;
  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;

	constructor(public appService: AppService, public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) { 

		this.editorVerOptions = new JsonEditorOptions()
		this.editorModificarOptions = new JsonEditorOptions()
    	this.editorModificarOptions.mode = 'tree'; // set all allowed modes
    	this.editorVerOptions.mode = 'view'; // set all allowed modes
    	//this.options.mode = 'code'; //set only one mode
	}

	async ngOnInit(){
		
		this.desarrolladorService.log("-------------------------------","green");
		this.desarrolladorService.log("  Iniciando gestor de datos... ","green");
		this.desarrolladorService.log("-------------------------------","green");

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
			enemigos: [],
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

		//Inicializacion formulario EventosMazmorra:
	    this.formEventosMazmorra = this.formBuilder.group({
			id_eventoMazmorra: this.id_eventoMazmorra,
			id_mazmorra: this.id_mazmorra, 
			id_sala: this.id_sala,
			tipo: this.tipo_evento,
			codigo: this.codigo,
			rng: this.rng, 
			rng_fallo_evento_id: this.rng_fallo_evento_id, 
			buff: this.buff,
			insta_buff: this.insta_buff,
			objetivo_buff: this.objetivo_buff,
			loot_id: this.loot_id,
			loot_prob: this.loot_prob,
			objetivo_loot: this.objetivo_loot,
			dialogo_id: this.dialogo_evento_id,
			objetivo_dialogo: this.objetivo_dialogo,
			spawn_enemigo_id: this.spawn_enemigo_id,
			set_evento_watcher: this.set_evento_watcher,
			remove_evento_watcher: this.remove_evento_watcher,
			evento_watcher_id: this.evento_watcher_id,
			expire_watcher_id: this.expire_watcher_id,
			intervalo_trigger_watcher: this.intervalo_trigger_watcher,
			variable_trigger_watcher: this.variable_trigger_watcher,
			add_variable: this.add_variable,
			elimina_variable: this.elimina_variable,
			if_condicion_variable: this.if_condicion_variable,
			if_falso_evento_id: this.if_falso_evento_id,
			cinematica_id: this.cinematica_id,
			sonido_id: this.sonido_id,
			evento_next_id: this.evento_next_id
	    });


		//Inicializacion formulario Orden Parametros:
        /*
	    this.formParametrosOrden = this.formBuilder.group({
            variable: this.variable_Orden_Parametro,
            operador: this.operador_Orden_Parametro,
            valorVariable: this.valorVariable_Orden_Parametro,
            tipoEncadenadoTrue: this.tipoEncadenadoTrue_Orden_Parametro,
            encadenadoTrue: this.encadenadoTrue_Orden_Parametro,
            tipoEncadenadoFalse: this.tipoEncadenadoFalse_Orden_Parametro,
            encadenadoFalse: this.encadenadoFalse_Orden_Parametro,
            comando: this.comando_Orden_Parametro,
            variableTarget: this.variableTarget_Orden_Parametro,
            valorNuevo: this.valorNuevo_Orden_Parametro,
            valorOperador: this.valorOperador_Orden_Parametro,
            tipoDialogo: this.tipoDialogo_Orden_Parametro,
            contenido: this.contenido_Orden_Parametro,
            opciones: this.opciones_Orden_Parametro,
            encadenadoId: this.encadenadoId_Orden_Parametro,
            tipoEncadenado: this.tipoEncadenado_Orden_Parametro,
            misionId: this.misionId_Orden_Parametro,
            tareaId: this.tareaId_Orden_Parametro,
            triggerId: this.triggerId_Orden_Parametro,
            trigger: this.trigger_Orden_Parametro,
            tipoMultimedia: this.tipoMultimedia_Orden_Parametro,
            nombreAsset: this.nombreAsset_Orden_Parametro,
            hechizoId: this.heroeObjetivoId_Orden_Parametro,
            objetivoOrden: this.objetivo_Orden_Parametro,
            heroeObjetivoId: this.heroeObjetivoId_Orden_Parametro,
            enemigoObjetivoId: this.enemigoObjetivoId_Orden_Parametro,
            objetivo: this.objetivo_Orden_Parametro,
            oro: this.oro_Orden_Parametro,
            exp: this.exp_Orden_Parametro,
            generado: this.generado_Objeto_Parametro,
            objetoId: this.objetoId_Objeto_Parametro,
            probTipo: this.probTipo_Objeto_Parametro,
            probRareza: this.probRareza_Objeto_Parametro,
            nivelMin: this.nivelMin_Objeto_Parametro,
            nivelMax: this.nivelMax_Objeto_Parametro,
            idEnemigo: this.idEnemigo_Orden_Parametro,
            tipoEnemigo: this.tipoEnemigo_Orden_Parametro,
            dias: this.dias_Orden_Parametro,
            mazmorraId: this.mazmorraId_Orden_Mazmorra,
            salaOpenId: this.salaOpenId_Orden_Mazmorra
        }); 
        */

		//Inicialización formulario Asignar Sala:
	    this.formAsignarSala = this.formBuilder.group({
	   		asignar_id_sala: this.asignar_id_sala
	    });

		//Inicialización formulario Asignar Evento:
	    this.formAsignarEvento = this.formBuilder.group({
	   		asignar_evento: this.asignar_evento
	    });

	//Campos Campos InMap General:
	    this.formInMapGeneral = this.formBuilder.group({
  	        inMapNombre: this.inMapNombre, 
  	        inMapDescripcion: this.inMapDescripcion,
  	        inMapIndicador: this.inMapIndicador
        });

	//Campos Campos InMap Terreno:
	    this.formInMapTerreno = this.formBuilder.group({
  	        inMapTipoTerreno: this.inMapTipoTerreno, 
  	        inMapAtravesable: this.inMapAtravesable,
            inMapInspeccionable: this.inMapInspeccionable,
            inMapMensajeInsapeccionable: this.inMapMensajeInsapeccionable,
  	        inMapUbicacionEspecial: this.inMapUbicacionEspecial 
	    });

	//Campos Campos InMap Eventos:
	    this.formInMapTrigger = this.formBuilder.group({
  	        inMapProbabilidadRandom: this.inMapProbabilidadRandom,
  	        inMapCategoriaRandom: this.inMapCategoriaRandom,
  	        inMapLootProb: this.inMapLootProb,
  	        inMapLootId: this.inMapLootId
	    });

	//Campos Campos InMap Misiones:
	    this.formInMapMisiones = this.formBuilder.group({
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
	          		//this.formEnemigos.setValue(this.desarrolladorService.mazmorra["salas"][this.desarrolladorService.enemigoSeleccionadoSalaIndex].enemigos[this.desarrolladorService.enemigoSeleccionadoIndex]);
	          	break;
				
	          	case "reloadFormEventosMazmorra":
				case "reloadForm":
	          		this.formEventosMazmorra.setValue(this.desarrolladorService.mazmorra["eventos"][this.desarrolladorService.mazmorra.eventos.indexOf(this.desarrolladorService.mazmorra.eventos.find(i=> i.id_eventoMazmorra==this.desarrolladorService.eventoSeleccionadoId))]);
	          	break;

	          	case "reloadFormTile":
				case "reloadForm":

                    //this.desarrolladorService.getTile(,j);
	          		//this.formInMapGeneral.setValue();
                //
	          	break;

	          	case "reloadReticula":
	          		 //this.renderReticula = this.desarrolladorService.getReticula();
	          	break;

	          	
	          }
	        }
      	);

		await this.desarrolladorService.inicializarGestor();
		this.desarrolladorService.inicializarArchivos();


		this.formGeneral.valueChanges.subscribe((val) =>{
			this.desarrolladorService.mazmorra["general"][0] = val;
			console.log(val)
		});

		//Suscripcion de dambios formulario Sala:
		this.formSala.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.salaSeleccionadaId){
				this.desarrolladorService.mazmorra.salas[this.desarrolladorService.mazmorra.salas.indexOf(this.desarrolladorService.mazmorra.salas.find(i=> i.sala_id==this.desarrolladorService.salaSeleccionadaId))] = val;
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario Enemigos:
		this.formEnemigos.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoId){
				this.desarrolladorService.mazmorra.salas[this.desarrolladorService.enemigoSeleccionadoSalaIndex].enemigos[this.desarrolladorService.enemigoSeleccionadoIndex] = val;
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario InMapGeneral:
		this.formInMapGeneral.valueChanges.subscribe((val) =>{
			this.desarrolladorService.setInMapGeneral(val);
			//console.log(val)
		});

		//Suscripcion de cambios formulario InMapTerreno:
		this.formInMapTerreno.valueChanges.subscribe((val) =>{
			this.desarrolladorService.setInMapTerreno(val);
			//console.log(val)
		});

		//Suscripcion de cambios formulario InMapEventos:
		this.formInMapTrigger.valueChanges.subscribe((val) =>{
			this.desarrolladorService.setInMapEventos(val);
			//console.log(val)
		});

		//Suscripcion de cambios formulario InMapMisiones:
		this.formInMapMisiones.valueChanges.subscribe((val) =>{
			this.desarrolladorService.setInMapMisiones(val);
			//console.log(val)
		});

		//Crear registro de nombres de enemigos para display de assets:
		var familia:string;
		for (var i = 0; i < this.desarrolladorService.enemigos.enemigos.length; ++i) {
			familia= this.desarrolladorService.enemigos.enemigos[i].familia;
			familia= familia.toLowerCase().replace(/ /g,'_').replace(/ñ/g,'n');
			this.desarrolladorService.enemigos.enemigos[i].familia= familia;
		}

        //Inicializar selección Tile:
        //this.seleccionarTile({x:0,y:0});

		setTimeout(()=>{    
      		this.appService.mostrarPantallacarga(false);
            //this.desarrolladorService.abrirTrigger("inmap",{})
 		}, 3000);

		return;
	}

	ngAfterViewChecked() {        

        //this.scrollToBottom();      

        //Centrado de mapa:
		//this.canvasMapa.nativeElement.scrollTop = 300
		//this.canvasMapa.nativeElement.scrollLeft = 500

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

	renderDatoSeleccionado(datoSeleccionado:string){
		if(this.desarrolladorService.archivoSeleccionado==datoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderBotonAddSeleccionado(datoSeleccionado:string){
		if(this.desarrolladorService.estadoPanelDatosDerecha==datoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderIconoDatosSeleccionado(datoSeleccionado:string){
		if(this.desarrolladorService.estadoHerramientaDatos==datoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderClaseSeleccionada(claseSeleccionada:string){
		if(this.desarrolladorService.claseSeleccionada==claseSeleccionada){
			return "seleccionado"
		}else{
			return ""
		}
	}
    
	renderTipoObjetoSeleccionado(tipoObjetoSeleccionado:string){
		if(this.desarrolladorService.tipoObjetoSeleccionado==tipoObjetoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderOpcionDatoSeleccionado(opcionSeleccionado:string){
		if(this.desarrolladorService.estadoDatos==opcionSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

	renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
		switch(opcionSeleccionado){
			case "subanimacion":
				if(this.desarrolladorService.subanimacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "sonido":
				break;
			case "hechizo":
				if(this.desarrolladorService.hechizoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "buff":
				if(this.desarrolladorService.buffSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "animaciones":
				if(this.desarrolladorService.animacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "orden":
				if(this.desarrolladorService.ordenSeleccionadaIndex==indiceSeleccionado){return "seleccionado"}
				break;
		}
		return "";
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

	zoomMapaIsometrico(zoom:number){
		this.escalaMapaIsometrico += zoom;
		this.escalaMapaIsometrico = parseFloat(this.escalaMapaIsometrico.toFixed(2))

        //console.log(this.canvasMapa)
		//this.canvasMapa.nativeElement.scrollTop = 8281
		//this.canvasMapa.nativeElement.scrollLeft = 12400
	}

    posicionarMapaIsometrico(){
        //console.log(this.canvasMapa)
		this.canvasMapa.nativeElement.scrollTop = 8281
		this.canvasMapa.nativeElement.scrollLeft = 12400
    }

    renderizarSelector(opcion:string){

        if(opcion == 'add' && this.desarrolladorService.opcionesDesarrolloInMap.herramientaInMap == 'add'){
            return "opcion seleccionado";
        }

        if(opcion == 'eliminar' && this.desarrolladorService.opcionesDesarrolloInMap.herramientaInMap == 'eliminar'){
            return "opcion seleccionado";
        }

        if(opcion == 'base' && !this.desarrolladorService.opcionesDesarrolloInMap.opcionOverlay){
            return "opcion seleccionado";
        }

        if(opcion == 'overlay' && this.desarrolladorService.opcionesDesarrolloInMap.opcionOverlay){
            return "opcion seleccionado";
        }

        //Selector Formularios Tiles:
        if(opcion == 'general' && this.desarrolladorService.opcionPropiedades=="general"){
            return "opcion seleccionado";
        }
        if(opcion == 'terreno' && this.desarrolladorService.opcionPropiedades=="terreno"){
            return "opcion seleccionado";
        }
        if(opcion == 'trigger' && this.desarrolladorService.opcionPropiedades=="trigger"){
            return "opcion seleccionado";
        }
        if(opcion == 'misiones' && this.desarrolladorService.opcionPropiedades=="misiones"){
            return "opcion seleccionado";
        }

        return "opcion";
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

		for(var i =0; i <this.desarrolladorService.mazmorra.salas.length; i++){
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

    copiarTile(tileCopia:any){
        this.desarrolladorService.seleccionarImgTile(tileCopia);
    }

    async seleccionarTile(coordenadas:any){

        //Tile Seleccionado:

        //Guardar formulario de tile seleccionado anterior:
        if(!coordenadas.ignoraGuardado){
            await this.desarrolladorService.setTile(coordenadas.xAntigua,coordenadas.yAntigua,this.formInMapGeneral.value,this.formInMapTerreno.value,this.formInMapTrigger.value,this.formInMapMisiones.value)
        }
        //Asigna Coordenadas Seleccionada: 
        this.coordenadaSeleccionadaX= coordenadas.x;
        this.coordenadaSeleccionadaY= coordenadas.y;

        //Actualizar fomulario:
        var valoresFormulario = await this.desarrolladorService.getTile(coordenadas["x"],coordenadas["y"])

        console.log("VALORES:");
        console.log(valoresFormulario);

        //Cambiar string NULL por valor null:
        for (const property in valoresFormulario) {
            if(valoresFormulario[property]=="null"){
                valoresFormulario[property]=null
            }
        }

	    var formInMapGeneral = {
  	        inMapNombre: valoresFormulario.nombre, 
  	        inMapDescripcion: valoresFormulario.descripcion,
  	        inMapIndicador: valoresFormulario.indicador
        };

	//Campos Campos InMap Terreno:
	    var formInMapTerreno = {
  	        inMapTipoTerreno: valoresFormulario.tipoTerreno, 
  	        inMapAtravesable: valoresFormulario.atravesable,
            inMapInspeccionable: valoresFormulario.inspeccionable,
            inMapMensajeInsapeccionable: valoresFormulario.mensajeInspeccion,
  	        inMapUbicacionEspecial: valoresFormulario.ubicacionEspecial 
	    };

	//Campos Campos InMap Eventos:
	    var formInMapTrigger = {
  	        inMapProbabilidadRandom: valoresFormulario.probabilidadEvento,
  	        inMapCategoriaRandom: valoresFormulario.categoriaEvento,
  	        inMapLootProb: "",
  	        inMapLootId: "" 
	    };

	//Campos Campos InMap Misiones:
	    var formInMapMisiones = {
	    };

	    this.formInMapGeneral.setValue(formInMapGeneral);
	    this.formInMapTerreno.setValue(formInMapTerreno);
	    this.formInMapTrigger.setValue(formInMapTrigger);
	    this.formInMapMisiones.setValue(formInMapMisiones);
        
        console.log(this.formInMapTerreno)

    }
    
    async abrirTrigger(tipo: string){

        //Carga los triggers en función del tipo:
        var trigger = {}
        var tile = {}

        switch(tipo){
            case "inmap-evento":
                tile = await this.desarrolladorService.getTile(this.coordenadaSeleccionadaX,this.coordenadaSeleccionadaY)
                trigger= tile["triggersInMapEventos"]
                break;
            case "inmap-mision":
                tile = await this.desarrolladorService.getTile(this.coordenadaSeleccionadaX,this.coordenadaSeleccionadaY)
                trigger= tile["triggersInMapMisiones"]
                break;
        }

        //Abre el dialogo de Gestion de Triggers:
        this.desarrolladorService.abrirTrigger(tipo,trigger);

    }


}




