

import { Component , Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

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
  	private formEvento: UntypedFormGroup;
  	private formOrden: UntypedFormGroup;
  	private formParametrosOrden: UntypedFormGroup;
  	private formOrdenCondicion: UntypedFormGroup;
  	private formOrdenVariable: UntypedFormGroup;
  	private formOrdenMision: UntypedFormGroup;
  	private formOrdenTrigger: UntypedFormGroup;
  	private formOrdenDialogo: UntypedFormGroup;
  	private formOrdenMultimedia: UntypedFormGroup;
  	private formOrdenHechizo: UntypedFormGroup;
  	private formOrdenLoot: UntypedFormGroup;
  	private formOrdenLootObjeto: UntypedFormGroup;
  	private formOrdenEnemigo: UntypedFormGroup;
  	private formOrdenTiempo: UntypedFormGroup;
  	private formOrdenMazmorra: UntypedFormGroup;

	//Campos Datos Eventos:
  	private id_Evento = new UntypedFormControl({value: 0,disabled:true});
  	private nombre_Evento = new UntypedFormControl('???');
  	private categoria_Evento = new UntypedFormControl('?');

	//Campos Datos Orden:
  	private id_Orden = new UntypedFormControl({value: 0,disabled:true});
  	private nombre_Orden = new UntypedFormControl('???');
  	private tipo_Orden = new UntypedFormControl({value: null, disabled: true});

  	private variable_Orden_Parametro = new UntypedFormControl('?');

	//Campos Datos Eventos (Condición):
  	private id_Orden_Condicion = new UntypedFormControl('?');
  	private variable_Orden_Condicion = new UntypedFormControl('?');
  	private valorVariable_Orden_Condicion = new UntypedFormControl('?');
  	private operador_Orden_Condicion = new UntypedFormControl('Igual');
  	private tipoEncadenadoTrue_Orden_Condicion = new UntypedFormControl('?');
  	private encadenadoTrue_Orden_Condicion = new UntypedFormControl(0);
  	private tipoEncadenadoFalse_Orden_Condicion = new UntypedFormControl('?');
  	private encadenadoFalse_Orden_Condicion = new UntypedFormControl(0);
	
	//Campos Datos Eventos (Variable):
  	private id_Orden_Variable = new UntypedFormControl('?');
  	private comando_Orden_Variable = new UntypedFormControl('?');
  	private variableTarget_Orden_Variable = new UntypedFormControl('?');
  	private valorNuevo_Orden_Variable = new UntypedFormControl('?');
  	private valorOperador_Orden_Variable = new UntypedFormControl('?');

	//Campos Datos Eventos (Dialogo):
  	private id_Orden_Dialogo = new UntypedFormControl('?');
  	private tipoDialogo_Orden_Dialogo = new UntypedFormControl('?');
  	private contenido_Orden_Dialogo = new UntypedFormControl('?');
  	private opciones_Orden_Dialogo = new UntypedFormControl('?');
  	private encadenadoId_Orden_Dialogo = new UntypedFormControl(0);
  	private tipoEncadenado_Orden_Dialogo = new UntypedFormControl(0);

	//Campos Datos Eventos (Mision):
  	private id_Orden_Mision = new UntypedFormControl('?');
  	private comando_Orden_Mision = new UntypedFormControl('?');
  	private misionId_Orden_Mision = new UntypedFormControl('?');
  	private tareaId_Orden_Mision = new UntypedFormControl('?');
  	private valorOperador_Orden_Mision = new UntypedFormControl('?');

	//Campos Datos Eventos (Trigger):
  	private id_Orden_Trigger = new UntypedFormControl('?');
  	private comando_Orden_Trigger = new UntypedFormControl('?');
  	private triggerId_Orden_Trigger = new UntypedFormControl('?');
  	private trigger_Orden_Trigger = new UntypedFormControl('?');

	//Campos Datos Eventos (Multimedia):
  	private id_Orden_Multimedia = new UntypedFormControl('?');
  	private comando_Orden_Multimedia = new UntypedFormControl('?');
  	private tipoMultimedia_Orden_Multimedia = new UntypedFormControl('?');
  	private nombreAsset_Orden_Multimedia = new UntypedFormControl('?');

	//Campos Datos Eventos (Hechizo):
  	private id_Orden_Hechizo = new UntypedFormControl('?');
  	private comando_Orden_Hechizo = new UntypedFormControl('?');
  	private hechizoId_Orden_Hechizo = new UntypedFormControl('?');
  	private objetivo_Orden_Hechizo = new UntypedFormControl('?');
  	private heroeObjetivoId_Orden_Hechizo = new UntypedFormControl('?');
  	private enemigoObjetivoId_Orden_Hechizo = new UntypedFormControl('?');

	//Campos Datos Eventos (Loot):
  	private id_Orden_Loot = new UntypedFormControl('?');
  	private comando_Orden_Loot = new UntypedFormControl('?');
  	private objetivo_Orden_Loot = new UntypedFormControl('?');
  	private oro_Orden_Loot = new UntypedFormControl('?');
  	private exp_Orden_Loot = new UntypedFormControl('?');

	//Campos Datos Eventos (Loot - Objeto):
  	private generado_Objeto_Loot = new UntypedFormControl('?');
  	private objetoId_Objeto_Loot = new UntypedFormControl(0);
  	private probTipo_Objeto_Loot = new UntypedFormControl('?');
  	private probRareza_Objeto_Loot = new UntypedFormControl(0);
  	private nivelMax_Objeto_Loot = new UntypedFormControl(0);
  	private nivelMin_Objeto_Loot = new UntypedFormControl(0);

	//Campos Datos Eventos (Enemigo):
  	private id_Orden_Enemigo = new UntypedFormControl('?');
  	private comando_Orden_Enemigo = new UntypedFormControl('?');
  	private idEnemigo_Orden_Enemigo = new UntypedFormControl('?');
  	private tipoEnemigo_Orden_Enemigo = new UntypedFormControl('?');

	//Campos Datos Eventos (Tiempo):
  	private id_Orden_Tiempo = new UntypedFormControl('?');
  	private comando_Orden_Tiempo = new UntypedFormControl('?');
  	private dias_Orden_Tiempo = new UntypedFormControl('?');

	//Campos Datos Eventos (Mazmorra):
  	private id_Orden_Mazmorra = new UntypedFormControl('?');
  	private comando_Orden_Mazmorra = new UntypedFormControl('?');
  	private mazmorraId_Orden_Mazmorra = new UntypedFormControl('?');
  	private salaOpenId_Orden_Mazmorra = new UntypedFormControl(0);


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

		//Inicializacion formulario Orden Dialogo:
	    this.formOrdenDialogo = this.formBuilder.group({
            tipoDialogo: this.tipoDialogo_Orden_Dialogo,
            contenido: this.contenido_Orden_Dialogo,
            opciones: this.opciones_Orden_Dialogo,
            encadenadoId: this.encadenadoId_Orden_Dialogo,
            tipoEncadenado: this.tipoEncadenado_Orden_Dialogo
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
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
                    case "reloadFormEventos":
                        //Formulario Evento:
                        this.formEvento.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex]);

                        //Formulario Orden:
                        this.formOrden.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);

                        //Formulario Parametros Orden:
                        //this.formParametrosOrden.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                        
                        switch(this.desarrolladorService.tipoOrdenSeleccionada){
                            case "condicion":
                            this.formOrdenCondicion.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "variable":
                            this.formOrdenVariable.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "dialogo":
                            this.formOrdenDialogo.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "mision":
                            this.formOrdenMision.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "trigger":
                            this.formOrdenTrigger.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "multimedia":
                            this.formOrdenMultimedia.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "loot":
                            this.formOrdenLoot.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "hechizo":
                            this.formOrdenHechizo.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "enemigo":
                            this.formOrdenEnemigo.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "tiempo":
                            this.formOrdenTiempo.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                            case "mazmorra":
                            this.formOrdenMazmorra.patchValue(this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex]);
                            break;
                        }
                    break;
                }
            }) // Fin Suscripcion


		//Suscripcion de dambios formulario Eventos:
		this.formEvento.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.eventoSeleccionadoIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && key!="ordenes") {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario Ordenes:
		this.formOrden.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key=="id"||key=="tipo"||key=="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Condicion):
		this.formOrdenCondicion.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Variables):
		this.formOrdenVariable.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Dialogo):
		this.formOrdenDialogo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Mision):
		this.formOrdenMision.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Trigger):
		this.formOrdenTrigger.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Multimedia):
		this.formOrdenMultimedia.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Loot):
		this.formOrdenLoot.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Hechizo):
		this.formOrdenHechizo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Enemigo):
		this.formOrdenEnemigo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Tiempo):
		this.formOrdenTiempo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

		//Suscripcion de cambios formulario Parametros Ordenes (Mazmorra):
		this.formOrdenMazmorra.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.ordenSeleccionadaIndex>=0){
                for (var key in val) {
                  if (val.hasOwnProperty(key) && (key!="id" && key!="tipo" && key!="nombre")) {
				    this.desarrolladorService.eventos.eventos[this.desarrolladorService.eventoSeleccionadoIndex].ordenes[this.desarrolladorService.ordenSeleccionadaIndex][key]= val[key];
                  }
                }
			}
			console.log(val)
		});

    } //Fin OnInit

	renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
		switch(opcionSeleccionado){
			case "hechizo":
				if(this.desarrolladorService.hechizoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
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
        if(tipoOrden.toLowerCase() == this.desarrolladorService.tipoOrdenSeleccionada){
            clase = {
                "background-color": "white", 
                "color": "black"
            }
        }
        return clase;
    }

}









