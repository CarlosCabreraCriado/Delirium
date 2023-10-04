
import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LogicService {

  private sesion: any; 
  private parametros: any;

  constructor() { 
  }

  setParametros(parametros:any){
      this.parametros = parametros;
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
          reduccionResistencia: 0
        }

        //---------------------
        //  CALCULO ESTADISTICAS HEROE
        //---------------------

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

        //RANGOS RESISTENCIA:
        var resistenciaMaxPercent = this.parametros.armaduraMax;
        var resistenciaMinPercent = this.parametros.armaduraMin;
        var resMin = this.parametros.heroes.base["resistenciaMagica"]+(nivel*this.parametros.heroes.escalado["resistenciaMagica"]);
        var resMax = resMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

        var reduccionResistencia = resistenciaMinPercent+((estadisticas.resistenciaMagica-resMin)/(resMax-resMin))*(resistenciaMaxPercent-resistenciaMinPercent);
        reduccionResistencia = Math.round(reduccionResistencia * 100) / 100;
        estadisticas.reduccionResistencia = reduccionResistencia;

        //RANGOS VITALIDAD:
        var vitMin = this.parametros.heroes.base["vitalidad"]+(nivel*this.parametros.heroes.escalado["vitalidad"]);
        var vitMax = vitMin + this.parametros.objetos.tipoObjetoMax * (this.parametros.objetos.base+ nivel * this.parametros.objetos.escalado)

        var vidaBase = this.parametros.ratioVitalidadBase * vitMin;
        var vidaAdicional = (vidaBase*(armaduraMinPercent-armaduraMaxPercent)*((estadisticas.vitalidad-vitMin)/(vitMax-vitMin)))/((armaduraMaxPercent-armaduraMinPercent)*(((estadisticas.vitalidad-vitMin)/(vitMax-vitMin))+((estadisticas.armadura-armMin)/(armMax-armMin)))+armaduraMinPercent-1);

        estadisticas.vidaMaxima = vidaBase+vidaAdicional;
        estadisticas.vidaMaxima = Math.round(estadisticas.vidaMaxima * 10) / 10;

        estadisticas.pa = 0
        console.error("Estadisticas Calculadas: ",estadisticas)
        return estadisticas;

  }

}

