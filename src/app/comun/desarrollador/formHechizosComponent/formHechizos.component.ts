
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'formHechizosComponent',
  templateUrl: './formHechizos.component.html',
  styleUrls: ['./formHechizos.component.sass']
})

export class FormHechizosComponent {

    //Suscripciones:
    private desarrolladorSuscripcion: Subscription = null;

    //Form Group:
    private formHechizos: UntypedFormGroup;

    //Campos Hechizos:
    private id_Hechizos = new UntypedFormControl(0);
    private nombre_Hechizos = new UntypedFormControl('???');
    private descripcion_Hechizos = new UntypedFormControl('????????');
    private animacion_Hechizos = new UntypedFormControl(1);
    private distancia_Hechizos = new UntypedFormControl(1);
    private objetivo_Hechizos = new UntypedFormControl('EU');
    private tipo_dano_Hechizos = new UntypedFormControl('Físico');

    private dano_Hechizos = new UntypedFormControl(0);
    private heal_Hechizos = new UntypedFormControl(0);
    private escudo_Hechizos = new UntypedFormControl(0);
    private amenaza_Hechizos = new UntypedFormControl(1);
    private energia_Hechizos = new UntypedFormControl(0);
    private poder_Hechizos = new UntypedFormControl(0);
    private duracionEscudo_Hechizos = new UntypedFormControl(0);
    private cooldown_Hechizos = new UntypedFormControl(0);

    private esc_dano_AD_Hechizos = new UntypedFormControl(0);
    private esc_dano_AP_Hechizos = new UntypedFormControl(0);
    private esc_heal_AD_Hechizos = new UntypedFormControl(0);
    private esc_heal_AP_Hechizos = new UntypedFormControl(0);
    private esc_escudo_AD_Hechizos = new UntypedFormControl(0);
    private esc_escudo_AP_Hechizos = new UntypedFormControl(0);

    constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

    async ngOnInit(){

        //Inicializacion formulario Hechizos:
        this.formHechizos = this.formBuilder.group({
            id: this.id_Hechizos,
            nombre: this.nombre_Hechizos,
            descripcion: this.descripcion_Hechizos,
            categoria: null,
            tipo: null,
            imagen_id: 0,
            nivel: 1,
            recurso: this.energia_Hechizos,
            poder: this.poder_Hechizos,
            duracion_escudo: this.duracionEscudo_Hechizos,
            cooldown: this.cooldown_Hechizos,
            distancia: this.distancia_Hechizos,
            objetivo: this.objetivo_Hechizos,
            tipo_daño: this.tipo_dano_Hechizos,
            daño_dir: this.dano_Hechizos,
            heal_dir: this.heal_Hechizos,
            escudo_dir: this.escudo_Hechizos,
            mod_amenaza: this.amenaza_Hechizos,
            buff_id: [],
            animacion_id: this.animacion_Hechizos,
            hech_encadenado_id: null,
            daño_esc_AP: this.esc_dano_AP_Hechizos,
            daño_esc_AD: this.esc_dano_AD_Hechizos,
            heal_esc_AP: this.esc_heal_AP_Hechizos,
            heal_esc_AD: this.esc_heal_AD_Hechizos,
            escudo_esc_AP: this.esc_escudo_AP_Hechizos,
            escudo_esc_AD: this.esc_escudo_AD_Hechizos,
            triggersHechizo: []
        });

        //Suscripcion de Recarga Formulario:
        this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
            (val) => {
                switch (val) {
                    case "reloadFormHechizos":
                    case "reloadForm":
                        this.formHechizos.setValue(this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex]);
                    break;
                }
            }) // Fin Suscripcion

        //Suscripcion de dambios formulario Hechizos:
        this.formHechizos.valueChanges.subscribe((val) =>{
            if(this.desarrolladorService.hechizoSeleccionadoIndex+1){
                this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex]= val;
            }
            console.log(val)
        });

        //Inicializa el formulario:
        this.formHechizos.setValue(this.desarrolladorService.hechizos.hechizos[this.desarrolladorService.hechizoSeleccionadoIndex]);

    } //Fin OnInit

    renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
        switch(opcionSeleccionado){
            case "hechizo":
                if(this.desarrolladorService.hechizoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
                break;
        }
        return "";
    }

    renderBotonAddSeleccionado(tipoBoton:string,indexBuffRelacionadoSeleccionado?:number){

        switch(tipoBoton){
            case "ModificarBuffRelacionado":
                if(this.desarrolladorService.estadoPanelBuffRelacionado == "Modificar" &&
                   indexBuffRelacionadoSeleccionado == this.desarrolladorService.indexBuffRelacionadoIndex){
                    return "seleccionado";
                }
            break;
            case "AddBuffRelacionado":
                if(this.desarrolladorService.estadoPanelBuffRelacionado == "Add"){
                    return "seleccionado";
                }
            break;
        }

        return ""
    }

}





