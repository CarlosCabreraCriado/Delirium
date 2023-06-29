
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formEnemigosComponent',
  templateUrl: './formEnemigos.component.html',
  styleUrls: ['./formEnemigos.component.sass']
})

export class FormEnemigosComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Variables de estado:
    private opcionSeleccionada: "estadisticas"|"propiedades"|"acciones" = "acciones";
    private accionSeleccionadaIndex = 0; 
    private hechizosDisponibles = [];

    //Form Group:
  	private formEnemigo: FormGroup;
  	private formEstadisticas: FormGroup;
  	private formEscalado: FormGroup;
  	private formAcciones: FormGroup;

  	//Campos Datos Enemigo:
  	private id_Enemigo = new FormControl(0);
  	private nombre_Enemigo = new FormControl('???');
    private descripcion_Enemigo = new FormControl('???');
    private familia_Enemigo = new FormControl('Gnoll');

    private armadura = new FormControl(0);
    private resistencia_magica = new FormControl(0);
    private vitalidad = new FormControl(0);
    private PA = new FormControl(0);
    private AP = new FormControl(0);
    private AD = new FormControl(0);
    private critico = new FormControl(0);

    private armadura_esc = new FormControl(0);
    private resistencia_magica_esc= new FormControl(0);
    private vitalidad_esc = new FormControl(0);
    private PA_esc = new FormControl(0);
    private AP_esc = new FormControl(0);
    private AD_esc = new FormControl(0);
    private critico_esc = new FormControl(0);

    private id_accion = new FormControl(0);
  	private nombre_accion = new FormControl('???');
  	private tipoObjetivo_accion = new FormControl('???');
    private probabilidad_accion = new FormControl(1);
    private energia_accion = new FormControl(50);
    private movimiento_accion = new FormControl(4);
    private alcance_accion = new FormControl(4);
  	private texto_accion = new FormControl('???');
  	private comportamiento_accion = new FormControl('???');
  	private tipo_accion = new FormControl('movimiento');
  	private habilitada_accion = new FormControl(true);
    private habilitarAccion_accion = new FormControl(0);
    private deshabilitarAccion_accion = new FormControl(0);
    private inicial_accion = new FormControl(false);
    private hechizo_id_accion = new FormControl(0);

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Clase:
	    this.formEnemigo = this.formBuilder.group({
	    	id: this.id_Enemigo,
	    	nombre: this.nombre_Enemigo,
	    	descripcion: this.descripcion_Enemigo,
        	imagen_id: 1,
        	familia: this.familia_Enemigo,
			hechizos: [],
			acciones: []
	    });

		//Inicializacion formulario Estadisticas:
	    this.formEstadisticas = this.formBuilder.group({
	    	armadura: this.armadura,
	    	resistencia_magica: this.resistencia_magica,
	    	vitalidad: this.vitalidad,
	    	pa: this.PA,
	    	ap: this.AP,
	    	ad: this.AD,
	    	critico: this.critico
	    });

		//Inicializacion formulario Escalado:
	    this.formEscalado = this.formBuilder.group({
	    	armadura_esc: this.armadura_esc,
	    	resistencia_magica_esc: this.resistencia_magica_esc,
	    	vitalidad_esc: this.vitalidad_esc,
	    	pa_esc: this.PA_esc,
	    	ap_esc: this.AP_esc,
	    	ad_esc: this.AD_esc,
	    	critico_esc: this.critico_esc
	    });

	    this.formAcciones = this.formBuilder.group({
            id: this.id_accion,
            nombre: this.nombre_accion,
            tipoObjetivo: this.tipoObjetivo_accion,
            probabilidad: this.probabilidad_accion,
            energia: this.energia_accion,
            movimiento: this.movimiento_accion,
            alcance: this.alcance_accion,
            texto: this.texto_accion,
            comportamiento: this.comportamiento_accion,
            tipo: this.tipo_accion,
            habilitada: this.habilitada_accion,
            habilitarAccion: this.habilitarAccion_accion,
            deshabilitarAccion: this.deshabilitarAccion_accion,
            hechizo_id: this.hechizo_id_accion,
            inicial: this.inicial_accion
	    });

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
                    case "reloadFormEnemigo":
                    case "reloadForm":
                        this.cargarHechizosDisponibles();
                        this.reloadForm();
                    break;
                }
            }) // Fin Suscripcion
            
		//Suscripcion de cambios formulario Enemigo:
		this.formEnemigo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoIndex+1){
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].nombre = val.nombre;
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].descripcion = val.descripcion;
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].familia = val.familia;
			}
			console.log(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex])
		});

		//Suscripcion de cambios Estadisticas:
		this.formEstadisticas.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoIndex+1){
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].estadisticas= val
			}
			console.log(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex])
		});

		//Suscripcion de cambios formulario Escalado:
		this.formEscalado.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoIndex+1){
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].escalado= val
			}
			console.log(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex])
		});

		//Suscripcion de cambios formulario Acciones:
		this.formAcciones.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.enemigoSeleccionadoIndex+1){
			    this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones[this.accionSeleccionadaIndex]= val
			}
			console.log(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex])
		});

        //Cargar Hechizos Disponibles: 
        this.cargarHechizosDisponibles();

        //Cargar: 
        this.reloadForm();

    }//FIN ONINIT

    reloadForm(){
        console.log("Recargando formulario")
        this.formEnemigo.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex]);
        this.formEstadisticas.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].estadisticas);
        this.formEscalado.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].escalado);
        this.formAcciones.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones[this.accionSeleccionadaIndex]);
    }

    cargarHechizosDisponibles(){
        this.hechizosDisponibles = [];
        var id_Hechizo = null;
        for(var i=0; i < this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].hechizos.length; i++){

            id_Hechizo= this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].hechizos[i]

            //Rellenar Objeto:
            this.hechizosDisponibles.push({
                imagen_id: this.desarrolladorService.hechizos.hechizos.find(j => j.id==id_Hechizo).imagen_id,
                nombre: this.desarrolladorService.hechizos.hechizos.find(j => j.id==id_Hechizo).nombre,
                id: this.desarrolladorService.hechizos.hechizos.find(j => j.id==id_Hechizo).id
            })
        }
    } //Fin Cargar Hechizos

    seleccionarAccion(indexAccion: number){
        this.accionSeleccionadaIndex = indexAccion;
        this.formAcciones.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones[this.accionSeleccionadaIndex]);
    }

    addAccion(){
        var nuevoId=1;
        var acciones= this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones;
        var cantidadAcciones= acciones.length
        for(var i = 0; i < cantidadAcciones; i++){
            if(acciones[i].id >= nuevoId){
                    nuevoId = acciones[i]+1;
            } 
        }

        this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones.push({
            id: nuevoId,
            nombre: "Nueva Accion",
            tipoObjetivo: "heroe",
            probabilidad: 1,
            energia: 50,
            movimiento: 4,
            alcance: 4,
            texto: "???",
            comportamiento: "Prio.Amenaza",
            tipo: "movimiento",
            habilitada: true,
            habilitarAccion: 0,
            deshabilitarAccion: 0,
            hechizo_id: 0,
            inicial: false 
        });

        this.accionSeleccionadaIndex = cantidadAcciones;
        this.formAcciones.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].acciones[this.accionSeleccionadaIndex]);

    }

}




