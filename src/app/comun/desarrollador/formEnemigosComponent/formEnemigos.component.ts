
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
    private opcionSeleccionada = "Estadisticas";
    private hechizosDisponibles = [];

    //Form Group:
  	private formEnemigo: FormGroup;
  	private formEstadisticas: FormGroup;
  	private formEscalado: FormGroup;

  	//Campos Datos Enemigo:
  	private id_Enemigo = new FormControl(0);
  	private nombre_Enemigo = new FormControl('???');
    private descripcion_Enemigo = new FormControl('???');
    private familia_Enemigo = new FormControl('Gnoll');

    private armadura = new FormControl(0);
    private resistencia_magica = new FormControl(0);
    private vitalidad = new FormControl(0);
    private AP = new FormControl(0);
    private AD = new FormControl(0);
    private critico = new FormControl(0);

    private armadura_esc = new FormControl(0);
    private resistencia_magica_esc= new FormControl(0);
    private vitalidad_esc = new FormControl(0);
    private AP_esc = new FormControl(0);
    private AD_esc = new FormControl(0);
    private critico_esc = new FormControl(0);

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
	    	AP: this.AP,
	    	AD: this.AD,
	    	critico: this.critico
	    });

		//Inicializacion formulario Escalado:
	    this.formEscalado = this.formBuilder.group({
	    	armadura_esc: this.armadura_esc,
	    	resistencia_magica_esc: this.resistencia_magica_esc,
	    	vitalidad_esc: this.vitalidad_esc,
	    	AP_esc: this.AP_esc,
	    	AD_esc: this.AD_esc,
	    	critico_esc: this.critico_esc
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

        //Cargar Hechizos Disponibles: 
        this.cargarHechizosDisponibles();

        //Cargar: 
        this.reloadForm();

    } //FIN ONINIT

    reloadForm(){
        console.log("Recargando formulario")
        this.formEnemigo.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex]);
        this.formEstadisticas.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].estadisticas);
        this.formEscalado.patchValue(this.desarrolladorService.enemigos.enemigos[this.desarrolladorService.enemigoSeleccionadoIndex].escalado);
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
            })
        }
    } //Fin Cargar Hechizos

}




