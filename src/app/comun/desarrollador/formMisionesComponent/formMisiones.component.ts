
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";
import { datosDefecto } from "../datosDefecto"

@Component({
  selector: 'formMisionesComponent',
  templateUrl: './formMisiones.component.html',
  styleUrls: ['./formMisiones.component.sass']
})


export class FormMisionesComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Variables de estado:
    public opcionSeleccionada = "Propiedades";
    public selectorOpcion = ["","",""];
    private hechizosDisponibles = [];

    //Form Group:
  	public formMision: UntypedFormGroup;
  	private formPropiedades: UntypedFormGroup;
  	private formObjetivos: UntypedFormGroup;
  	private formRecompensas: UntypedFormGroup;

  	//Campos Datos Enemigo:
  	public id_Mision = new UntypedFormControl(0);
  	private nombre_Mision = new UntypedFormControl('???');
    private descripcion_Mision = new UntypedFormControl('???');
    private tipo_Mision = new UntypedFormControl('Gnoll');

    private nivel_recomendado = new UntypedFormControl(1);
    private capitulo = new UntypedFormControl(0);
    private epigrafe = new UntypedFormControl(0);

    private id_Objetivo = new UntypedFormControl(0);
    private texto_Objetivo= new UntypedFormControl("???");
    private tipo_Objetivo = new UntypedFormControl("Booleano");
    private cuentaMax_Objetivo = new UntypedFormControl(1);
    private requerido_Objetivo = new UntypedFormControl(true);

    private oro = new UntypedFormControl(10);
    private exp= new UntypedFormControl(100);
    private oro_repeticion_mod = new UntypedFormControl(0.5);
    private exp_repeticion_mod = new UntypedFormControl(0.5);

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Clase:
	    this.formMision = this.formBuilder.group({
	    	id: this.id_Mision,
	    	titulo: this.nombre_Mision,
	    	descripcion: this.descripcion_Mision,
        	tipo: this.tipo_Mision,
			recompensas: {},
			objetivos: []
	    });

		//Inicializacion formulario Propiedades Mision:
	    this.formPropiedades = this.formBuilder.group({
	    	nivel_recomendado: this.nivel_recomendado,
	    	capitulo: this.capitulo,
	    	epigrafe: this.epigrafe
	    });

		//Inicializacion formulario Objetivos:
	    this.formObjetivos = this.formBuilder.group({
            id: this.id_Objetivo,
            texto: this.texto_Objetivo,
            tipo: this.tipo_Objetivo,
            cuentaMax: this.cuentaMax_Objetivo,
            requerido: this.requerido_Objetivo
	    });

		//Inicializacion formulario Recompensas:
	    this.formRecompensas = this.formBuilder.group({
            oro: this.oro,
            exp: this.exp,
            oro_repeticion_mod: this.oro_repeticion_mod,
            exp_repeticion_mod: this.exp_repeticion_mod
	    });

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
                    case "reloadFormMisiones":
                    case "reloadForm":
                        this.reloadForm();
                    break;
                }
            }) // Fin Suscripcion
            
		//Suscripcion de cambios formulario Mision:
		this.formMision.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.misionSeleccionadaIndex+1){
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].titulo = val.titulo;
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].descripcion = val.descripcion;
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].tipo = val.tipo;
			}
			console.log(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex])
		});

		//Suscripcion de cambios Propiedades:
		this.formPropiedades.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.misionSeleccionadaIndex+1){
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].escalado= val
			}
			console.log(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex])
		});

		//Suscripcion de cambios formulario Objetivos:
		this.formObjetivos.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.misionSeleccionadaIndex+1){
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].objetivos[this.desarrolladorService.objetivoMisionSeleccionadoIndex] = val
			}
			console.log(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex])
		});

		//Suscripcion de cambios Recompensas:
		this.formRecompensas.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.misionSeleccionadaIndex+1){
			    this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].recompensas= val
			}
			console.log(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex])
		});

        //Selecciona Opcion Por defecto: 
        this.seleccionarOpcion(this.opcionSeleccionada);

        //Selecciona Opcion Por defecto: 
        this.desarrolladorService.seleccionarObjetivoMision(this.desarrolladorService.objetivoMisionSeleccionadoIndex);

        //Cargar: 
        this.reloadForm();

    } //FIN ONINIT

    reloadForm(){
        console.log("Recargando formulario")
        this.formMision.patchValue(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex]);
        this.formPropiedades.patchValue(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex]);
        this.formObjetivos.patchValue(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].objetivos[this.desarrolladorService.objetivoMisionSeleccionadoIndex]);
        this.formRecompensas.patchValue(this.desarrolladorService.misiones.misiones[this.desarrolladorService.misionSeleccionadaIndex].recompensas);
    }

    seleccionarOpcion(opcion: string){
        this.opcionSeleccionada = opcion;
        this.selectorOpcion = ["","",""];
        switch(opcion){
            case "Propiedades":
                this.selectorOpcion[0]="seleccionado";
                break;
            case "Objetivos":
                this.selectorOpcion[1]="seleccionado";
                break;
            case "Recompensas":
                this.selectorOpcion[2]="seleccionado";
                break;
        }
    }


    seleccionarMision(selector:any){

      //Set Index
      this.desarrolladorService.misionSeleccionadaIndex = selector.index;

      //Actualizar Formulario:
      this.reloadForm();
    }

    addMision(){
        this.desarrolladorService.misiones.misiones.push(Object.assign({},datosDefecto.misiones));
        this.desarrolladorService.misiones.misiones.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.desarrolladorService.misiones.misiones);
        this.desarrolladorService.misiones.misiones.at(-1)["nombre"]= "Misiones "+this.desarrolladorService.misiones.misiones.length;
        this.seleccionarMision({index: this.desarrolladorService.misiones.misiones.length-1})
    }

}




