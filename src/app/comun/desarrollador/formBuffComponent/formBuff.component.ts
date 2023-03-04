
import { Component , Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formBuffComponent',
  templateUrl: './formBuff.component.html',
  styleUrls: ['./formBuff.component.sass']
})

export class FormBuffComponent {

    //Suscripciones:
  	private desarrolladorSuscripcion: Subscription = null;

    //Group Form:
  	private formBuff: FormGroup;

  	//Campos Buff:
  	private id_Buff = new FormControl(0);
  	private nombre_Buff = new FormControl('???');
    private descripcion_Buff = new FormControl('????????');
    private duracion_Buff = new FormControl(1)
    private animacion_Buff = new FormControl(1);

    private tipo_Buff = new FormControl('Ventaja');
    private tipo_dano_Buff = new FormControl('Físico');

    private dano_T_Buff = new FormControl('0');
    private heal_T_Buff = new FormControl('0');
    private escudo_T_Buff = new FormControl('0');
    private stat_inc_Buff = new FormControl('0');
    private stat_inc_inicial_Buff = new FormControl('0');
    private stat_inc_T_Buff = new FormControl('0');

	constructor(public desarrolladorService: DesarrolladorService, private formBuilder: FormBuilder) {}

	async ngOnInit(){

		//Inicializacion formulario Buff:
	    this.formBuff = this.formBuilder.group({
	    	id: this.id_Buff,
	    	nombre: this.nombre_Buff,
        	duracion: this.duracion_Buff,
        	descripcion: this.descripcion_Buff,
        	imagen_id: 1,
        	animacion_id: this.animacion_Buff, 
        	tipo: "Ventaja",
        	tipo_daño: this.tipo_dano_Buff,

        	daño_t: this.dano_T_Buff,
        	heal_t: this.heal_T_Buff,
        	escudo_t: this.escudo_T_Buff,

        	stat_inc: this.stat_inc_Buff,
        	stat_inc_inicial: this.stat_inc_inicial_Buff,
        	stat_inc_t: this.stat_inc_T_Buff,

            daño_esc_AP: 0,
            daño_esc_AD: 0,
            heal_esc_AP: 0,
            heal_esc_AD: 0,
            escudo_esc_AP: 0,
            escudo_esc_AD: 0,
            visible: true,
            triggersBuff: []
	    });

		//Suscripcion de Recarga Formulario:
		this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
	        (val) => {
	            switch (val) {
                    case "reloadFormBuff":
                    case "reloadForm":
                        this.formBuff.setValue(this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]);
                    break;
                }
            }) // Fin Suscripcion

		//Suscripcion de dambios formulario BUFF:
		this.formBuff.valueChanges.subscribe((val) =>{
			if(this.desarrolladorService.buffSeleccionadoIndex+1){
				this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]= val;
			}
			console.log(val)
		});

        this.formBuff.setValue(this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]);

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

}





