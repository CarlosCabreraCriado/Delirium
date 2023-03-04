

import { Component , Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formAnimacionesComponent',
  templateUrl: './formAnimaciones.component.html',
  styleUrls: ['./formAnimaciones.component.sass']
})

export class FormAnimacionesComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Form Group:
  	private formAnimaciones: FormGroup;
  	private formSubanimacion: FormGroup;

  	//Campos Datos Animaciones:
  	private id_Animaciones = new FormControl('0');
  	private nombre_Animaciones = new FormControl('???');
    private duracion_Animaciones = new FormControl('0');
    private subanimaciones_Animaciones = new FormControl('0');
    private sonidos_Animaciones = new FormControl('0');

	//Campos Datos Subanimacion:
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

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) {}

	async ngOnInit(){

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

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
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
                }
            }) // Fin Suscripcion

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

    } //Fin OnInit

	renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
		switch(opcionSeleccionado){
			case "animaciones":
				if(this.desarrolladorService.animacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
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

}





