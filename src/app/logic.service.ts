
import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LogicService {

  private sesion: any; 
  private parametros: any;
  private clases: any;
  private enemigos: any;

  constructor() { 
  }

  setParametros(parametros:any){
      this.parametros = parametros;
  };

  setClases(clases:any){
      this.clases = clases;
  };

  setEnemigos(enemigos:any){
      this.enemigos = enemigos.enemigos;
  };

  calcularEstadisticasBaseHeroe(personaje:any):any{

        var nivel;
        var estadisticas = {
          vidaMaxima: 0,
          pa: 0,
          ad: 0,
          ap: 0,
          critico: 0,
          pa_base: 0,
          ad_base: 0,
          ap_base: 0,
          critico_base: 0,
          armadura: 0,
          multiplicadorDanoTipoArmadura: 1,
          multiplicadorDefensaTipoArmadura: 1,
          potenciaCritico: 0,
          potenciaCriticoFisico: 0,
          potenciaCriticoMagico: 0,
          probabilidadCritico: 0,
          resistenciaMagica: 0,
          vitalidad: 0,
          reduccionArmadura: 0,
          reduccionResistencia: 0,
        }

        //---------------------
        //  CALCULO ESTADISTICAS HEROE
        //---------------------

        var indexClase = null;
        switch(personaje.clase){
            case "guerrero":
                indexClase = 0
                break;
            case "hechicero":
                indexClase = 1
                break;
            case "cazador":
                indexClase = 2
                break;
            case "sacerdote":
                indexClase = 3
                break;
            case "ladrón":
            case "ladron":
                indexClase = 4
                break;
        }

        if(indexClase == null){console.error("ERROR, Clase no valida"); return;}

        nivel = personaje.nivel;

        //Calcula estadisticas BASE HEROE:
        estadisticas.pa = 0
        estadisticas.ad = this.clases.clases[indexClase].estadisticas.AD + nivel * this.clases.clases[indexClase].escalado.AD_esc;
        estadisticas.ap = this.clases.clases[indexClase].estadisticas.AP + nivel * this.clases.clases[indexClase].escalado.AP_esc;
        estadisticas.critico = this.clases.clases[indexClase].estadisticas.critico + nivel * this.clases.clases[indexClase].escalado.critico_esc;

        estadisticas.armadura = this.clases.clases[indexClase].estadisticas.armadura + nivel * this.clases.clases[indexClase].escalado.armadura_esc;
       estadisticas.vitalidad = this.clases.clases[indexClase].estadisticas.vitalidad + nivel * this.clases.clases[indexClase].escalado.vitalidad_esc;
        estadisticas.resistenciaMagica = this.clases.clases[indexClase].estadisticas.resistencia_magica + nivel * this.clases.clases[indexClase].escalado.resistencia_magica_esc;

        //Añadir estadisticas de objetos equipados:
        var multiplicadorDañoTipoArmadura = 1;
        var multiplicadorDefensaTipoArmadura = 1;

        for(var i = 0; i < personaje.objetos.equipado.length; i++){
            if(personaje.objetos.equipado[i] == null){continue;}
            estadisticas.pa = estadisticas.pa + personaje.objetos.equipado[i].estadisticas.PA
            estadisticas.ad = estadisticas.ad + personaje.objetos.equipado[i].estadisticas.AD
            estadisticas.ap = estadisticas.ap + personaje.objetos.equipado[i].estadisticas.AP
            estadisticas.critico = estadisticas.critico + personaje.objetos.equipado[i].estadisticas.critico

            estadisticas.armadura = estadisticas.armadura + personaje.objetos.equipado[i].estadisticas.armadura
            estadisticas.vitalidad = estadisticas.vitalidad + personaje.objetos.equipado[i].estadisticas.vitalidad
            estadisticas.resistenciaMagica = estadisticas.resistenciaMagica + personaje.objetos.equipado[i].estadisticas.resistencia_magica

            if(personaje.objetos.equipado[i].tipo == "Ligera"){multiplicadorDañoTipoArmadura += this.parametros.objetos.modificadorDanoLigera}
            if(personaje.objetos.equipado[i].tipo == "Pesada"){multiplicadorDañoTipoArmadura += this.parametros.objetos.modificadorDanoPesada}
            if(personaje.objetos.equipado[i].tipo == "Pesada"){multiplicadorDefensaTipoArmadura += this.parametros.objetos.modificadorDefensaPesada}
            if(personaje.objetos.equipado[i].tipo == "Ligera"){multiplicadorDefensaTipoArmadura += this.parametros.objetos.modificadorDefensaLigera}
        }

        multiplicadorDañoTipoArmadura = Math.round(multiplicadorDañoTipoArmadura * 100) / 100;
        multiplicadorDefensaTipoArmadura = Math.round(multiplicadorDefensaTipoArmadura * 100) / 100;

        estadisticas.pa_base = estadisticas.pa
        estadisticas.ap_base = estadisticas.ap
        estadisticas.ad_base = estadisticas.ad 
        estadisticas.critico_base = estadisticas.critico

        estadisticas.pa = this.redondeo(estadisticas.pa * multiplicadorDañoTipoArmadura);
        estadisticas.ap = this.redondeo(estadisticas.ap * multiplicadorDañoTipoArmadura);
        estadisticas.ad = this.redondeo(estadisticas.ad * multiplicadorDañoTipoArmadura);
        estadisticas.critico = this.redondeo(estadisticas.critico * multiplicadorDañoTipoArmadura);

        estadisticas.vitalidad = this.redondeo(estadisticas.vitalidad * multiplicadorDefensaTipoArmadura);
        estadisticas.armadura = this.redondeo(estadisticas.armadura * multiplicadorDefensaTipoArmadura);
        estadisticas.resistenciaMagica = this.redondeo(estadisticas.resistenciaMagica * multiplicadorDefensaTipoArmadura);
        estadisticas.multiplicadorDefensaTipoArmadura = multiplicadorDefensaTipoArmadura;
        estadisticas.multiplicadorDanoTipoArmadura = multiplicadorDañoTipoArmadura;

        //Calculo de la vida Maxima (HEROE):

        //PROBABILIDAD CRITICO:
        var criticoMaxPercent = this.parametros.criticoMax;
        var criticoMinPercent = this.parametros.criticoMin;
        var criticoMin = this.parametros.heroes.base["critico"]+(nivel*this.parametros.heroes.escalado["critico"]);

        var criticoMax = criticoMin + (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado) * (this.parametros.objetos.distribucionArmadura * this.parametros.objetos.tipoObjArmaduraMax +
    this.parametros.objetos.distribucionArma * this.parametros.objetos.tipoObjArmaOfensivaMax)

        var potenciaMin = this.parametros.potenciaCriticoMin;

        var sumaOfensiva = estadisticas.ad + estadisticas.ap;

        var probabilidadCritico = criticoMinPercent+((estadisticas.critico-criticoMin)/(criticoMax-criticoMin))*(criticoMaxPercent-criticoMinPercent);

        var potenciaCritico = ((sumaOfensiva+estadisticas.critico-criticoMin)*(1+criticoMinPercent*(potenciaMin-1))-sumaOfensiva*(1-probabilidadCritico))/(sumaOfensiva*probabilidadCritico);
        var potenciaCriticoFisico = potenciaCritico*(estadisticas.ad/sumaOfensiva);
        var potenciaCriticoMagico = potenciaCritico*(estadisticas.ap/sumaOfensiva);

        if(potenciaCriticoFisico < 1){
            potenciaCriticoFisico = 1;
            potenciaCriticoMagico = potenciaCritico - 1;
        }

        if(potenciaCriticoMagico < 1){
            potenciaCriticoMagico = 1;
            potenciaCriticoFisico = potenciaCritico - 1;
        }

        probabilidadCritico = Math.round(probabilidadCritico * 100) / 100;
        potenciaCritico = Math.round(potenciaCritico * 100) / 100;
        estadisticas.probabilidadCritico = probabilidadCritico;
        estadisticas.potenciaCritico = potenciaCritico;
        estadisticas.potenciaCriticoFisico = potenciaCriticoFisico;
        estadisticas.potenciaCriticoMagico = potenciaCriticoMagico;

        estadisticas.potenciaCriticoFisico = potenciaCritico;
        estadisticas.potenciaCriticoMagico = potenciaCritico;

        //RANGOS ARMADURA:
        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armMin = this.parametros.heroes.base["armadura"]+(nivel*this.parametros.heroes.escalado["armadura"]);

        var armMax = armMin + (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado) * (this.parametros.objetos.distribucionArmadura * this.parametros.objetos.tipoObjArmaduraMax +
    this.parametros.objetos.distribucionArma * this.parametros.objetos.tipoObjArmaDefensivaMax)

        var reduccionArmadura = armaduraMinPercent+((estadisticas.armadura-armMin)/(armMax-armMin))*(armaduraMaxPercent-armaduraMinPercent);

        reduccionArmadura = Math.round(reduccionArmadura * 100) / 100;
        estadisticas.reduccionArmadura = reduccionArmadura;

        //RANGOS RESISTENCIA:
        var resistenciaMaxPercent = this.parametros.armaduraMax;
        var resistenciaMinPercent = this.parametros.armaduraMin;
        var resMin = this.parametros.heroes.base["resistenciaMagica"]+(nivel*this.parametros.heroes.escalado["resistenciaMagica"]);

        var resMax = resMin + (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado) * (this.parametros.objetos.distribucionArmadura * this.parametros.objetos.tipoObjArmaduraMax +
    this.parametros.objetos.distribucionArma * this.parametros.objetos.tipoObjArmaDefensivaMax)

        var reduccionResistencia = resistenciaMinPercent+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
        reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;
        estadisticas.reduccionResistencia = reduccionResistencia;

        //RANGOS VITALIDAD:
        var vitMin = this.parametros.heroes.base["vitalidad"]+(nivel*this.parametros.heroes.escalado["vitalidad"]);

        var vitMax = vitMin + (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado) * (this.parametros.objetos.distribucionArmadura * this.parametros.objetos.tipoObjArmaduraMax +
    this.parametros.objetos.distribucionArma * this.parametros.objetos.tipoObjArmaDefensivaMax)

        var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
        var factorNerfVit = this.parametros.factorNerfVitalidad;

        var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*(factorNerfVit*(estadisticas.vitalidad-vitMin)/(vitMax-vitMin)))/((armaduraMaxPercent-armaduraMinPercent)*(factorNerfVit*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)/(armMax-armMin))+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin)))+armaduraMinPercent-1);

        estadisticas.vidaMaxima = vidaBase + vidaAdicional;
        estadisticas.vidaMaxima = Math.round(estadisticas.vidaMaxima * 10) / 10;

        estadisticas.pa = 0
        return estadisticas;

  }

  calcularEstadisticasBaseEnemigo(enemigo:any):any{

        var nivel;
        var estadisticas = {
          vidaMaxima: 0,
          pa: 0,
          ad: 0,
          ap: 0,
          armadura: 0,
          critico: 0,
          potenciaCritico: 0,
          probabilidadCritico: 0,
          resistenciaMagica: 0,
          vitalidad: 0,
          reduccionArmadura: 0,
          reduccionResistencia: 0
        }

        //---------------------
        //  CALCULO ENEMIGO
        //---------------------

            //Calcula estadisticas ENEMIGO:
            var indexTipoEnemigo = this.enemigos.findIndex( i => i.id == enemigo.tipo_enemigo_id);

            nivel = Number(enemigo.nivel);

            estadisticas.pa = this.enemigos[indexTipoEnemigo].estadisticas.pa + nivel * this.enemigos[indexTipoEnemigo].escalado.pa_esc;
            estadisticas.ad = this.enemigos[indexTipoEnemigo].estadisticas.ad + nivel * this.enemigos[indexTipoEnemigo].escalado.ad_esc;
            estadisticas.ap = this.enemigos[indexTipoEnemigo].estadisticas.ap + nivel * this.enemigos[indexTipoEnemigo].escalado.ap_esc;
            estadisticas.critico = this.enemigos[indexTipoEnemigo].estadisticas.critico + nivel * this.enemigos[indexTipoEnemigo].escalado.critico_esc;

            estadisticas.armadura = this.enemigos[indexTipoEnemigo].estadisticas.armadura + nivel * this.enemigos[indexTipoEnemigo].escalado.armadura_esc;
            estadisticas.vitalidad = this.enemigos[indexTipoEnemigo].estadisticas.vitalidad + nivel * this.enemigos[indexTipoEnemigo].escalado.vitalidad_esc;
            estadisticas.resistenciaMagica = this.enemigos[indexTipoEnemigo].estadisticas.resistencia_magica + nivel * this.enemigos[indexTipoEnemigo].escalado.resistencia_magica_esc;

            //RANGOS ARMADURA:
            var armaduraMaxPercent = this.parametros.armaduraMax;
            var armaduraMinPercent = this.parametros.armaduraMin;
            var armMin = this.parametros.enemigos.base["armadura"]+(nivel*this.parametros.enemigos.escalado["armadura"]);
            var armMax = armMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)

            var reduccionArmadura = armaduraMinPercent+((estadisticas.armadura-armMin)/(armMax-armMin))*(armaduraMaxPercent-armaduraMinPercent);
            reduccionArmadura = Math.round(reduccionArmadura * 100) / 100;
            estadisticas.reduccionArmadura = reduccionArmadura;


            //RANGOS RESISTENCIA:
            var resistenciaMaxPercent = this.parametros.armaduraMax;
            var resistenciaMinPercent = this.parametros.armaduraMin;
            var resMin = this.parametros.enemigos.base["resistenciaMagica"]+(nivel*this.parametros.enemigos.escalado["resistenciaMagica"]);
            var resMax = resMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)

            var reduccionResistencia = resistenciaMinPercent+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
            reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;
            estadisticas.reduccionResistencia = reduccionResistencia;

            //RANGOS VITALIDAD:
            var vitMin = this.parametros.enemigos.base["vitalidad"]+ (nivel * this.parametros.enemigos.escalado["vitalidad"]);
            var vitMax = vitMin + this.parametros.enemigos.baseRango + (nivel * this.parametros.enemigos.escaladoRango);

            var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
            var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))) / ((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)/(armMax-armMin)))+armaduraMinPercent-1);

            estadisticas.vidaMaxima = vidaBase+vidaAdicional;
            estadisticas.vidaMaxima = Math.round(estadisticas.vidaMaxima * 10) / 10;

            estadisticas.pa = 0

            return estadisticas;

  } //Fin calcular estadisticas Base Enemigo

  calcularReduccionArmadura(tipoObjetivo: "heroes"|"enemigos", armadura: number, nivel: number){

            //RANGOS ARMADURA:
            var armaduraMaxPercent = this.parametros.armaduraMax;
            var armaduraMinPercent = this.parametros.armaduraMin;
            var armMin = 0;
            var armMax = 0;

            switch(tipoObjetivo){
                case "heroes":
                    armMin = this.parametros.heroes.base["armadura"]+(nivel*this.parametros.heroes.escalado["armadura"]);
                    armMax = armMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)
                    break;
                case "enemigos":
                    armMin = this.parametros.enemigos.base["armadura"]+(nivel*this.parametros.enemigos.escalado["armadura"]);
                    armMax = armMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)
                    break;
            }

            var reduccionArmadura = armaduraMinPercent+((armadura-armMin)/(armMax-armMin))*(armaduraMaxPercent-armaduraMinPercent);
            reduccionArmadura = Math.round(reduccionArmadura * 100) / 100;

            if(reduccionArmadura > 1){
              reduccionArmadura = 1;
            }

            return reduccionArmadura;
  }

  calcularReduccionResistencia(tipoObjetivo: "heroes"|"enemigos", resistencia: number, nivel: number){

            //RANGOS ARMADURA:
            var resistenciaMaxPercent = this.parametros.armaduraMax;
            var resistenciaMinPercent = this.parametros.armaduraMin;
            var resMin = 0;
            var resMax = 0;

            switch(tipoObjetivo){
                case "heroes":
                    resMin = this.parametros.heroes.base["resistenciaMagica"]+(nivel*this.parametros.heroes.escalado["resistenciaMagica"]);
                    resMax = resMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)
                    break;
                case "enemigos":
                    resMin = this.parametros.enemigos.base["resistenciaMagica"]+(nivel*this.parametros.enemigos.escalado["resistenciaMagica"]);
                    resMax = resMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)
                    break;
            }

            var reduccionResistencia = resistenciaMinPercent+((resistencia-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
            reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;

            if(reduccionResistencia > 1){
              reduccionResistencia = 1;
            }

            return reduccionResistencia;
  }

  redondeo(valor:number){
        return Math.round(valor * 100) / 100;
  }


}

