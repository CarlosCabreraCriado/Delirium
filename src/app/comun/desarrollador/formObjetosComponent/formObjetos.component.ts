
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formObjetosComponent',
  templateUrl: './formObjetos.component.html',
  styleUrls: ['./formObjetos.component.sass']
})

export class FormObjetosComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Variables de estado:
    private opcionSeleccionada = "Estadisticas";
    private hechizosDisponibles = [];

    //Form Group:
  	private formEquipo: FormGroup;
  	private formPropiedadesEquipo: FormGroup;
  	private formEstadisticasEquipo: FormGroup;
  	private formConsumible: FormGroup;
  	private formPropiedadesConsumible: FormGroup;

  	//Campos Datos Equipo:
  	private id_Equipo = new FormControl(0);
  	private nombre_Equipo = new FormControl('???');
    private descripcion_Equipo = new FormControl('???');
    private tipo_Equipo = new FormControl('Ligera');
    private pieza_Equipo = new FormControl('Pechera');
    private rareza_Equipo = new FormControl('Común');
    private vinculadoEquipar_Equipo = new FormControl(true);
    private vinculadoRecoger_Equipo = new FormControl(true);

  	//Campos Datos Estadisticas Equipo:
    private armadura = new FormControl(0);
    private resistencia_magica = new FormControl(0);
    private vitalidad = new FormControl(0);
    private AP = new FormControl(0);
    private AD = new FormControl(0);
    private critico = new FormControl(0);

  	//Campos Datos Equipo:
  	private id_Consumible = new FormControl(0);
  	private nombre_Consumible = new FormControl('???');
    private descripcion_Consumible = new FormControl('???');
    private tipo_Consumible = new FormControl('Miscelaneo');
    private maxStack_Consumible = new FormControl(1);
    private rareza_Consumible = new FormControl('Común');
    private modo_Consumible = new FormControl('Mazmorra');

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Clase:
	    this.formEquipo = this.formBuilder.group({
	    	id: this.id_Equipo,
	    	nombre: this.nombre_Equipo,
	    	descripcion: this.descripcion_Equipo,
            imagen_id: 0,
            perk_id: 0,
	    });

		//Inicializacion formulario Propiedades Equipo:
	    this.formPropiedadesEquipo = this.formBuilder.group({
            tipo: this.tipo_Equipo,
            pieza: this.pieza_Equipo,
            rareza: this.rareza_Equipo,
            vinculadoEquipar: this.vinculadoEquipar_Equipo,
            vinculadoRecoger: this.vinculadoRecoger_Equipo,
            unico: true,
	    });

		//Inicializacion formulario Clase:
	    this.formEstadisticasEquipo = this.formBuilder.group({
	    	armadura: this.armadura,
	    	resistencia_magica: this.resistencia_magica,
	    	vitalidad: this.vitalidad,
	    	AP: this.AP,
	    	AD: this.AD,
	    	critico: this.critico
	    });

		//Inicializacion formulario Estadisticas:
	    this.formConsumible = this.formBuilder.group({
	    	id: this.id_Consumible,
	    	nombre: this.nombre_Consumible,
	    	descripcion: this.descripcion_Consumible,
            imagen_id: 0,
            hechizo_id: 0
	    });

		//Inicializacion formulario Estadisticas:
	    this.formPropiedadesConsumible = this.formBuilder.group({
            tipo: this.tipo_Consumible,
            modo: this.modo_Consumible,
            rareza: this.rareza_Consumible,
            max_stack: this.maxStack_Consumible
        })

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
                    case "reloadFormObjetos":
                    case "reloadForm":
                        this.reloadForm();
                    break;
                }
            }) // Fin Suscripcion
            
		//Suscripcion de cambios formulario Equipo:
		this.formEquipo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexEquipoSeleccionado+1){
                this.desarrolladorService.patchObject(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado],val)
			}
			//console.log(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado])
		});

		//Suscripcion de cambios Estadisticas Equipo:
		this.formEstadisticasEquipo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexEquipoSeleccionado+1){
                this.desarrolladorService.patchObject(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado].estadisticas,val)
			}
			//console.log(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado])
		});

		//Suscripcion de cambios Propiedades Equipo:
		this.formPropiedadesEquipo.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexEquipoSeleccionado+1){
                this.desarrolladorService.patchObject(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado],val)
			}
			//console.log(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado])
		});

		//Suscripcion de cambios formulario Consumible:
		this.formConsumible.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexConsumibleSeleccionado+1){
                this.desarrolladorService.patchObject(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado],val)
			}
			//console.log(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado])
		});

		//Suscripcion de cambios Propiedades Consumible:
		this.formPropiedadesConsumible.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.indexConsumibleSeleccionado+1){
                this.desarrolladorService.patchObject(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado],val)
			}
			//console.log(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado])
		});

        //Cargar  : 
        this.reloadForm();

    } //FIN ONINIT

    reloadForm(){

        console.log("Recargando formulario")
        if(this.desarrolladorService.tipoObjetoSeleccionado=="Equipo"){
            console.log(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado])
        }
        if(this.desarrolladorService.tipoObjetoSeleccionado=="Consumible"){
            console.log(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado])
        }

        this.formEquipo.patchValue(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado]);

        this.formPropiedadesEquipo.patchValue(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado]);

        this.formEstadisticasEquipo.setValue(this.desarrolladorService.objetos.equipo[this.desarrolladorService.indexEquipoSeleccionado].estadisticas);

        this.formConsumible.patchValue(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado])

        this.formPropiedadesConsumible.patchValue(this.desarrolladorService.objetos.consumible[this.desarrolladorService.indexConsumibleSeleccionado])
    }

}











