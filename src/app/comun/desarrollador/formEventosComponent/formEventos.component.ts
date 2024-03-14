

import { Component , Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup,FormArray} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";
import { datosDefecto } from "../datosDefecto"

@Component({
  selector: 'formEventosComponent',
  templateUrl: './formEventos.component.html',
  styleUrls: ['./formEventos.component.sass']
})

export class FormEventosComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

  	readonly tiposOrdenes = ["Condición","Variable","Misión","Trigger","Diálogo","Hechizo","Loot","Enemigo","Mazmorra","Multimedia","Tiempo"];

    //Form Group:
  	public formEvento: UntypedFormGroup;
  	public formOrden: UntypedFormGroup;
  	public formParametrosOrden: UntypedFormGroup;
  	public formOrdenCondicion: UntypedFormGroup;
  	public formOrdenVariable: UntypedFormGroup;
  	public formOrdenMision: UntypedFormGroup;
  	public formOrdenTrigger: UntypedFormGroup;
  	//public formOrdenDialogo: UntypedFormGroup;
  	public formOrdenMultimedia: UntypedFormGroup;
  	public formOrdenHechizo: UntypedFormGroup;
  	public formOrdenLoot: UntypedFormGroup;
  	public formOrdenLootObjeto: UntypedFormGroup;
  	public formOrdenEnemigo: UntypedFormGroup;
  	public formOrdenTiempo: UntypedFormGroup;
  	public formOrdenMazmorra: UntypedFormGroup;

    //Tipos de dialogos:
  	public formOrdenDialogoTipoDialogo: UntypedFormGroup;

	//Campos Datos Eventos:
  	public id_Evento = new UntypedFormControl({value: 0, disabled:true});
  	public nombre_Evento = new UntypedFormControl('???');
  	public categoria_Evento = new UntypedFormControl('?');

	//Campos Datos Orden:
  	public id_Orden = new UntypedFormControl({value: 0, disabled:true});
  	public nombre_Orden = new UntypedFormControl('???');
  	public tipo_Orden = new UntypedFormControl({value: null, disabled: true});
  	public variable_Orden_Parametro = new UntypedFormControl('?');

	//Campos Datos Eventos (Condición):
  	public id_Orden_Condicion = new UntypedFormControl('?');
  	public variable_Orden_Condicion = new UntypedFormControl('?');
  	public valorVariable_Orden_Condicion = new UntypedFormControl('?');
  	public operador_Orden_Condicion = new UntypedFormControl('Igual');
  	public tipoEncadenadoTrue_Orden_Condicion = new UntypedFormControl('?');
  	public encadenadoTrue_Orden_Condicion = new UntypedFormControl(0);
  	public tipoEncadenadoFalse_Orden_Condicion = new UntypedFormControl('?');
  	public encadenadoFalse_Orden_Condicion = new UntypedFormControl(0);

	//Campos Datos Eventos (Variable):
  	public id_Orden_Variable = new UntypedFormControl('?');
  	public comando_Orden_Variable = new UntypedFormControl('?');
  	public variableTarget_Orden_Variable = new UntypedFormControl('?');
  	public valorNuevo_Orden_Variable = new UntypedFormControl('?');
  	public valorOperador_Orden_Variable = new UntypedFormControl('?');

	//Campos Datos Eventos (Dialogo):
  	public id_Orden_Dialogo = new UntypedFormControl('?');
  	public tipoDialogo_Orden_Dialogo = new UntypedFormControl('?');

    //Campos Eventos Dialogo Subtipo:
  	public titulo_Orden_Dialogo = new UntypedFormControl('?');
  	public contenido_Orden_Dialogo = new UntypedFormControl('?');
    public tipoImagen_Orden_Dialogo = new UntypedFormControl('');
    public imagenId_Orden_Dialogo = new UntypedFormControl(0);

  	public textoOpcion_Orden_Dialogo = new UntypedFormControl([]);
  	public encadenadoOpcion_Orden_Dialogo = new UntypedFormControl([]);

  	public opciones_Orden_Dialogo = new UntypedFormControl([]);
  	public interlocutor_Orden_Dialogo = new UntypedFormControl(null);
  	public ordenEncadenado_Orden_Dialogo = new UntypedFormControl(null);
  	public mostrarPersonajeDerecha_Orden_Dialogo = new UntypedFormControl(false);
  	public mostrarPersonajeIzquierda_Orden_Dialogo = new UntypedFormControl(false);
  	public tipoPersonajeDerecha_Orden_Dialogo = new UntypedFormControl("npc");
  	public tipoPersonajeIzquierda_Orden_Dialogo = new UntypedFormControl("npc");
  	public imagenPersonajeDerecha_Orden_Dialogo = new UntypedFormControl(0);
  	public imagenPersonajeIzquierda_Orden_Dialogo = new UntypedFormControl(0);
  	public nombrePersonajeDerecha_Orden_Dialogo = new UntypedFormControl("Personaje 1");
  	public nombrePersonajeIzquierda_Orden_Dialogo = new UntypedFormControl("Personaje 2");

	//Campos Datos Eventos (Mision):
  	public id_Orden_Mision = new UntypedFormControl('?');
  	public comando_Orden_Mision = new UntypedFormControl('?');
  	public misionId_Orden_Mision = new UntypedFormControl('?');
  	public tareaId_Orden_Mision = new UntypedFormControl('?');
  	public valorOperador_Orden_Mision = new UntypedFormControl('?');

	//Campos Datos Eventos (Trigger):
  	public id_Orden_Trigger = new UntypedFormControl('?');
  	public comando_Orden_Trigger = new UntypedFormControl('?');
  	public triggerId_Orden_Trigger = new UntypedFormControl('?');
  	public trigger_Orden_Trigger = new UntypedFormControl('?');

	//Campos Datos Eventos (Multimedia):
  	public id_Orden_Multimedia = new UntypedFormControl('?');
  	public comando_Orden_Multimedia = new UntypedFormControl('?');
  	public tipoMultimedia_Orden_Multimedia = new UntypedFormControl('?');
  	public nombreAsset_Orden_Multimedia = new UntypedFormControl('?');

	//Campos Datos Eventos (Hechizo):
  	public id_Orden_Hechizo = new UntypedFormControl('?');
  	public comando_Orden_Hechizo = new UntypedFormControl('?');
  	public hechizoId_Orden_Hechizo = new UntypedFormControl('?');
  	public objetivo_Orden_Hechizo = new UntypedFormControl('?');
  	public heroeObjetivoId_Orden_Hechizo = new UntypedFormControl('?');
  	public enemigoObjetivoId_Orden_Hechizo = new UntypedFormControl('?');

	//Campos Datos Eventos (Loot):
  	public id_Orden_Loot = new UntypedFormControl('?');
  	public comando_Orden_Loot = new UntypedFormControl('?');
  	public objetivo_Orden_Loot = new UntypedFormControl('?');
  	public oro_Orden_Loot = new UntypedFormControl('?');
  	public exp_Orden_Loot = new UntypedFormControl('?');

	//Campos Datos Eventos (Loot - Objeto):
  	public generado_Objeto_Loot = new UntypedFormControl('?');
  	public objetoId_Objeto_Loot = new UntypedFormControl(0);
  	public probTipo_Objeto_Loot = new UntypedFormControl('?');
  	public probRareza_Objeto_Loot = new UntypedFormControl(0);
  	public nivelMax_Objeto_Loot = new UntypedFormControl(0);
  	public nivelMin_Objeto_Loot = new UntypedFormControl(0);

	//Campos Datos Eventos (Enemigo):
  	public id_Orden_Enemigo = new UntypedFormControl('?');
  	public comando_Orden_Enemigo = new UntypedFormControl('?');
  	public idEnemigo_Orden_Enemigo = new UntypedFormControl('?');
  	public tipoEnemigo_Orden_Enemigo = new UntypedFormControl('?');

	//Campos Datos Eventos (Tiempo):
  	public id_Orden_Tiempo = new UntypedFormControl('?');
  	public comando_Orden_Tiempo = new UntypedFormControl('?');
  	public dias_Orden_Tiempo = new UntypedFormControl('?');

	//Campos Datos Eventos (Mazmorra):
  	public id_Orden_Mazmorra = new UntypedFormControl('?');
  	public comando_Orden_Mazmorra = new UntypedFormControl('?');
  	public mazmorraId_Orden_Mazmorra = new UntypedFormControl('?');
  	public salaOpenId_Orden_Mazmorra = new UntypedFormControl(0);

    private flagEvitarChangeDetection: boolean = false;

		//Inicializacion formulario Orden Dialogo:
	    public formOrdenDialogo = this.formBuilder.group({
            tipoDialogo: this.tipoDialogo_Orden_Dialogo,
            titulo: this.titulo_Orden_Dialogo,
            contenido: this.contenido_Orden_Dialogo,
            tipoImagen: this.tipoImagen_Orden_Dialogo,
            imagenId: this.imagenId_Orden_Dialogo,
            opciones: this.formBuilder.array([]),
            interlocutor: this.interlocutor_Orden_Dialogo,
            ordenEncadenado: this.ordenEncadenado_Orden_Dialogo,
            mostrarPersonajeDerecha: this.mostrarPersonajeDerecha_Orden_Dialogo,
            mostrarPersonajeIzquierda: this.mostrarPersonajeIzquierda_Orden_Dialogo,
            tipoPersonajeDerecha: this.tipoPersonajeDerecha_Orden_Dialogo,
            tipoPersonajeIzquierda: this.tipoPersonajeIzquierda_Orden_Dialogo,
            imagenPersonajeDerecha: this.imagenPersonajeDerecha_Orden_Dialogo,
            imagenPersonajeIzquierda: this.imagenPersonajeIzquierda_Orden_Dialogo,
            nombrePersonajeDerecha: this.nombrePersonajeDerecha_Orden_Dialogo,
            nombrePersonajeIzquierda: this.nombrePersonajeIzquierda_Orden_Dialogo
        });

    public eventoSeleccionadoIndex = 0;
    public eventoSeleccionadoId = 0;
    public tipoOrdenSeleccionada = "Condición";
    public ordenSeleccionadaIndex = null;

	@Input() eventos: any = [];
	@Input() esMazmorra: boolean = false;

    @Output() eventosChange = new EventEmitter<any>();
    @Output() testEventoEmitter = new EventEmitter<any>();

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Eventos:
	    this.formEvento = this.formBuilder.group({
			id: this.id_Evento,
            nombre: this.nombre_Evento,
            categoria: this.categoria_Evento
        });

		//Inicializacion formulario Orden:
	    this.formOrden = this.formBuilder.group({
			id: this.id_Orden,
            nombre: this.nombre_Orden,
            tipo: this.tipo_Orden
        });

		//Inicializacion formulario Orden Condicion:
	    this.formOrdenCondicion = this.formBuilder.group({
            variable: this.variable_Orden_Condicion,
            operador: this.operador_Orden_Condicion,
            valorVariable: this.valorVariable_Orden_Condicion,
            tipoEncadenadoTrue: this.tipoEncadenadoTrue_Orden_Condicion,
            encadenadoTrue: this.encadenadoTrue_Orden_Condicion,
            tipoEncadenadoFalse: this.tipoEncadenadoFalse_Orden_Condicion,
            encadenadoFalse: this.encadenadoFalse_Orden_Condicion,
        });

		//Inicializacion formulario Orden Variable:
	    this.formOrdenVariable = this.formBuilder.group({
            comando: this.comando_Orden_Variable,
            variableTarget: this.variableTarget_Orden_Variable,
            valorNuevo: this.valorNuevo_Orden_Variable,
            valorOperador: this.valorOperador_Orden_Variable
        });


		//Inicializacion formulario Orden Mision:
	    this.formOrdenMision = this.formBuilder.group({
            comando: this.comando_Orden_Mision,
            misionId: this.misionId_Orden_Mision,
            tareaId: this.tareaId_Orden_Mision
        });

		//Inicializacion formulario Orden Trigger:
	    this.formOrdenTrigger = this.formBuilder.group({
            comando: this.comando_Orden_Trigger,
            triggerId: this.triggerId_Orden_Trigger,
            trigger: this.trigger_Orden_Trigger
        });

		//Inicializacion formulario Orden Multimedia:
	    this.formOrdenMultimedia = this.formBuilder.group({
            comando: this.comando_Orden_Multimedia,
            tipoMultimedia: this.tipoMultimedia_Orden_Multimedia,
            nombreAsset: this.nombreAsset_Orden_Multimedia
        });

		//Inicializacion formulario Orden Hechizo:
	    this.formOrdenHechizo = this.formBuilder.group({
            comando: this.comando_Orden_Hechizo,
            hechizoId: this.heroeObjetivoId_Orden_Hechizo,
            objetivoOrden: this.objetivo_Orden_Hechizo,
            heroeObjetivoId: this.heroeObjetivoId_Orden_Hechizo,
            enemigoObjetivoId: this.enemigoObjetivoId_Orden_Hechizo
        });

		//Inicializacion formulario Orden Loot:
	    this.formOrdenLoot = this.formBuilder.group({
            comando: this.comando_Orden_Loot,
            objetivo: this.objetivo_Orden_Loot,
            oro: this.oro_Orden_Loot,
            exp: this.exp_Orden_Loot
        });

		//Inicializacion formulario Orden Loot-Objeto:
	    this.formOrdenLootObjeto = this.formBuilder.group({
            generado: this.generado_Objeto_Loot,
            objetoId: this.objetoId_Objeto_Loot,
            probTipo: this.probTipo_Objeto_Loot,
            probRareza: this.probRareza_Objeto_Loot,
            nivelMin: this.nivelMin_Objeto_Loot,
            nivelMax: this.nivelMax_Objeto_Loot
        });

		//Inicializacion formulario Orden Enemigo:
	    this.formOrdenEnemigo = this.formBuilder.group({
            comando: this.comando_Orden_Enemigo,
            idEnemigo: this.idEnemigo_Orden_Enemigo,
            tipoEnemigo: this.tipoEnemigo_Orden_Enemigo
        });

		//Inicializacion formulario Orden Tiempo:
	    this.formOrdenTiempo = this.formBuilder.group({
            comando: this.comando_Orden_Tiempo,
            dias: this.dias_Orden_Tiempo
        });

		//Inicializacion formulario Orden Mazmorra:
	    this.formOrdenMazmorra = this.formBuilder.group({
            comando: this.comando_Orden_Mazmorra,
            mazmorraId: this.mazmorraId_Orden_Mazmorra,
            salaOpenId: this.salaOpenId_Orden_Mazmorra
        });

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe((val) => {
                this.reloadForm(val);
            }) // Fin Suscripcion

		//Suscripcion de cambios formulario Eventos:
		this.formEvento.valueChanges.subscribe((val) =>{
			if(this.eventoSeleccionadoIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && key!="ordenes") {
				    this.eventos[this.eventoSeleccionadoIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Ordenes:
		this.formOrden.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key=="id"||key=="tipo"||key=="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Condicion):
		this.formOrdenCondicion.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Variables):
		this.formOrdenVariable.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Dialogo):
		this.formOrdenDialogo.valueChanges.subscribe((val) =>{
            if(this.flagEvitarChangeDetection){return;}
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Mision):
		this.formOrdenMision.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			//console.log(val)
            this.eventosChange.emit(this.eventos);
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Trigger):
		this.formOrdenTrigger.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Multimedia):
		this.formOrdenMultimedia.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Loot):
		this.formOrdenLoot.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Hechizo):
		this.formOrdenHechizo.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Enemigo):
		this.formOrdenEnemigo.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Tiempo):
		this.formOrdenTiempo.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Mazmorra):
		this.formOrdenMazmorra.valueChanges.subscribe((val) =>{
			if(this.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
            this.eventosChange.emit(this.eventos);
			//console.log(val)
		});

        this.seleccionarEvento({tipo: "evento",index: 0})

    } //Fin OnInit

    reloadForm(val: string){
        switch (val) {
            case "reloadFormEventos":
                //Formulario Evento:
                this.formEvento.patchValue(this.eventos[this.eventoSeleccionadoIndex]);

                //Formulario Orden:
                if(this.eventos[this.eventoSeleccionadoIndex]?.ordenes){
                    this.formOrden.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                }

                //Formulario Parametros Orden:
                //this.formParametrosOrden.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);

                switch(this.tipoOrdenSeleccionada){
                    case "condicion":
                    this.formOrdenCondicion.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "variable":
                    this.formOrdenVariable.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "dialogo":

                    var orden = this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]

                    this.flagEvitarChangeDetection = true;
                    this.formOrdenDialogo.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    var formArray = this.formBuilder.array([]);
                    for(var i=0; i < orden.opciones.length; i++){
                       formArray.push(this.formBuilder.group({
                           textoOpcion: orden.opciones[i].textoOpcion,
                           ordenIdEncadanado: orden.opciones[i].ordenIdEncadanado
                       }))
                    }
                    this.formOrdenDialogo.setControl('opciones', formArray);
                    this.flagEvitarChangeDetection = false;
                    break;
                    case "mision":
                    this.formOrdenMision.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "trigger":
                    this.formOrdenTrigger.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "multimedia":
                    this.formOrdenMultimedia.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "loot":
                    this.formOrdenLoot.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "hechizo":
                    this.formOrdenHechizo.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "enemigo":
                    this.formOrdenEnemigo.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "tiempo":
                    this.formOrdenTiempo.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                    case "mazmorra":
                    this.formOrdenMazmorra.patchValue(this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex]);
                    break;
                }
            break;
        }
    }//Fin Reload Form.

	renderListaSeleccionado(indexOrden:number){
        if(this.ordenSeleccionadaIndex == indexOrden){
            return "seleccionado"
        }
		return "";
	}

	renderBotonAddSeleccionado(datoSeleccionado:string){
		if(this.desarrolladorService.estadoPanelDatosDerecha==datoSeleccionado){
			return "seleccionado"
		}else{
			return ""
		}
	}

    formatearTipoOrden(tipoOrden:string){
        var orden = tipoOrden.toLowerCase();

        switch(tipoOrden){
            case "Condición":
                orden = "condicion";
                break;
            case "Misión":
                orden = "mision";
                break;
            case "Diálogo":
                orden = "dialogo";
                break;
            case "Tiempo":
                orden = "animacion";
                break;
        }
        return orden;
    }

    renderizarOrdenSeleccionada(tipoOrden:string){
        tipoOrden = this.formatearTipoOrden(tipoOrden)
        var clase = {};
        if(tipoOrden.toLowerCase() == this.tipoOrdenSeleccionada){
            clase = {
                "background-color": "white",
                "color": "black"
            }
        }
        return clase;
    }

    addOpcion() {
        const opcionForm = this.formBuilder.group({
            textoOpcion: "",
            ordenIdEncadanado: 0
        });
        this.opciones.push(opcionForm);
    }

    eliminarOpcion(indexOpcion: number){
        this.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex].opciones.splice(indexOpcion,1)
        this.seleccionarOrden(this.ordenSeleccionadaIndex)
    }

     get opciones() {
        return this.formOrdenDialogo.controls["opciones"] as FormArray;
    }

    seleccionarEvento(selector){
        this.eventoSeleccionadoIndex = selector["index"];
        this.ordenSeleccionadaIndex = null;
        if(this.eventos[this.eventoSeleccionadoIndex]){
            this.eventoSeleccionadoId = this.eventos[this.eventoSeleccionadoIndex].id;
        }else{
            this.eventoSeleccionadoId = 0;
        }
        this.tipoOrdenSeleccionada = null;
        console.log("Seleccionando Evento: " + this.eventos[this.eventoSeleccionadoIndex]);
        this.reloadForm("reloadFormEventos");
        return;
    }

    seleccionarOrden(ordenIndex:number){
        console.log(this.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex]);
        this.ordenSeleccionadaIndex = ordenIndex;
        this.tipoOrdenSeleccionada = this.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex].tipo;
        console.log("Seleccionando Orden: " + this.eventos[this.eventoSeleccionadoIndex].ordenes[ordenIndex]);
        this.reloadForm("reloadFormEventos");
        return;
    }

    addEvento(){
        this.eventos.push(Object.assign({},datosDefecto.eventos));
        this.eventos.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.eventos);
        this.eventos.at(-1)["nombre"]= "Evento "+this.eventos.length;
        this.eventos.at(-1)["ordenes"]= [];
        this.seleccionarEvento({tipo: "evento",index: this.eventos.length-1})
    }

    eliminarEvento(){
        //Elimina el evento seleccionado:
        this.eventos.splice(this.eventoSeleccionadoIndex,1);
        if(this.eventoSeleccionadoIndex>0){
            this.eventoSeleccionadoIndex -= 1;
        }
        this.tipoOrdenSeleccionada = null;
        this.ordenSeleccionadaIndex = null;
        this.reloadForm("reloadFormEventos");
    }

    seleccionarTipoOrden(tipoOrden:string){
        console.log("Seleccionando Tipo Orden: " + tipoOrden);
        this.tipoOrdenSeleccionada = tipoOrden;
        return;
    }

    ordenarOrden(comando: "subir"|"bajar"){
        if(this.ordenSeleccionadaIndex == null){return;}
        var indexOrigen = this.ordenSeleccionadaIndex;
        var indexDestino = 0;

        if(comando=="subir"){
            indexDestino = indexOrigen-1;
        }else{
            indexDestino = indexOrigen+1;
        }

        //Evitar Swap imposible:
        if(indexOrigen == indexDestino){
            return;
        }else if(indexDestino < 0){
            console.warn("Evitando Swap por overflow")
            return;
        }else if(indexDestino > this.eventos[this.eventoSeleccionadoIndex].ordenes.length-1){
            console.warn("Evitando Swap por overflow")
            return;
        }

        //Comando Swap:
        this.eventos[this.eventoSeleccionadoIndex].ordenes[indexOrigen] = this.eventos[this.eventoSeleccionadoIndex].ordenes.splice(indexDestino, 1, this.eventos[this.eventoSeleccionadoIndex].ordenes[indexOrigen])[0];
        this.ordenSeleccionadaIndex = indexDestino;
        return;

    }

    addOrden(tipoOrden: string){

        var idDisponible = this.desarrolladorService.findAvailableID(this.eventos[this.eventoSeleccionadoIndex].ordenes);

          //Inicialización de campos de Ordenes:
          switch(tipoOrden){
              case "condicion":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push(new Object({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      variable: null,
                      valorVariable: null,
                      operador: null,
                      tipoEncadenadoTrue: null,
                      encadenadoTrue: null,
                      tipoEncadenadoFalse: null,
                      encadenadoFalse: null
                  }));
              break;
              case "variable":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      variableTarget: null,
                      valorNuevo: null,
                      valorOperador: null
                  });
              break;
              case "mision":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      mision_id: null,
                      tarea_id: null
                  });
              break;
              case "trigger":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      trigger_id: null,
                      trigger: null
                  });
              break;
              case "dialogo":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push(new Object({
                      id: idDisponible,
                      nombre: "Nuevo "+tipoOrden,
                      tipo: tipoOrden,
                      tipoDialogo: null,
                      contenido: null,
                      opciones: [],
                      encadenadoId: null,
                      tipoEncadenado: null
                  }));
              break;
              case "multimedia":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      tipoMultimedia: null,
                      nombreAsset: null
                  });
              break;
              case "loot":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      objetivo: null,
                      oro: 0,
                      exp: 0,
                      objetos: null,
                  });
              break;
              case "enemigo":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      idEnemigo: null,
                      tipoEnemigo: null
                  });
              break;
              case "mazmorra":
                  this.eventos[this.eventoSeleccionadoIndex].ordenes.push({
                      id: idDisponible,
                      nombre: "Nueva "+tipoOrden,
                      tipo: tipoOrden,
                      comando: null,
                      mazmorraId: null,
                      salaOpenId: null
                  });
              break;
          }

          this.tipoOrdenSeleccionada = tipoOrden;
          this.ordenSeleccionadaIndex = this.eventos[this.eventoSeleccionadoIndex].ordenes.length-1;
          this.reloadForm("reloadFormEventos");

        return;
    }

    eliminarOrden(){
        //Elimina la orden Seleccionada:
          this.eventos[this.eventoSeleccionadoIndex].ordenes.splice(this.ordenSeleccionadaIndex,1);
          this.ordenSeleccionadaIndex = null;
          this.tipoOrdenSeleccionada = null;
          /*
          if(this.ordenSeleccionadaIndex>0){
              this.ordenSeleccionadaIndex -= 1;
          }
          this.tipoOrdenSeleccionada = this.eventos.eventos[this.eventoSeleccionadoIndex].ordenes[this.ordenSeleccionadaIndex].tipo;
          */
          this.reloadForm("reloadFormEventos");
    }

    testEvento(){
        this.eventosChange.emit(this.eventos);
        this.testEventoEmitter.emit(this.eventoSeleccionadoId);
        //this.desarrolladorService.testEvento(this.eventoSeleccionadoId);
    }

    copiarOrden(event: any,indexOrdenCopiar: number){
        if(event.which===3){

            this.eventos[this.eventoSeleccionadoIndex].ordenes.push(Object.assign({},this.eventos[this.eventoSeleccionadoIndex].ordenes[indexOrdenCopiar]));

            this.eventos[this.eventoSeleccionadoIndex].ordenes.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.eventos[this.eventoSeleccionadoIndex].ordenes);
            this.eventos[this.eventoSeleccionadoIndex].ordenes.at(-1)["nombre"]+= "_COPY";

            this.ordenSeleccionadaIndex = this.eventos[this.eventoSeleccionadoIndex].ordenes.length-1;

            this.seleccionarOrden(this.ordenSeleccionadaIndex)

        }
    }

    copiarEvento(indexEventoCopiar: number){
        console.log("COPIANDO:",indexEventoCopiar)

        this.eventos.push(Object.assign({},this.eventos[indexEventoCopiar]));

        this.eventos.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.eventos);
        this.eventos.at(-1)["nombre"]+= "_COPY";

        this.eventoSeleccionadoIndex = this.eventos.length-1;

        this.seleccionarEvento({tipo: "evento",index: this.eventoSeleccionadoIndex});
    }


}








