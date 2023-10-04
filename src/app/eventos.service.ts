import { Injectable, EventEmitter } from '@angular/core';
//import { Eventos } from './eventos.class';
import { AppService } from './app.service';
import { DialogoComponent } from './comun/dialogos/dialogos.component';
import { MatDialog} from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EventosService {

    public eventos: any;
    public mostrarEvento:boolean= false;
    private estado:string="default";
    public eventoEjecutando: any;
    public indexOrdenEjecutando: number= 0;

    private sesion: any; 

    //Declara Suscripcion para Eventos:
    private appServiceSuscripcion: Subscription;

    constructor(private appService: AppService, private dialog: MatDialog) {
        //Observar Sesion:
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
		//Observar Eventos AppService:
		this.appServiceSuscripcion = this.appService.eventoAppService.subscribe(
			async(val) => {
				switch(val){
					case "inicializarIsometrico":
                        this.eventos = await this.appService.getEventos();
                        console.error("Inicializando Eventos",this.eventos)
						break;
				}
		});
    }

    setEventos(eventos: any){
      this.eventos = eventos;
    }

    ejecutarEvento(idEvento:number){
        //Cargar Datos de eventos a ejecutar:
        console.log(this.eventos.eventos)
        console.log("ID: ",idEvento);
        this.eventoEjecutando = this.eventos.eventos.find(i => i.id==idEvento);
        this.indexOrdenEjecutando = 0;

        if(!this.eventoEjecutando){console.error("No se encuentra evento con ID: "+idEvento);return;}

        console.warn("Ejecutando: ",this.eventoEjecutando);
        this.ejecutarOrden(0);
    } 

    ejecutarOrden(indexOrden:number){
        //Verifica que se pueda ejecutar
        if(indexOrden >= this.eventoEjecutando.ordenes.length){this.finalizarEvento();return;}

        //Identificar tipo Orden:
        var tipoOrden = this.eventoEjecutando.ordenes[indexOrden].tipo;

        switch(tipoOrden){
            case "dialogo":
                this.ejecutarOrdenDialogo(indexOrden);
                break;
            case "mazmorra":
                this.ejecutarOrdenMazmorra(indexOrden,this.eventoEjecutando.ordenes[indexOrden]["comando"],this.eventoEjecutando.ordenes[indexOrden]["mazmorraId"],this.eventoEjecutando.ordenes[indexOrden]["salaOpenId"]);
                break;
            default:
                this.ejecutarOrden(indexOrden+1);
            break;
        }
        return;
    }

    ejecutarOrdenDialogo(indexOrden:number){
        var tipoDialogo = this.eventoEjecutando.ordenes[indexOrden].tipoDialogo; 
        var orden = this.eventoEjecutando.ordenes[indexOrden];

        switch(tipoDialogo){
            case "Dialogo":
                //Preprocesado de Orden:
                if(orden.tipoPersonajeDerecha == "self"){
                    var heroeIndex = this.appService.getHeroePropioSesionIndex();
                    console.warn(this.sesion,heroeIndex)
                    orden.tipoPersonajeDerecha = "heroes";
                    orden.imagenPersonajeDerecha = this.sesion.render.heroes[heroeIndex]["id_imagen"];
                    orden.nombrePersonajeDerecha = this.sesion.render.heroes[heroeIndex]["nombre"];
                }
                if(orden.tipoPersonajeIzquierda == "self"){
                    var heroeIndex = this.appService.getHeroePropioSesionIndex();
                    orden.tipoPersonajeIzquierda = "heroes";
                    orden.imagenPersonajeIzquierda = this.sesion.render.heroes[heroeIndex]["id_imagen"];
                    orden.nombrePersonajeIzquierda = this.sesion.render.heroes[heroeIndex]["nombre"];
                }
                const dialogRef = this.mostrarDialogo("Dialogo",{
                    titulo: orden.titulo,
                    contenido: orden.contenido, 
                    opciones: orden.opciones,
                    interlocutor: orden.interlocutor,
                    mostrarPersonajeDerecha: orden.mostrarPersonajeDerecha, 
                    mostrarPersonajeIzquierda: orden.mostrarPersonajeIzquierda,
                    tipoPersonajeDerecha: orden.tipoPersonajeDerecha, 
                    tipoPersonajeIzquierda: orden.tipoPersonajeIzquierda, 
                    imagenPersonajeDerecha: orden.imagenPersonajeDerecha, 
                    imagenPersonajeIzquierda: orden.imagenPersonajeIzquierda, 
                    nombrePersonajeDerecha: orden.nombrePersonajeDerecha, 
                    nombrePersonajeIzquierda: orden.nombrePersonajeIzquierda 
                })

                dialogRef.afterClosed().subscribe(result => {
                  console.log('Fin del dialogo');
                  console.log(result)
                  if(result != "continuar"){
                      var indexEncadenado = this.eventoEjecutando.ordenes.findIndex(i => i.id==orden.opciones[result]["ordenIdEncadanado"])
                      console.warn("Direccionando: ", indexEncadenado)
                      this.ejecutarOrden(indexEncadenado);
                  }else{
                      this.ejecutarOrden(indexOrden+1);
                  }
                });
                break;
        }
    }

    ejecutarOrdenMazmorra(indexOrden,comando,mazmorraNombreId:string,salaOpenId){
        //Iniciando Mazmorra:
        switch(comando){
            case "iniciar":
                if(mazmorraNombreId){
                    this.appService.iniciarMazmorra(mazmorraNombreId)
                }else{
                    console.error("Error iniciando Mazmorra NombreID no valido: ",mazmorraNombreId)
                }
                break;
        }
        this.ejecutarOrden(indexOrden+1);
    }
    
    finalizarEvento(){
        console.warn("Evento Finalizado");
        this.eventoEjecutando = null;
        this.indexOrdenEjecutando = 0;
        return;
    }

    mostrarDialogo(tipoDialogo:string, config:any):any{
        const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px", 
          panelClass: [tipoDialogo, "generalContainer"],
          backdropClass: "fondoDialogo", 
          disableClose:true, 
          data: {
              inputLabel: config.inputLabel,
              deshabilitado: config.deshabilitado,
              tipoDialogo: tipoDialogo, 
              titulo: config.titulo, 
              contenido: config.contenido,
              opciones: config.opciones, 
              interlocutor: config.interlocutor,
              mostrarPersonajeDerecha: config.mostrarPersonajeDerecha, 
              mostrarPersonajeIzquierda: config.mostrarPersonajeIzquierda,
              tipoPersonajeDerecha: config.tipoPersonajeDerecha, 
              tipoPersonajeIzquierda: config.tipoPersonajeIzquierda, 
              imagenPersonajeDerecha: config.imagenPersonajeDerecha, 
              imagenPersonajeIzquierda: config.imagenPersonajeIzquierda, 
              nombrePersonajeDerecha: config.nombrePersonajeDerecha, 
              nombrePersonajeIzquierda: config.nombrePersonajeIzquierda 
          }
        });
        return dialogRef;
    }

}

