

import { Component , Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
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
  	public formAnimaciones: UntypedFormGroup;
  	public formSubanimacion: UntypedFormGroup;

  	//Campos Datos Animaciones:
  	private id_Animaciones = new UntypedFormControl(0);
  	private nombre_Animaciones = new UntypedFormControl('???');
    private duracion_Animaciones = new UntypedFormControl("2.5");
    private subanimaciones_Animaciones = new UntypedFormControl(0);
    private sonidos_Animaciones = new UntypedFormControl(0);

	//Campos Datos Subanimacion:
  	private id_Subanimacion = new UntypedFormControl(0);
  	private nombre_Subanimacion = new UntypedFormControl('???');
  	private sprite_id_Subanimacion = new UntypedFormControl(0);
    private duracion_Subanimacion = new UntypedFormControl("0");
    private num_frames_Subanimacion = new UntypedFormControl(1);
    private frame_ref_Subanimacion = new UntypedFormControl(0);

    private hue_Subanimacion = new UntypedFormControl(0);
    private sepia_Subanimacion = new UntypedFormControl(0);
    private brillo_Subanimacion = new UntypedFormControl(0);
    private saturacion_Subanimacion = new UntypedFormControl(0);

    private delay_Subanimacion = new UntypedFormControl(0);
    private offsetx_Subanimacion = new UntypedFormControl(0);
    private offsety_Subanimacion = new UntypedFormControl(0);
    private rotate_Subanimacion = new UntypedFormControl(0);
    private scaleX_Subanimacion = new UntypedFormControl(1);
    private scaleY_Subanimacion = new UntypedFormControl(1);

    public mute = true;

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

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
        	rotate: this.rotate_Subanimacion,
        	scaleX: this.scaleX_Subanimacion,
        	scaleY: this.scaleY_Subanimacion,
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
                    console.log(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex])
                        this.formSubanimacion.setValue(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex]);
                    break;
                }
            }) // Fin Suscripcion

		//Suscripcion de dambios formulario Animaciones:
		this.formAnimaciones.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.animacionSeleccionadoIndex+1){
				this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex]= Object.assign({},val);
			}
			console.log(val)
		});

		//Suscripcion de dambios formulario Subanimacion:
		this.formSubanimacion.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.animacionSeleccionadoIndex+1 && this.desarrolladorService.subanimacionSeleccionadoIndex+1){
				this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex]= Object.assign({},val);

        //Asignación de Numero de frame_ref_Subanimacion
        this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].subanimaciones[this.desarrolladorService.subanimacionSeleccionadoIndex].num_frames = this.desarrolladorService.animaciones.sprites.find(i => i.id == val.sprite_id)["numFrames"];
			}
			console.log(val)
		});

        //Inicializa la animacion:
        this.desarrolladorService.seleccionarAnimacion(this.desarrolladorService.animacionSeleccionadoIndex)
        this.desarrolladorService.seleccionarSubanimacion(this.desarrolladorService.subanimacionSeleccionadoIndex)

    } //Fin OnInit

	renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
		switch(opcionSeleccionado){
			case "animaciones":
				if(this.desarrolladorService.animacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "sonido":
				if(this.desarrolladorService.sonidoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "subanimacion":
				if(this.desarrolladorService.subanimacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
				break;
			case "listaSonidos":
                var sonidoId = this.desarrolladorService.animaciones.sonidos[indiceSeleccionado].id;
				if(this.desarrolladorService.animaciones.animaciones[this.desarrolladorService.animacionSeleccionadoIndex].sonidos[this.desarrolladorService.sonidoSeleccionadoIndex].id==sonidoId){return "seleccionado"}
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





