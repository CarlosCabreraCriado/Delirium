import { Injectable } from '@angular/core';
import { AppService } from '../../app.service';


@Injectable({
  providedIn: 'root'
})

export class DesarrolladorService {

	public panel= "datos";
	public estadoInmap= "";
	public estadoMazmorra= "";
	public estadoDatos= "";
	public estadoAssets= "";

	//VARIABLES DE DATOS
	public archivoDato: any;
	public archivoDatoProvisional: any;
	public archivoSeleccionado="Null";
	public archivoSeleccionadoProvisional= "Null";

  constructor(public appService: AppService) { 
  }

  setPanel(panel):void{
  	this.panel= panel;
  }

  //*************************************************
  //		PANEL DATOS:
  //************************************************* 

	seleccionarAccionDato(opcion:string):void{
  		this.estadoDatos= opcion;
  		return;
	}

	seleccionarArchivoDato(archivo: string):void{
  		this.archivoSeleccionado= archivo;

  		switch (archivo) {
	
  			case "Heroes_Stats":
  				this.archivoDato= this.appService.getHeroesStats()
  				break;
	
  			case "Heroes_Hech":
  				this.archivoDato= this.appService.getHeroesHech()
  				break;
	
  			case "Enemigos":
  				this.archivoDato= this.appService.getEnemigos()
  				break;
	
  			case "Buff":
  				this.archivoDato= this.appService.getBuff()
  				break;
	
  			case "Objetos":
  				this.archivoDato= this.appService.getObjetos()
  				break;
	
  			case "Animaciones":
  				this.archivoDato= this.appService.getAnimaciones()
  				break;
	
  			case "Parametros":
  				this.archivoDato= this.appService.getParametros()
  				break;
	
  			case "Perfil":
  				this.archivoDato= this.appService.getPerfil()
  				break;
  			
  		}
  		return;
  	}

  modificarDatos(change):void{
		this.archivoDatoProvisional = change;
		this.archivoSeleccionadoProvisional = this.archivoSeleccionado;
	}

  
  cambiarEstadisticas(path){

    /*
    $("#botonCambiarEstadisticas").removeClass("visible");
    $("#botonCambiarEstadisticas").addClass("oculto");

    $("#contenedorSubirExcel").removeClass("visible");
    $("#contenedorSubirExcel").addClass("oculto");

    $("#progresoActualizacionDatos").removeClass("oculto");
    $("#progresoActualizacionDatos").addClass("visible");
    $("#barraCargaDatos").attr("style","width:0%;");
    */
    console.log(path)
    var documentos = new Array(11);

    //*************************************************
    //    Construir documento Generico 
    //*************************************************
  
    //Declaración de variables Generales:
    var documento= {};
    var columnas = [];
    var columnasAtrib= [];
    var result= {};
    var vectorPaginas= [];
  
    for (var docIndex =0; docIndex < documentos.length; docIndex++) {
    
      if(typeof path[docIndex] != "undefined"){
      
        documento= {};
        columnas = [];
        columnasAtrib= [];
      
        switch(docIndex){
        case 0: //HEROE STATS
        vectorPaginas= ['GUERRERO','CRUZADO','CAZADOR','CHRONOMANTE','HECHICERO','INGENIERO','ILUMINADO','MAGO_DE_SANGRE']
        documento={
          nombreId: "Heroes_Stats"
        };
        break;
        case 1: //HEROES HECH
        vectorPaginas= ['ANGEL_CAIDO','CABALLERO','CAZADOR','CHRONOMANTE','CLERIGO','CRUZADO','ENANO','GLADIADOR','HECHICERO','INGENIERO','LICH','MINOTAURO','SEGADOR_DE_ALMAS']
        documento={
          nombreId: "Heroes_Hech"
        };
        break;
        case 2: //ENEMIGOS
        vectorPaginas= ['ENEMIGOS_STATS','ENEMIGOS_HECH','ENEMIGOS_PASIVAS','ENEMIGOS_BUFFOS']
        documento={
          nombreId: "Enemigos"
        };
        break;
        case 3: //BUFF
        vectorPaginas= ['BUFF']
        documento={
          nombreId: "Buff"
        };
        break;
        case 4: //OBJETOS
        vectorPaginas= ['EQUIPO','CONSUMIBLE']
        documento={
          nombreId: "Objetos"
        };
        break;
        case 5: //MAZMORRA SNACK
        vectorPaginas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
        documento={
          nombreId: "MazmorraSnack"
        };
        break;
        case 6: //GUARDADO SNACK
        vectorPaginas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
        documento={
          nombreId: "GuardadoSnack"
        };
        break;
        case 7: //MAZMORRA DUMMY
        vectorPaginas= ['GENERAL','SALAS','ENEMIGOS','EVENTOS','DIALOGOS']
        documento={
          nombreId: "MazmorraDummy"
        };
        break;
        case 8: //GUARDADO DUMMY
        vectorPaginas= ['GENERAL','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
        documento={
          nombreId: "GuardadoDummy"
        };
        break;
        case 9: //ANIMACIONES
        vectorPaginas= ['ANIMACIONES']
        documento={
          nombreId: "Animaciones"
        };
        break;
        case 10: //PARAMETROS
        vectorPaginas= ['PERSONAJES','ATRIBUTOS','ESCALADO']
        documento={
          nombreId: "Parametros"
        };
        break;
        case 11: //PERFIL
        vectorPaginas= ['LOGROS','HEROES','OBJETOS','OBJETOS_GLOBALES','MISIONES','INMAP']
        documento={
          nombreId: "Perfil"
        };
        break;
        }
      
        /*result = excelToJson({
          sourceFile: path[docIndex],
          header: {
            rows: 12
          },
          sheets: vectorPaginas
        });*/
        
        
        // Iteracion por pagina:
        for (var i = 0; i < vectorPaginas.length; i++) {
        
        documento[vectorPaginas[i].toLowerCase()] = [];
        columnas= result[vectorPaginas[i]][0];
        columnasAtrib = Object.keys(columnas);
        
        //Iteracion por fila:
        for (var j = 1; j < result[vectorPaginas[i]].length; j++) {
          
          documento[vectorPaginas[i].toLowerCase()].push({});
          
          //Iteracion por columna:
          for (var k = 0; k < columnasAtrib.length; k++) {
            documento[vectorPaginas[i].toLowerCase()][documento[vectorPaginas[i].toLowerCase()].length-1][columnas[columnasAtrib[k]].toLowerCase()] = result[vectorPaginas[i]][j][columnasAtrib[k]]
          }
        }
        }
        
        console.log("DOCUMENTO: ");
        console.log(documento);
          
        documentos[docIndex]= documento;
      } 
    }
  }


} //FIN EXPORT
