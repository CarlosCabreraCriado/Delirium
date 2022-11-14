
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

  	private desarrolladorSuscripcion: Subscription = null;

  	//Variables Parametros Enemigos:
  	private mostrarTipoEnemigo: boolean= false;

  	//Formularios
  	private formGeneral: FormGroup;
  	private formSala: FormGroup;
  	private formEnemigos: FormGroup;
  	private formEventos: FormGroup;
  	private formDialogos: FormGroup;
  	private formAsignarSala: FormGroup;
  	private formAsignarEvento: FormGroup;
  	private formHechizos: FormGroup;
  	private formBuff: FormGroup;
  	private formAnimaciones: FormGroup;
  	private formSubanimacion: FormGroup;
  	private formSonidos: FormGroup;
  	private formInMapGeneral: FormGroup;
  	private formInMapTerreno: FormGroup;
  	private formInMapEventos: FormGroup;
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

	//Campos Eventos:
	private id_evento = new FormControl('0');
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

  	//Campos Hechizos:
  	private id_Hechizos = new FormControl('0');
  	private nombre_Hechizos = new FormControl('???');
    private descripcion_Hechizos = new FormControl('????????');
    private animacion_Hechizos = new FormControl('1');
    private distancia_Hechizos = new FormControl('1');
    private objetivo_Hechizos = new FormControl('EU');
    private tipo_dano_Hechizos = new FormControl('F');
    private dano_Hechizos = new FormControl('0');
    private heal_Hechizos = new FormControl('0');
    private escudo_Hechizos = new FormControl('0');
    private amenaza_Hechizos = new FormControl('1');
    private energia_Hechizos = new FormControl('0');
    private poder_Hechizos = new FormControl('0');
    private funcion_Hechizos = new FormControl('');

  	//Campos Buff:
  	private id_Buff = new FormControl('0');
  	private nombre_Buff = new FormControl('???');
    private descripcion_Buff = new FormControl('????????');
    private duracion_Buff = new FormControl('????????');
    private tipo_dano_Buff = new FormControl('F');
    private animacion_Buff = new FormControl('1');
    private dano_Buff = new FormControl('0');
    private heal_Buff = new FormControl('0');
    private escudo_Buff = new FormControl('0');
    private dano_T_Buff = new FormControl('0');
    private heal_T_Buff = new FormControl('0');
    private escudo_T_Buff = new FormControl('0');
    private stat_inc_Buff = new FormControl('0');
    private stat_inc_inicial_Buff = new FormControl('0');
    private stat_inc_T_Buff = new FormControl('0');
    private funcion_Buff = new FormControl('');

  	//Campos Animaciones:
  	private id_Animaciones = new FormControl('0');
  	private nombre_Animaciones = new FormControl('???');
    private duracion_Animaciones = new FormControl('0');
    private subanimaciones_Animaciones = new FormControl('0');
    private sonidos_Animaciones = new FormControl('0');

	//Campos Subanimacion:
  	private id_Subanimacion = new FormControl(0);
  	private nombre_Subanimacion = new FormControl('???');
  	private sprite_id_Subanimacion = new FormControl('0');
    private duracion_Subanimacion = new FormControl('0');
    private num_frames_Subanimacion = new FormControl('1');
    private frame_ref_Subanimacion = new FormControl('0');

    private hue_Subanimacion = new FormControl('0');
    private sepia_Subanimacion = new FormControl('0');
    private brillo_Subanimacion = new FormControl('0');
    private saturacion_Subanimacion = new FormControl('0');

    private delay_Subanimacion = new FormControl('0');
    private offsetx_Subanimacion = new FormControl('0');
    private offsety_Subanimacion = new FormControl('0');

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
  	private inMapVisitado = new FormControl('0');
  	private inMapUbicacionEspecial = new FormControl('0');

	//Campos Campos InMap Eventos:
  	private inMapProbabilidadRandom = new FormControl(0);
  	private inMapCategoriaRandom = new FormControl('???');
  	private inMapCheckTrigger = new FormControl('0');
  	private inMapLootProb = new FormControl('0');
  	private inMapLootId = new FormControl('0');

	//Campos Campos InMap Misiones:
  	private inMapCheckMisiones = new FormControl(0);

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

		//Inicializacion formulario Hechizos:
	    this.formHechizos = this.formBuilder.group({
	    	id: this.id_Hechizos,
	    	nombre: this.nombre_Hechizos,
        	categoria: "",
        	tipo: "BASICO",
        	imagen_id: 0,
        	nivel: 1,
        	recurso: this.energia_Hechizos,
        	poder: this.poder_Hechizos,
        	acciones: 0,
        	distancia: this.distancia_Hechizos,
        	objetivo: this.objetivo_Hechizos,
        	tipo_daño: this.tipo_dano_Hechizos,
        	daño_dir: this.dano_Hechizos,
        	heal_dir: this.heal_Hechizos,
        	escudo_dir: this.escudo_Hechizos,
        	mod_amenaza: this.amenaza_Hechizos,
        	buff_id: 0, 
        	animacion_id: this.animacion_Hechizos, 
        	funcion: this.funcion_Hechizos,
        	hech_encadenado_id: 0, 
        	descripcion: this.descripcion_Hechizos
	    });

		//Inicializacion formulario Buff:
	    this.formBuff = this.formBuilder.group({
	    	id: this.id_Buff,
	    	nombre: this.nombre_Buff,
        	duracion: this.duracion_Buff,
        	tipo: "BUFF",
        	imagen_id: 1,
        	tipo_daño: this.tipo_dano_Buff,
        	daño_t: this.dano_T_Buff,
        	heal_t: this.heal_T_Buff,
        	escudo_t: this.escudo_T_Buff,
        	stat_inc: this.stat_inc_Buff,
        	stat_inc_inicial: this.stat_inc_inicial_Buff,
        	stat_inc_t: this.stat_inc_T_Buff,
        	animacion_id: this.animacion_Buff, 
        	funcion: this.funcion_Buff,
        	descripcion: this.descripcion_Buff
	    });

		//Inicializacion formulario Animaciones:
	    this.formAnimaciones = this.formBuilder.group({
	    	id: this.id_Animaciones,
	    	nombre: this.nombre_Animaciones,
        	duracion: this.duracion_Animaciones,
			subanimaciones: [],
			sonidos: []
	    });

		//Inicializacion formulario Subanimación:
	    this.formSubanimacion = this.formBuilder.group({
	    	id: this.desarrolladorService.subanimacionSeleccionadoIndex+1,
	    	nombre: this.nombre_Subanimacion,
        	duracion: this.duracion_Subanimacion,
        	sprite_id: this.sprite_id_Subanimacion,
        	frame_ref: this.frame_ref_Subanimacion,
        	num_frames: this.num_frames_Subanimacion,
        	hue_filter: this.hue_Subanimacion,
        	sepia: this.sepia_Subanimacion,
        	brillo: this.brillo_Subanimacion,
        	saturation: this.saturacion_Subanimacion,
        	delay: this.delay_Subanimacion,
        	offset_x: this.offsetx_Subanimacion,
        	offset_y: this.offsety_Subanimacion
	    });

		//Inicializacion formulario Eventos:
	    this.formEventos = this.formBuilder.group({
			id_evento: this.id_evento,
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
  	        inMapVisitado: this.inMapVisitado, 
  	        inMapUbicacionEspecial: this.inMapUbicacionEspecial 
	    });

	//Campos Campos InMap Eventos:
	    this.formInMapEventos = this.formBuilder.group({
  	        inMapProbabilidadRandom: this.inMapProbabilidadRandom,
  	        inMapCategoriaRandom: this.inMapCategoriaRandom,
  	        inMapCheckTrigger: this.inMapCheckTrigger, 
  	        inMapLootProb: this.inMapLootProb,
  	        inMapLootId: this.inMapLootId
	    });

	//Campos Campos InMap Misiones:
	    this.formInMapMisiones = this.formBuilder.group({
  	        inMapCheckMisiones: this.inMapCheckMisiones 
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

	          		this.formEnemigos.setValue(this.desarrolladorService.mazmorra["salas"][this.desarrolladorService.enemigoSeleccionadoSalaIndex].enemigos[this.desarrolladorService.enemigoSeleccionadoIndex]);
				
	          	break;
				
	          	case "reloadFormEventos":
				case "reloadForm":
	          		this.formEventos.setValue(this.desarrolladorService.mazmorra["eventos"][this.desarrolladorService.mazmorra.eventos.indexOf(this.desarrolladorService.mazmorra.eventos.find(i=> i.id_evento==this.desarrolladorService.eventoSeleccionadoId))]);
	          	break;

	          	case "reloadFormHechizos":
				case "reloadForm":
	          		this.formHechizos.setValue(this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex]);
	          	break;

	          	case "reloadFormBuff":
				case "reloadForm":
	          		this.formBuff.setValue(this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]);
	          	break;

	          	case "reloadFormAnimaciones":
				case "reloadForm":
					console.log(this.formAnimaciones)
					console.log(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex])

					//this.formAnimaciones.value.duracion = this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].duracion

	          		this.formAnimaciones.setValue(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex]);
	          	break;

	          	case "reloadFormSubAnimacion":
				case "reloadForm":
				console.log(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex])
	          		this.formSubanimacion.setValue(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex]);
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

		//Suscripcion de dambios formulario Hechizos:
		this.formHechizos.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.hechizoSeleccionadoIndex+1){
				this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex]= val;
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario BUFF:
		this.formBuff.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.buffSeleccionadoIndex+1){
				this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]= val;
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario Animaciones:
		this.formAnimaciones.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.animacionSeleccionadoIndex+1){
				this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex]= val;
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario Subanimacion:
		this.formSubanimacion.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.animacionSeleccionadoIndex+1 && this.desarrolladorService.subanimacionSeleccionadoIndex+1){
				this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex]= val;
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
		this.formInMapEventos.valueChanges.subscribe((val) =>{
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
		for (var i = 0; i < this.desarrolladorService.tipoEnemigos.enemigos_stats.length; ++i) {
			familia= this.desarrolladorService.tipoEnemigos.enemigos_stats[i].familia;
			familia= familia.toLowerCase().replace(/ /g,'_').replace(/ñ/g,'n');
			this.desarrolladorService.tipoEnemigos.enemigos_stats[i].familia= familia;
		}

        //Inicializar selección Tile:
        //this.seleccionarTile({x:0,y:0}, true);

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
            await this.desarrolladorService.setTile(coordenadas.xAntigua,coordenadas.yAntigua,this.formInMapGeneral.value,this.formInMapTerreno.value,this.formInMapEventos.value,this.formInMapMisiones.value)
        }

        //Actualizar fomulario:
        var valoresFormulario = this.desarrolladorService.getTile(coordenadas.x,coordenadas.y)

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
  	        inMapVisitado: valoresFormulario.visitado, 
  	        inMapUbicacionEspecial: "" 
	    };

	//Campos Campos InMap Eventos:
	    var formInMapEventos = {
  	        inMapProbabilidadRandom: valoresFormulario.probabilidadEvento,
  	        inMapCategoriaRandom: valoresFormulario.categoriaEvento,
  	        inMapCheckTrigger: valoresFormulario.checkEventos, 
  	        inMapLootProb: "",
  	        inMapLootId: "" 
	    };

	//Campos Campos InMap Misiones:
	    var formInMapMisiones = {
  	        inMapCheckMisiones: [] 
	    };

	    this.formInMapGeneral.setValue(formInMapGeneral);
	    this.formInMapTerreno.setValue(formInMapTerreno);
	    this.formInMapEventos.setValue(formInMapEventos);
	    this.formInMapMisiones.setValue(formInMapMisiones);
        
        this.desarrolladorService.seleccionarTile(coordenadas.x,coordenadas.y)

    }
}




