
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
          armadura: 0,
          critico: 0,
          potenciaCritico: 0,
          probabilidadCritico: 0,
          probabilidadCriticoPercent: 0,
          resistenciaMagica: 0,
          vitalidad: 0,
          reduccionArmadura: 0,
          reduccionArmaduraPercent: 0,
          reduccionResistencia: 0,
          reduccionResistenciaPercent: 0
        }

        //---------------------
        //  CALCULO ESTADISTICAS HEROE
        //---------------------

        console.warn("Personaje: ", personaje)
        nivel = personaje.nivel;

        //Calcula estadisticas BASE HEROE:
        estadisticas.pa = this.parametros.heroes.base.pa + nivel * this.parametros.heroes.escalado.pa
        estadisticas.ad = this.parametros.heroes.base.ad + nivel * this.parametros.heroes.escalado.ad
        estadisticas.ap = this.parametros.heroes.base.ap + nivel * this.parametros.heroes.escalado.ap
        estadisticas.critico = this.parametros.heroes.base.critico + nivel * this.parametros.heroes.escalado.critico

        estadisticas.armadura = this.parametros.heroes.base.armadura + nivel * this.parametros.heroes.escalado.armadura
       estadisticas.vitalidad = this.parametros.heroes.base.vitalidad + nivel * this.parametros.heroes.escalado.vitalidad
        estadisticas.resistenciaMagica = this.parametros.heroes.base.resistenciaMagica + nivel * this.parametros.heroes.escalado.resistenciaMagica

        //Añadir estadisticas de objetos equipados:
        for(var i = 0; i < personaje.objetos.equipado.length; i++){
            if(personaje.objetos.equipado[i] == null){continue;}
            estadisticas.pa = estadisticas.pa + personaje.objetos.equipado[i].estadisticas.PA
            estadisticas.ad = estadisticas.ad + personaje.objetos.equipado[i].estadisticas.AD
            estadisticas.ap = estadisticas.ap + personaje.objetos.equipado[i].estadisticas.AP
            estadisticas.critico = estadisticas.critico + personaje.objetos.equipado[i].estadisticas.critico

            estadisticas.armadura = estadisticas.armadura + personaje.objetos.equipado[i].estadisticas.armadura
            estadisticas.vitalidad = estadisticas.vitalidad + personaje.objetos.equipado[i].estadisticas.vitalidad
            estadisticas.resistenciaMagica = estadisticas.resistenciaMagica + personaje.objetos.equipado[i].estadisticas.resistencia_magica
        }

        //Calculo de la vida Maxima (HEROE):

        //PROBABILIDAD CRITICO:
        var criticoMaxPercent = this.parametros.criticoMax;
        var criticoMinPercent = this.parametros.criticoMin;
        var criticoMin = this.parametros.heroes.base["critico"]+(nivel*this.parametros.heroes.escalado["critico"]);
        var criticoMax = criticoMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)
        var potenciaMin = this.parametros.potenciaCriticoMin;

        var estadisticaPrincipal = 0;
        if(estadisticas.ad > estadisticas.ap){
          estadisticaPrincipal = estadisticas.ad;
        }else{
          estadisticaPrincipal = estadisticas.ap;
        }

        var probabilidadCritico = criticoMinPercent+((estadisticas.critico-criticoMin)/(criticoMax-criticoMin))*(criticoMaxPercent-criticoMinPercent);
        var potenciaCritico = ((estadisticaPrincipal+estadisticas.critico-criticoMin)*(1+criticoMinPercent*(potenciaMin-1))-estadisticaPrincipal*(1-probabilidadCritico))/(estadisticaPrincipal*probabilidadCritico);
        //var potenciaCritico = ((estadisticas.critico-criticoMin)/(estadisticaPrincipal*(probabilidadCritico-criticoMinPercent)))+potenciaMin;


        probabilidadCritico = Math.round(probabilidadCritico * 100) / 100;
        potenciaCritico = Math.round(potenciaCritico * 100) / 100;
        estadisticas.probabilidadCritico = probabilidadCritico;
        estadisticas.probabilidadCriticoPercent = Math.round(probabilidadCritico*100);
        estadisticas.potenciaCritico = potenciaCritico;

        //RANGOS ARMADURA:
        var armaduraMaxPercent = this.parametros.armaduraMax;
        var armaduraMinPercent = this.parametros.armaduraMin;
        var armMin = this.parametros.heroes.base["armadura"]+(nivel*this.parametros.heroes.escalado["armadura"]);
        var armMax = armMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

        var reduccionArmadura = armaduraMinPercent+((estadisticas.armadura-armMin)/(armMax-armMin))*(armaduraMaxPercent-armaduraMinPercent);

        reduccionArmadura = Math.round(reduccionArmadura * 100) / 100;
        estadisticas.reduccionArmadura = reduccionArmadura;
        estadisticas.reduccionArmaduraPercent = Math.round(reduccionArmadura*100);

        //RANGOS RESISTENCIA:
        var resistenciaMaxPercent = this.parametros.armaduraMax;
        var resistenciaMinPercent = this.parametros.armaduraMin;
        var resMin = this.parametros.heroes.base["resistenciaMagica"]+(nivel*this.parametros.heroes.escalado["resistenciaMagica"]);
        var resMax = resMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

        var reduccionResistencia = resistenciaMinPercent+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
        reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;
        estadisticas.reduccionResistencia = reduccionResistencia;
        estadisticas.reduccionResistenciaPercent = Math.round(reduccionResistencia*100);

        //RANGOS VITALIDAD:
        var vitMin = this.parametros.heroes.base["vitalidad"]+(nivel*this.parametros.heroes.escalado["vitalidad"]);
        var vitMax = vitMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

        var vidaBase = this.parametros.ratioVitalidadBase * vitMin;

        var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin)))/((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)/(armMax-armMin)))+armaduraMinPercent-1);

        estadisticas.vidaMaxima = vidaBase+vidaAdicional;
        estadisticas.vidaMaxima = Math.round(estadisticas.vidaMaxima * 10) / 10;

        estadisticas.pa = 0
        console.log("Estadisticas Calculadas: ",estadisticas)
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
          probabilidadCriticoPercent: 0,
          resistenciaMagica: 0,
          vitalidad: 0,
          reduccionArmadura: 0,
          reduccionArmaduraPercent: 0,
          reduccionResistencia: 0,
          reduccionResistenciaPercent: 0
        }

        //---------------------
        //  CALCULO ENEMIGO
        //---------------------

      //Calcula estadisticas ENEMIGO:
            var indexTipoEnemigo = enemigo.enemigo_id;

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

            estadisticas.reduccionArmaduraPercent = Math.round(reduccionArmadura*100);

            console.warn("REDUC: ",reduccionArmadura)
            console.warn("NIVEL: ",nivel)

            console.warn("%ARmin: ",armaduraMinPercent)
            console.warn("%ARmax: ",armaduraMaxPercent)

            console.warn("Armadura: ",estadisticas.armadura)

            console.warn("ARmin: ",armMin)
            console.warn("ARmax: ",armMax)

            //RANGOS RESISTENCIA:
            var resistenciaMaxPercent = this.parametros.armaduraMax;
            var resistenciaMinPercent = this.parametros.armaduraMin;
            var resMin = this.parametros.enemigos.base["resistenciaMagica"]+(nivel*this.parametros.enemigos.escalado["resistenciaMagica"]);
            var resMax = resMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)

            var reduccionResistencia = resistenciaMinPercent+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
            reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;
            estadisticas.reduccionResistencia = reduccionResistencia;
            estadisticas.reduccionResistenciaPercent = Math.round(reduccionResistencia*100);

            //RANGOS VITALIDAD:
            var vitMin = this.parametros.enemigos.base["vitalidad"]+ (nivel * this.parametros.enemigos.escalado["vitalidad"]);
            var vitMax = vitMin + this.parametros.enemigos.baseRango + (nivel * this.parametros.enemigos.escaladoRango);

            var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
            var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))) / ((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)/(armMax-armMin)))+armaduraMinPercent-1);

            estadisticas.vidaMaxima = vidaBase+vidaAdicional;
            estadisticas.vidaMaxima = Math.round(estadisticas.vidaMaxima * 10) / 10;

            estadisticas.pa = 0
            console.log("Estadisticas Enemigo Calculadas: ",estadisticas)
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
                    console.error("HEROE")
                    armMin = this.parametros.heroes.base["armadura"]+(nivel*this.parametros.heroes.escalado["armadura"]);
                    armMax = armMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)
                    break;
                case "enemigos":
                    console.error("ENEMIGO")
                    armMin = this.parametros.enemigos.base["armadura"]+(nivel*this.parametros.enemigos.escalado["armadura"]);
                    armMax = armMin + (this.parametros.enemigos.baseRango+ nivel * this.parametros.enemigos.escaladoRango)
                    break;
            }

            var reduccionArmadura = armaduraMinPercent+((armadura-armMin)/(armMax-armMin))*(armaduraMaxPercent-armaduraMinPercent);
            reduccionArmadura = Math.round(reduccionArmadura * 100) / 100;

            console.warn("REDUC: ",reduccionArmadura)
            console.warn("NIVEL: ",nivel)

            console.warn("%ARmin: ",armaduraMinPercent)
            console.warn("%ARmax: ",armaduraMaxPercent)

            console.warn("Armadura: ",armadura)

            console.warn("ARmin: ",armMin)
            console.warn("ARmax: ",armMax)

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

