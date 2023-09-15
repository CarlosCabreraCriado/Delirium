
import { Component , Input, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'detalleHechizoComponent',
  templateUrl: './detalle-hechizo.component.html',
  styleUrls: ['./detalle-hechizo.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class DetalleHechizoComponent implements OnChanges {

	@Input() hechizos: any; 
	@Input() buff: any; 
	@Input() idHechizoSeleccionado: any; 
	@Input() renderHeroe: any = null; 

    public hechizoSeleccionado: any = null;
    public buffsSeleccionados: any[] = [];
    public hechizoEncadenado: any = null;
    public buffsEncadenado: any[] = [];
    public mostrarBuff: boolean = false;
    public mostrarDetalle: boolean = false;

	constructor() {}

    ngOnChanges(){

        this.hechizoEncadenado= null;
        this.buffsEncadenado= [];
        this.buffsSeleccionados = [];

        //Asignación de objetos de hechizos:
        this.hechizoSeleccionado = Object.assign({},this.hechizos.find(i => i.id== this.idHechizoSeleccionado));
        if(Number(this.hechizoSeleccionado.hech_encadenado_id) > 0){
            this.hechizoEncadenado =Object.assign({},this.hechizos.find(i => i.id== this.hechizoSeleccionado.hech_encadenado_id))    
        }

        //Formateo de Descripciones:
        var descripciones = [];
        var escalados = [];

        descripciones.push(this.hechizoSeleccionado.descripcion);
        escalados.push({
            daño_esc_AD: this.hechizoSeleccionado.daño_esc_AD,
            daño_esc_AP: this.hechizoSeleccionado.daño_esc_AP,

            heal_esc_AD: this.hechizoSeleccionado.heal_esc_AD,
            heal_esc_AP: this.hechizoSeleccionado.heal_esc_AP,

            escudo_esc_AD: this.hechizoSeleccionado.escudo_esc_AD,
            escudo_esc_AP: this.hechizoSeleccionado.escudo_esc_AP,
        })

        if(this.hechizoEncadenado != null){
            descripciones.push(this.hechizoEncadenado.descripcion);
            escalados.push({
                daño_esc_AD: this.hechizoEncadenado.daño_esc_AD,
                daño_esc_AP: this.hechizoEncadenado.daño_esc_AP,

                heal_esc_AD: this.hechizoEncadenado.heal_esc_AD,
                heal_esc_AP: this.hechizoEncadenado.heal_esc_AP,

                escudo_esc_AD: this.hechizoEncadenado.escudo_esc_AD,
                escudo_esc_AP: this.hechizoEncadenado.escudo_esc_AP,
            })
        }

        //DETECTA BUFF HECHIZO:
        if(this.hechizoSeleccionado.buff_id.length > 0){
            for(var i = 0; i < this.hechizoSeleccionado.buff_id.length; i++){
                this.buffsSeleccionados.push(Object.assign({},this.buff.find(j => j.id== this.hechizoSeleccionado.buff_id[i])));
            }
        }

        //DETECTA BUFF ENCADENADO:
        if(this.hechizoEncadenado != null){
            if(this.hechizoEncadenado.buff_id.length > 0){
                for(var i = 0; i < this.hechizoEncadenado.buff_id.length; i++){
                    this.buffsSeleccionados.push(Object.assign({},this.buff.find(j => j.id== this.hechizoEncadenado.buff_id[i])));
                }
            }
        }//Fin Hechizo Encadenado.


        //Generación de Arrays de buffos:
        this.mostrarBuff = false;
        for(var i = 0; i < this.buffsSeleccionados.length; i++){
            descripciones.push(this.buffsSeleccionados[i].descripcion);
            escalados.push({
                daño_esc_AD: this.buffsSeleccionados[i].daño_esc_AD,
                daño_esc_AP: this.buffsSeleccionados[i].daño_esc_AP,

                heal_esc_AD: this.buffsSeleccionados[i].heal_esc_AD,
                heal_esc_AP: this.buffsSeleccionados[i].heal_esc_AP,

                escudo_esc_AD: this.buffsSeleccionados[i].escudo_esc_AD,
                escudo_esc_AP: this.buffsSeleccionados[i].escudo_esc_AP,
            })
            this.mostrarBuff= true;
        }

        for(var i = 0; i < descripciones.length; i++){
        
        //Formateo de color:
        descripciones[i] = descripciones[i].replaceAll("$fisico$","<mark class='fisico'>")
        descripciones[i] = descripciones[i].replaceAll("$magico$","<mark class='magico'>")
        descripciones[i] = descripciones[i].replaceAll("$heal$","<mark class='heal'>")
        descripciones[i] = descripciones[i].replaceAll("$escudo$","<mark class='escudo'>")
        descripciones[i] = descripciones[i].replaceAll("$debuff$","<mark class='violeta'>")
        descripciones[i] = descripciones[i].replaceAll("$buff$","<mark class='amarillo'>")
        descripciones[i] = descripciones[i].replaceAll("$amarillo$","<mark class='amarillo'>")
        descripciones[i] = descripciones[i].replaceAll("$/$","</mark>")

        //Formateo de valor: 
        var daño: number= 0;
        var heal: number= 0;
        var escudo: number= 0;

        var stringDaño: string = "";
        var stringHeal: string = "";
        var stringEscudo: string = "";

        var dad: string = "";
        var dap: string = "";
        var had: string = "";
        var hap: string = "";
        var ead: string = "";
        var eap: string = "";


        //Calculo de valores Totales Daño/Heal/Escudo.
        daño = (escalados[i].daño_esc_AD*this.renderHeroe.estadisticasBase.ad)+(escalados[i].daño_esc_AP*this.renderHeroe.estadisticasBase.ap);

        heal = (escalados[i].heal_esc_AD*this.renderHeroe.estadisticasBase.ad)+(escalados[i].heal_esc_AP*this.renderHeroe.estadisticasBase.ap);

        escudo = (escalados[i].escudo_esc_AD*this.renderHeroe.estadisticasBase.ad)+(escalados[i].escudo_esc_AP*this.renderHeroe.estadisticasBase.ap);

        daño = this.redondeo(daño);
        heal = this.redondeo(heal);
        escudo = this.redondeo(escudo);

        //Formateo de valores de detalle:
        if(this.mostrarDetalle){

            //DAÑO DETALLE:
            if(escalados[i].daño_esc_AD > 0){
                dad = String(this.redondeo(escalados[i].daño_esc_AD*this.renderHeroe.estadisticasBase.ad)+" (x"+String(this.redondeo(escalados[i].daño_esc_AD))+")[AD]")
            }
            if(escalados[i].daño_esc_AP > 0){
                dap = String(this.redondeo(escalados[i].daño_esc_AP*this.renderHeroe.estadisticasBase.ap)+" (x"+String(this.redondeo(escalados[i].daño_esc_AP))+")[AP]")
            }

            //HEAL DETALLE:
            if(escalados[i].heal_esc_AD > 0){
                had = String(this.redondeo(escalados[i].heal_esc_AD*this.renderHeroe.estadisticasBase.ad)+" (x"+String(this.redondeo(escalados[i].heal_esc_AD))+")[AD]")
            }
            if(escalados[i].heal_esc_AP > 0){
                hap = String(this.redondeo(escalados[i].heal_esc_AP*this.renderHeroe.estadisticasBase.ap)+" (x"+String(this.redondeo(escalados[i].heal_esc_AP))+")[AP]")
            }

            //ESCUDO DETALLE:
            if(escalados[i].escudo_esc_AD > 0){
                ead = String(this.redondeo(escalados[i].escudo_esc_AD*this.renderHeroe.estadisticasBase.ad)+" (x"+String(this.redondeo(escalados[i].escudo_esc_AD))+")[AD]")
            }
            if(escalados[i].escudo_esc_AP > 0){
                eap = String(this.redondeo(escalados[i].escudo_esc_AP*this.renderHeroe.estadisticasBase.ap)+" (x"+String(this.redondeo(escalados[i].escudo_esc_AP))+")[AP]")
            }

            //Montaje de String final con detalle:

            //DAÑO
            if(dad != "" && dap != ""){
                stringDaño = dad + " + " + dap;
            }else{
                stringDaño = dad + dap;
            }

            //HEAL
            if(had != "" && hap != ""){
                stringHeal = had + " + " + hap;
            }else{
                stringHeal = had + hap;
            }

            //ESCUDO
            if(ead != "" && eap != ""){
                stringEscudo = ead + " + " + eap;
            }else{
                stringEscudo = ead + eap;
            }

        }else{
            //VALOR SIN DETALLE:
            stringDaño = String(daño);
            stringHeal = String(heal);
            stringEscudo = String(escudo);
        }
 
        if(i == 1 && this.hechizoEncadenado!=null){
            descripciones[i-1] = descripciones[i-1].replaceAll("#DEnc",stringDaño)
            descripciones[i-1] = descripciones[i-1].replaceAll("#HEnc",stringHeal)
            descripciones[i-1] = descripciones[i-1].replaceAll("#EEnc",stringEscudo)
        }else{

            if(this.hechizoEncadenado!=null && i!=0){
            descripciones[i-1] = descripciones[i-1].replaceAll("#Daño",stringDaño)
            descripciones[i-1] = descripciones[i-1].replaceAll("#Heal",stringHeal)
            descripciones[i-1] = descripciones[i-1].replaceAll("#Escudo",stringEscudo)
            }else{
            descripciones[i] = descripciones[i].replaceAll("#Daño",stringDaño)
            descripciones[i] = descripciones[i].replaceAll("#Heal",stringHeal)
            descripciones[i] = descripciones[i].replaceAll("#Escudo",stringEscudo)
            }
        }


        }//Fin For Formateo de descripciones.

        //ASIGNACIÓN DE DESCRIPCIONES:
        this.hechizoSeleccionado.descripcion = descripciones[0];
        for(var i = 0; i < this.buffsSeleccionados.length; i++){
            if(this.hechizoEncadenado!=null){
            this.buffsSeleccionados[i].descripcion = descripciones[i+2];
            }else{
            this.buffsSeleccionados[i].descripcion = descripciones[i+1];
            }
        }

        return;
    }

    toggleDetalle(){
        this.mostrarDetalle = !this.mostrarDetalle;
        this.ngOnChanges();
    }

    redondeo(valor){
        return Math.round(valor * 10) / 10;
    }

}





