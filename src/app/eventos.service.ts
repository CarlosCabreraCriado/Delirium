
import { Injectable, EventEmitter, Output } from '@angular/core';
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
    public eventosMazmorra: any;

    public mostrarEvento:boolean= false;
    private estado:string="default";
    public eventoEjecutando: any;
    public indexOrdenEjecutando: number= 0;
    public salaOpenInicio: number = null;

    private sesion: any; 
    private estadoApp: any; 

    @Output() eventoMazmorraEmitter: EventEmitter<any> = new EventEmitter();
    @Output() eventoInMapEmitter: EventEmitter<any> = new EventEmitter();

    constructor(private appService: AppService, private dialog: MatDialog) {
        //Observar Sesion:
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
        this.appService.estadoApp$.subscribe(estadoApp => {
            this.estadoApp = estadoApp;
        });
    }

    setEventos(eventos: any){
      this.eventos = eventos;
    }

    getSalaOpenInicio(){
        var salaOpen = this.salaOpenInicio;
        this.salaOpenInicio = null;
        return salaOpen;
    }

    async actualizarEventos(){
        this.eventos = await this.appService.getEventos();
        var mazmorra = await this.appService.getMazmorra();

        if(mazmorra){
            this.eventosMazmorra = mazmorra["eventos"];
        }else{
            this.eventosMazmorra = [];
        }
    }

    ejecutarEvento(idEvento:number,tipoEvento?:string,tipoEventoRandom?:string){

        //Cargar Datos de eventos a ejecutar:
        switch(tipoEvento){
            case undefined:
            case "General":
                this.eventoEjecutando = this.eventos.eventos.find(i => i.id==idEvento);
                break;
            case "Random":
                if(!tipoEventoRandom){console.error("Error Ejecutando Evento: Tipo Evento Random no definido.");return;}
                this.eventoEjecutando = this.eventos.eventosRandom[tipoEventoRandom].find(i => i.id==idEvento);
                break;
            case "Variables":
                this.eventoEjecutando = this.eventos.eventosVariables.find(i => i.id==idEvento);
                break;
            case "Mazmorra":
                this.eventoEjecutando = this.eventosMazmorra.find(i => i.id==idEvento);
                break;
        }

        this.indexOrdenEjecutando = 0;

        if(!this.eventoEjecutando){console.error("No se encuentra evento con ID: "+idEvento);return;}

        this.ejecutarOrden(0);
    } 

    ejecutarOrden(indexOrden:number){
        //Verifica que se pueda ejecutar
        if(this.eventoEjecutando == null){this.finalizarEvento();return;}
        if(!this.eventoEjecutando?.ordenes){this.finalizarEvento();return;}
        if(indexOrden >= this.eventoEjecutando.ordenes.length){this.finalizarEvento();return;}
        if(indexOrden < 0){this.finalizarEvento();return;}

        //Identificar tipo Orden:
        var tipoOrden = this.eventoEjecutando.ordenes[indexOrden].tipo;

        switch(tipoOrden){
            case "variable":
                this.ejecutarOrdenVariable(indexOrden);
                break;
            case "condicion":
                this.ejecutarOrdenCondicion(indexOrden);
                break;
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
                    var heroeIndex = this.estadoApp.heroePropioSesionIndex;
                    orden.tipoPersonajeDerecha = "heroes";
                    orden.imagenPersonajeDerecha = this.sesion.render.heroes[heroeIndex]["id_imagen"];
                    orden.nombrePersonajeDerecha = this.sesion.render.heroes[heroeIndex]["nombre"];
                }
                if(orden.tipoPersonajeIzquierda == "self"){
                    var heroeIndex = this.estadoApp.heroePropioSesionIndex;
                    orden.tipoPersonajeIzquierda = "heroes";
                    orden.imagenPersonajeIzquierda = this.sesion.render.heroes[heroeIndex]["id_imagen"];
                    orden.nombrePersonajeIzquierda = this.sesion.render.heroes[heroeIndex]["nombre"];
                }
                var dialogRef = this.mostrarDialogo("Dialogo",{
                    titulo: orden.titulo,
                    contenido: orden.contenido, 
                    opciones: orden.opciones,
                    interlocutor: orden.interlocutor,
                    ordenEncadenado: orden.ordenEncadenado, 
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

                    //Ejecuta siguiente evento:
                    if(result == null || result == undefined || result == 0){
                        this.ejecutarOrden(indexOrden+1);
                        return;
                    }

                    //Ejecuta Detiene Ejecucion:
                    if(result < 0){
                        return;
                    }

                    //Ejecuta Encadenado:
                    if(result > 0){
                        var indexEncadenado = this.eventoEjecutando.ordenes.findIndex(i => i.id==result)
                        this.ejecutarOrden(indexEncadenado);
                        return;
                    }
                });
                break;

            case "NarradorImg":
                var dialogRef = this.mostrarDialogo("NarradorImg",{
                    titulo: orden.titulo,
                    contenido: orden.contenido, 
                    tipoImagen: orden.tipoImagen,
                    ordenEncadenado: orden.ordenEncadenado,
                    imagenId: orden.imagenId
                })

                dialogRef.afterClosed().subscribe(result => {
                    console.log('Fin del dialogo');
                    console.log(result)

                    //Ejecuta siguiente evento:
                    if(result == null || result == undefined || result == 0){
                        this.ejecutarOrden(indexOrden+1);
                        return;
                    }

                    //Ejecuta Detiene Ejecucion:
                    if(result < 0){
                        return;
                    }

                    //Ejecuta Encadenado:
                    if(result > 0){
                        var indexEncadenado = this.eventoEjecutando.ordenes.findIndex(i => i.id==result)
                        this.ejecutarOrden(indexEncadenado);
                        return;
                    }
                });
                
                break;

            case "Diapositiva":
                var dialogRef = this.mostrarDialogo("Diapositiva",{
                    titulo: orden.titulo,
                    contenido: orden.contenido, 
                    tipoImagen: orden.tipoImagen,
                    ordenEncadenado: orden.ordenEncadenado,
                    imagenId: orden.imagenId
                })

                dialogRef.afterClosed().subscribe(result => {
                    //console.log('Fin del dialogo');
                    //console.log(result)

                    //Ejecuta siguiente evento:
                    if(result == null || result == undefined || result == 0){
                        this.ejecutarOrden(indexOrden+1);
                        return;
                    }

                    //Ejecuta Detiene Ejecucion:
                    if(result < 0){
                        return;
                    }

                    //Ejecuta Encadenado:
                    if(result > 0){
                        var indexEncadenado = this.eventoEjecutando.ordenes.findIndex(i => i.id==result)
                        this.ejecutarOrden(indexEncadenado);
                        return;
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
                    if(salaOpenId){
                        this.salaOpenInicio = salaOpenId;
                    }
                    this.appService.iniciarMazmorra(mazmorraNombreId,salaOpenId);
                }else{
                    console.error("Error iniciando Mazmorra NombreID no valido: ",mazmorraNombreId)
                }
                break;
            case "openSala":
                    this.eventoMazmorraEmitter.emit({comando: "openSala",valor: salaOpenId})
                break;
            case "finalizar":
                    this.eventoMazmorraEmitter.emit({comando: "abandonarMazmorra"})
                break;


        }
        this.ejecutarOrden(indexOrden+1);
    }

    ejecutarOrdenVariable(indexOrden){

        var orden = this.eventoEjecutando.ordenes[indexOrden];

        // Comando Variable:
        switch(orden["comando"]){
            case "add":
            case "modificar":
                this.sesion.render.variablesMundo[orden.variableTarget] = orden.valorNuevo;
                break;
            case "remove":
                this.sesion.render.variablesMundo[orden.variableTarget] = null;
                if(orden.variableTarget=="tutorial"){
                    console.warn("FINN TUTOO")
                    this.eventoInMapEmitter.emit({comando: "finalizarTutorial"})
                }
                break;
            case "removeAll":
                this.sesion.render.variablesMundo = {};
                break;
            case "suma":
                var valorInicial = Number(this.sesion.variablesMundo[orden.variableTarget]);
                var valorOperador = Number(orden.valorOperador);
                this.sesion.render.variablesMundo[orden.variableTarget]= valorInicial + valorOperador;
                break;
            case "multiplica":
                var valorInicial = Number(this.sesion.render.variablesMundo[orden.variableTarget]);
                var valorOperador = Number(orden.valorOperador);
                this.sesion.render.variablesMundo[orden.variableTarget]= valorInicial * valorOperador;
                break;
        }
        this.ejecutarOrden(indexOrden+1)
    }

    ejecutarOrdenCondicion(indexOrden){

        var orden = this.eventoEjecutando.ordenes[indexOrden];

        var condicionSuperada = null;

        // Comando Variable:
        switch(orden["operador"]){
            case "==":
                if(this.sesion.render.variablesMundo[orden.variable] == orden.valorVariable){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;

            case "<":
                if(Number(this.sesion.render.variablesMundo[orden.variable]) < Number(orden.valorVariable)){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;
            case ">":
                if(Number(this.sesion.render.variablesMundo[orden.variable]) > Number(orden.valorVariable)){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;
            case "!=":
                if(Number(this.sesion.render.variablesMundo[orden.variable]) != Number(orden.valorVariable)){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;
            case "<=":
                if(Number(this.sesion.render.variablesMundo[orden.variable]) <= Number(orden.valorVariable)){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;
            case ">=":
                if(Number(this.sesion.render.variablesMundo[orden.variable]) >= Number(orden.valorVariable)){
                    condicionSuperada = true;
                }else{
                    condicionSuperada = false;
                }
                break;
        }

        //ENCADENADO TRUE:
        if(condicionSuperada){

            if(orden.encadenadoTrue == null){
                switch(orden.tipoEncadenadoTrue){
                    case "orden":
                        this.ejecutarOrden(indexOrden+1)
                        break;
                    case "evento":
                        break;
                }
                return;
            }
            if(orden.encadenadoTrue == -1){
                return;
            }
            if(orden.encadenadoTrue >= 0){
                switch(orden.tipoEncadenadoTrue){
                    case "orden":
                        this.ejecutarOrden(this.eventoEjecutando.ordenes.findIndex(i => i.id == Number(orden.encadenadoTrue)))
                        break;
                    case "evento":
                        this.ejecutarEvento(orden.encadenadoTrue)
                        break;
                }
            }   
        }
        
        //ENCADENADO FALSO:
        if(!condicionSuperada){
            if(orden.encadenadoFalse == null){
                switch(orden.tipoEncadenadoFalse){
                    case "orden":
                        this.ejecutarOrden(indexOrden+1)
                        break;
                    case "evento":
                        break;
                }
                return;
            }
            if(orden.encadenadoFalse == -1){
                return;
            }
            if(orden.encadenadoFalse >= 0){
                switch(orden.tipoEncadenadoFalse){
                    case "orden":
                        this.ejecutarOrden(this.eventoEjecutando.ordenes.findIndex(i => i.id == Number(orden.encadenadoFalse)))
                        break;
                    case "evento":
                        this.ejecutarEvento(orden.encadenadoFalse)
                        break;
                }
            }   

        }

    }//Fin ejecutarOrdenCondicion
    
    finalizarEvento(){
        //console.warn("Evento Finalizado");
        this.eventoMazmorraEmitter.emit({comando: "forceRender"})
        this.eventoEjecutando = null;
        this.indexOrdenEjecutando = 0;
        return;
    }

    mostrarDialogo(tipoDialogo:string, config:any):any{
        var desarrollo = false;
        if(this.estadoApp.pantalla == "desarrollador"){desarrollo = true;}
        const dialogRef = this.dialog.open(DialogoComponent,{
          width: "100px", 
          panelClass: [tipoDialogo, "generalContainer"],
          backdropClass: "fondoDialogo", 
          disableClose:true, 
          data: {
              inputLabel: config.inputLabel,
              deshabilitado: config.deshabilitado,
              tipoDialogo: tipoDialogo, 
              numJugadores: this.sesion.jugadores.length,
              jugadorPropioSesionIndex: this.estadoApp.jugadorPropioSesionIndex,
              desarrollo: desarrollo,
              titulo: config.titulo, 
              contenido: config.contenido,
              tipoImagen: config.tipoImagen,
              imagenId: config.imagenId,
              opciones: config.opciones, 
              interlocutor: config.interlocutor,
              ordenEncadenado: config.ordenEncadenado,
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

