
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formClasesComponent',
  templateUrl: './formClases.component.html',
  styleUrls: ['./formClases.component.sass']
})

export class FormClasesComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Variables de estado:
    public opcionSeleccionada = "Estadisticas";
    public hechizosDisponibles = [];

    //Form Group:
  	public formClase: UntypedFormGroup;
  	public formEstadisticas: UntypedFormGroup;
  	public formEscalado: UntypedFormGroup;

  	//Campos Datos Clase:
  	public id_Clase = new UntypedFormControl(0);
  	public nombre_Clase = new UntypedFormControl('???');
    public descripcion_Clase = new UntypedFormControl('???');
    public tipoArmadura_Clase = new UntypedFormControl('Ligera');
    public energiaMovimiento_Clase = new UntypedFormControl(0);

    private armadura = new UntypedFormControl(0);
    private resistencia_magica = new UntypedFormControl(0);
    private vitalidad = new UntypedFormControl(0);
    private AP = new UntypedFormControl(0);
    private AD = new UntypedFormControl(0);
    private critico = new UntypedFormControl(0);

    private armadura_esc = new UntypedFormControl(0);
    private resistencia_magica_esc= new UntypedFormControl(0);
    private vitalidad_esc = new UntypedFormControl(0);
    private AP_esc = new UntypedFormControl(0);
    private AD_esc = new UntypedFormControl(0);
    private critico_esc = new UntypedFormControl(0);

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Clase:
	    this.formClase = this.formBuilder.group({
	    	id: this.id_Clase,
	    	nombre: this.nombre_Clase,
	    	descripcion: this.descripcion_Clase,
        	imagen_id_masculino: 1,
        	imagen_id_femenino: 1,
        	habilitado: true,
        	roles: [null],
        	badge_id: 1,
        	tipoArmadura: this.tipoArmadura_Clase,
        	energia_movimiento: this.energiaMovimiento_Clase,
			hechizos: [],
			talentos: []
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
                    case "reloadFormClases":
                    case "reloadForm":
                        this.cargarHechizosDisponibles();
                        this.reloadForm();
                    break;
                }
            }) // Fin Suscripcion
            
		//Suscripcion de cambios formulario Clases:
		this.formClase.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexClaseSeleccionada+1){
			    this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].descripcion = val.descripcion;
			    this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].tipoArmadura = val.tipoArmadura;
			}
            
			console.log(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada])
		});

		//Suscripcion de cambios Estadisticas:
		this.formEstadisticas.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexClaseSeleccionada+1){
			    this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].estadisticas= val
			}
			console.log(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada])
		});

		//Suscripcion de cambios formulario Escalado:
		this.formEscalado.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexClaseSeleccionada+1){
			    this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].escalado= val
			}
			console.log(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada])
		});

        //Cargar Hechizos Disponibles: 
        this.cargarHechizosDisponibles();

        //Cargar  : 
        this.reloadForm();


    } //FIN ONINIT

    reloadForm(){
        console.log("Recargando formulario")
        this.formClase.patchValue(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada]);
        this.formEstadisticas.patchValue(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].estadisticas);
        this.formEscalado.patchValue(this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].escalado)
    }

    cargarHechizosDisponibles(){
        this.hechizosDisponibles = [];
        var id_Hechizo = null;

        for(var i=0; i < this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].hechizos.length; i++){

            id_Hechizo= this.desarrolladorService.clases.clases[this.desarrolladorService.indexClaseSeleccionada].hechizos[i].id_hechizo

            //Rellenar Objeto:
            this.hechizosDisponibles.push({
                imagen_id: this.desarrolladorService.hechizos.hechizos.find(j => j.id==id_Hechizo).imagen_id,
                nombre: this.desarrolladorService.hechizos.hechizos.find(j => j.id==id_Hechizo).nombre,
            })
        }
    } //Fin Cargar Hechizos


}






