
import { Component , Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { DesarrolladorService } from '../desarrollador.service';
import { Subscription } from "rxjs";
import { datosDefecto } from "../datosDefecto"

@Component({
  selector: 'formBuffComponent',
  templateUrl: './formBuff.component.html',
  styleUrls: ['./formBuff.component.sass']
})

export class FormBuffComponent {

    //Suscripciones:
    private desarrolladorSuscripcion: Subscription = null;

    //Group Form:
    private formBuff: UntypedFormGroup;

    //Campos Buff:
    private id_Buff = new UntypedFormControl(0);
    private nombre_Buff = new UntypedFormControl('???');
    private descripcion_Buff = new UntypedFormControl('????????');
    private duracion_Buff = new UntypedFormControl(1)
    private animacion_Buff = new UntypedFormControl(1);

    private tipo_Buff = new UntypedFormControl('Ventaja');
    private tipo_dano_Buff = new UntypedFormControl('Físico');

    private dano_T_Buff = new UntypedFormControl(0);
    private dano_esc_AD_T_Buff = new UntypedFormControl(0);
    private dano_esc_AP_T_Buff = new UntypedFormControl(0);

    private heal_T_Buff = new UntypedFormControl(0);
    private heal_esc_AD_T_Buff = new UntypedFormControl(0);
    private heal_esc_AP_T_Buff = new UntypedFormControl(0);

    private escudo_T_Buff = new UntypedFormControl(0);
    private escudo_esc_AD_T_Buff = new UntypedFormControl(0);
    private escudo_esc_AP_T_Buff = new UntypedFormControl(0);

    private stat_inc_Buff = new UntypedFormControl('0');
    private stat_inc_inicial_Buff = new UntypedFormControl('0');
    private stat_inc_T_Buff = new UntypedFormControl('0');

    constructor(public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

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
          daño_esc_AP: this.dano_esc_AP_T_Buff,
          daño_esc_AD: this.dano_esc_AD_T_Buff,

            heal_t: this.heal_T_Buff,
          heal_esc_AP: this.heal_esc_AP_T_Buff,
          heal_esc_AD: this.heal_esc_AD_T_Buff,

            escudo_t: this.escudo_T_Buff,
          escudo_esc_AP: this.escudo_esc_AP_T_Buff,
          escudo_esc_AD: this.escudo_esc_AD_T_Buff,

            stat_inc: this.stat_inc_Buff,
            stat_inc_inicial: this.stat_inc_inicial_Buff,
            stat_inc_t: this.stat_inc_T_Buff,

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

    reloadForm(val:string){
        switch (val) {
            case "reloadFormBuff":
            case "reloadForm":
                this.formBuff.setValue(this.desarrolladorService.buff.buff[this.desarrolladorService.buffSeleccionadoIndex]);
            break;
        }
    }

    seleccionarBuff(selector:any){

      //Set Index
      this.desarrolladorService.buffSeleccionadoIndex = selector.index;

      //Actualizar Formulario:
      this.reloadForm("reloadForm");
    }

    addBuff(){
        this.desarrolladorService.buff.buff.push(Object.assign({},datosDefecto.buff));
        this.desarrolladorService.buff.buff.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.desarrolladorService.buff.buff);
        this.desarrolladorService.buff.buff.at(-1)["nombre"]= "Buff "+this.desarrolladorService.buff.buff.length;
        this.seleccionarBuff({index: this.desarrolladorService.buff.buff.length-1})
    }


}





