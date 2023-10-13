
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DesarrolladorService } from '../desarrollador.service';
import { Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { Subscription } from "rxjs";
import { RenderReticula } from '../renderReticula.class';
import { AppService } from '../../../app.service';

type TipoEstado = "reticula"|"isometrico"|"general"|"salas"|"enemigos"|"eventos";

@Component({
  selector: 'dungeonBuilderComponent',
  templateUrl: './dungeonBuilder.component.html',
  styleUrls: ['./dungeonBuilder.component.sass']
})


export class DungeonBuilderComponent {

    //Formularios
    private formGeneral: UntypedFormGroup;
    private formSala: UntypedFormGroup;
    private formEnemigos: UntypedFormGroup;
    private formEventosMazmorra: UntypedFormGroup;
    private formDialogos: UntypedFormGroup;
    private formAsignarSala: UntypedFormGroup;
    private formAsignarEvento: UntypedFormGroup;
    private formPropiedadesIsometrico: UntypedFormGroup;
    private formAsignarTipo: UntypedFormGroup;
    private formAsignarEnemigo: UntypedFormGroup;
    private formAsignarEspecial: UntypedFormGroup;

    //Campos General:
    private nombre_General = new UntypedFormControl("Primera mazmorra");
    private descripcion_General = new UntypedFormControl('Mazmorra de ejemplo');
    private imagen_id_General = new UntypedFormControl(0);
    private nivel_General = new UntypedFormControl(0);
    private evento_start_id_General = new UntypedFormControl(0);
    private evento_finish_id_General = new UntypedFormControl(0);
    private loot_finish_id_General = new UntypedFormControl(0);

    //Campos Sala:
    private sala_id_Sala = new UntypedFormControl({value: 0});
    private nombre_Sala = new UntypedFormControl('Sala');
    private inicial_Sala = new UntypedFormControl(false);
    private descripcion_Sala = new UntypedFormControl('Sala de ejemplo');
    private evento_inicial_id_Sala = new UntypedFormControl(0);
    private evento_final_id_Sala = new UntypedFormControl(0);
    private mostrarIsometricoSala = new UntypedFormControl(true);

    //Campos Enemigos:new UntypedFormControl({value: 0, disabled:true})
    private enemigo_id_Enemigos = new UntypedFormControl(0);
    private tipo_enemigo_id_Enemigos = new UntypedFormControl(1);
    private num_sala_Enemigos = new UntypedFormControl(0);
    private nombre_Enemigos = new UntypedFormControl('Enemigo');
    private imagen_id_Enemigos = new UntypedFormControl(0);
    private nivel_Enemigos = new UntypedFormControl(1);
    private loot_id_Enemigos = new UntypedFormControl(0);
    private loot_prob_Enemigos = new UntypedFormControl(0);
    private buffo_perma_id_Enemigos = new UntypedFormControl(0);
    private evento_muerte_id_Enemigos = new UntypedFormControl(0);
    private evento_spawn_id_Enemigos = new UntypedFormControl(0);
    private evento_intervalo_id_Enemigos = new UntypedFormControl(0);
    private evento_intervalo_tiempo_Enemigos = new UntypedFormControl(0);

    //Campos Eventos (MAZMORRA):
    private id_eventoMazmorra = new UntypedFormControl('0');
    private id_mazmorra = new UntypedFormControl('0');
    private id_sala = new UntypedFormControl('0');
    private tipo_evento = new UntypedFormControl('0');
    private codigo = new UntypedFormControl('0');
    private rng = new UntypedFormControl('0');
    private rng_fallo_evento_id = new UntypedFormControl('0');
    private buff = new UntypedFormControl('0');
    private insta_buff = new UntypedFormControl('0');
    private objetivo_buff = new UntypedFormControl('0');
    private loot_id = new UntypedFormControl('0');
    private loot_prob = new UntypedFormControl('0');
    private objetivo_loot = new UntypedFormControl('0');
    private dialogo_evento_id = new UntypedFormControl('0');
    private objetivo_dialogo = new UntypedFormControl('0');
    private spawn_enemigo_id = new UntypedFormControl('0');
    private set_evento_watcher = new UntypedFormControl('0');
    private remove_evento_watcher = new UntypedFormControl('0');
    private evento_watcher_id = new UntypedFormControl('0');
    private expire_watcher_id = new UntypedFormControl('0');
    private intervalo_trigger_watcher = new UntypedFormControl('0');
    private variable_trigger_watcher = new UntypedFormControl('0');
    private add_variable = new UntypedFormControl('0');
    private elimina_variable = new UntypedFormControl('0');
    private if_condicion_variable = new UntypedFormControl('0');
    private if_falso_evento_id = new UntypedFormControl('0');
    private cinematica_id = new UntypedFormControl('0');
    private sonido_id = new UntypedFormControl('0');
    private evento_next_id = new UntypedFormControl('0');

    //Campos Asignar Isometrico:
    private asignar_id_sala = new UntypedFormControl(0);
    private asignar_evento = new UntypedFormControl(0);

    //Variables Isometrico:
    public isometrico: any = null;
    public mostrarIsometrico: boolean = true;
    private escalaMapaIsometrico: number= 3;
    private escalaIsometrico: number= 0.5;
    public mostrarGrid= true
    public mostrarDecorado = true;
    public mostrarSalaNula = true;
    public mostrarPanelAsignarSala = false;
    public mostrarPanelAsignarTipo = false;
    public mostrarPanelAsignarEspecial = false;
    public mostrarPanelAsignarEnemigo = false;

    //Variables de Reticula:
    private renderReticula= {}  as RenderReticula;
    private numFilasIni= 27;
    private numColumnasIni= 37;
    private margenReticula= 6;
    private cuentaIndexPieza= 0;
    private activarLimiteReticula: boolean = false;
    private limiteReticulaXMin:number = 0;
    private limiteReticulaXMax: number = 19;

    private limiteReticulaYMin: number = 0;
    private limiteReticulaYMax: number = 11;

    private visorNumFilaIni:number = 14;
    private visorNumColumnaIni: number= 24;

    private visorFila;
    private visorColumna;
    private rotacion=0;

    //Variables Generales:
    public estadoMazmorra: TipoEstado = "general";
    public estadoParametros= "General";
    public estadoPanelIzquierdo: "reticula"|"isometrico"|"enemigos"|null = null;
    public estadoPanelDerecho: "isometrico"|"reticula"|null = null;
    public herramientaReticula: "add" | "seleccionar" | "rotar" | "isometrico" = null; 

    public mazmorra:any = {};
    public listaMazmorra:any= [];
    public mostrarCargarMazmorra = false;
    public mazmorraInicializada = false;
    private mazmorraNombreId= "";

    public salaSeleccionadaId = 0;
    public eventoSeleccionadoId = 0;

    public enemigoSeleccionadoIndex = 0;
    public enemigoSeleccionadoId = 0;
    public enemigoSeleccionadoSalaIndex = 0;

    public tipoEnemigoSeleccionado:any;
    private enemigos: any;

    //Variables Parametros Enemigos:
    private mostrarTipoEnemigo: boolean= false;


    @ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;

    //Declara Suscripcion Evento Desarrollador:
    private desarrolladorSuscripcion: Subscription = null;

    constructor(private appService: AppService, public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {}

    async ngOnInit(){

        this.desarrolladorService.log("-------------------------------","green");
        this.desarrolladorService.log("  Iniciando Dungeon Builder... ","green");
        this.desarrolladorService.log("-------------------------------","green");

        var enemigos = await this.appService.getEnemigos();
        this.enemigos= enemigos["enemigos"]; 

        //Inicialización formulario General:
        this.formGeneral = this.formBuilder.group({
            nombre: this.nombre_General,
            descripcion: this.descripcion_General,
            imagen_id: this.imagen_id_General,
            nivel: this.nivel_General,
            evento_start_id: this.evento_start_id_General,
            evento_finish_id: this.evento_finish_id_General,
            loot_finish_id: this.loot_finish_id_General
        });

        //Inicialización formulario Sala:
        this.formSala = this.formBuilder.group({
            id: this.sala_id_Sala,
            nombre: this.nombre_Sala,
            enemigos: [],
            descripcion: this.descripcion_Sala,
            evento_inicial_id: this.evento_inicial_id_Sala,
            evento_final_id: this.evento_final_id_Sala,
            mostrarIsometrico: this.mostrarIsometricoSala,
            salaInicial: this.inicial_Sala
        });

        this.formSala.get("id")?.disable();

        //Inicializacion formulario Enemigos:
        this.formEnemigos = this.formBuilder.group({
            enemigo_id: this.enemigo_id_Enemigos,
            tipo_enemigo_id: this.tipo_enemigo_id_Enemigos,
            salaId: this.num_sala_Enemigos,
            nombre: this.nombre_Enemigos,
            imagen_id: this.imagen_id_Enemigos,
            nivel: this.nivel_Enemigos,
            loot_id: this.loot_id_Enemigos,
            loot_prob: this.loot_prob_Enemigos,
            buffo_perma_id: this.buffo_perma_id_Enemigos,
            evento_muerte_id: this.evento_muerte_id_Enemigos,
            evento_spawn_id: this.evento_spawn_id_Enemigos,
            evento_intervalo_id: this.evento_intervalo_id_Enemigos,
            evento_intervalo_tiempo: this.evento_intervalo_tiempo_Enemigos
        });

        this.formEnemigos.get("enemigo_id")?.disable();
        this.formEnemigos.get("tipo_enemigo_id")?.disable();
        this.formEnemigos.get("salaId")?.disable();

        //Inicializacion formulario EventosMazmorra:
        this.formEventosMazmorra = this.formBuilder.group({
            id_eventoMazmorra: this.id_eventoMazmorra,
            id_mazmorra: this.id_mazmorra,
            id_sala: this.id_sala,
            tipo: this.tipo_evento,
            codigo: this.codigo,
            rng: this.rng,
            rng_fallo_evento_id: this.rng_fallo_evento_id,
            buff: this.buff,
            insta_buff: this.insta_buff,
            objetivo_buff: this.objetivo_buff,
            loot_id: this.loot_id,
            loot_prob: this.loot_prob,
            objetivo_loot: this.objetivo_loot,
            dialogo_id: this.dialogo_evento_id,
            objetivo_dialogo: this.objetivo_dialogo,
            spawn_enemigo_id: this.spawn_enemigo_id,
            set_evento_watcher: this.set_evento_watcher,
            remove_evento_watcher: this.remove_evento_watcher,
            evento_watcher_id: this.evento_watcher_id,
            expire_watcher_id: this.expire_watcher_id,
            intervalo_trigger_watcher: this.intervalo_trigger_watcher,
            variable_trigger_watcher: this.variable_trigger_watcher,
            add_variable: this.add_variable,
            elimina_variable: this.elimina_variable,
            if_condicion_variable: this.if_condicion_variable,
            if_falso_evento_id: this.if_falso_evento_id,
            cinematica_id: this.cinematica_id,
            sonido_id: this.sonido_id,
            evento_next_id: this.evento_next_id
        });

        //Inicialización formulario Asignar Sala:
        this.formPropiedadesIsometrico = this.formBuilder.group({
            tipo: new UntypedFormControl('decorado'),
            especial: new UntypedFormControl(null),
            enemigoId: new UntypedFormControl(0),
            evento_inspeccion: new UntypedFormControl(0)
        });


        //Inicialización formulario Asignar Sala:
        this.formAsignarSala = this.formBuilder.group({
            asignar_id_sala: this.asignar_id_sala
        });

        //Inicialización formulario Asignar Enemigo:
        this.formAsignarEnemigo = this.formBuilder.group({
            enemigoId: new UntypedFormControl(0)
        });

        //Inicialización formulario Asignar Tipo:
        this.formAsignarTipo = this.formBuilder.group({
            tipo: new UntypedFormControl('decorado')
        });

        //Inicialización formulario Asignar Especial:
        this.formAsignarEspecial = this.formBuilder.group({
            especial: new UntypedFormControl(null),
            mensaje: new UntypedFormControl(""),
            eventoId: new UntypedFormControl(0)
        });

    //Suscripcion DesarrolladorService:
        this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe((val) => {
            this.reloadForm(val);
        });

        //Suscripcion de cambios formulario General:
        this.formGeneral.valueChanges.subscribe((val) =>{
            this.mazmorra["general"] = val;
            console.log(val)
        });

        //Suscripcion de cambios formulario Sala:
        this.formSala.valueChanges.subscribe((val) =>{
            if(this.salaSeleccionadaId){
                for (var key in val) {
                  if (val.hasOwnProperty(key)) {
				    this.mazmorra.salas[this.mazmorra.salas.indexOf(this.mazmorra.salas.find(i=> i.id==this.salaSeleccionadaId))][key]= val[key];
                  }
                }
            }
            console.log(val);
        });

        //Suscripcion de cambios formulario Enemigos:
        this.formEnemigos.valueChanges.subscribe((val) =>{
            if(this.enemigoSeleccionadoId){
                for (var key in val) {
                  if (val.hasOwnProperty(key)) {
                    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex][key] = val[key];
                  }
                }
            }
            console.log(val)
        });

    } //Fin OnInit

    setEstadoMazmorra(nuevoEstado: TipoEstado){

        this.estadoMazmorra = nuevoEstado;
        this.estadoPanelIzquierdo = null;
        this.estadoPanelDerecho = null;
        switch(nuevoEstado){
            case "general":
                break;
            case "salas":
                this.estadoPanelIzquierdo = "enemigos";
                break;
            case "enemigos":
                this.estadoPanelIzquierdo = "enemigos";
                break;
            case "isometrico":
                this.estadoPanelIzquierdo = "isometrico";
                this.estadoPanelDerecho = "isometrico";
                break;
            case "reticula":
                this.estadoPanelIzquierdo = "reticula";
                this.estadoPanelDerecho = "reticula";
                break;
            
        }
    }
        

    reloadForm(comandoReload: string){
              switch (comandoReload) {
                case "reloadForm":
                case "reloadFormGeneral":
                    this.formGeneral.patchValue(this.mazmorra["general"]);
                break;

                case "reloadFormSala":
                case "reloadForm":
                    this.formSala.patchValue(this.mazmorra["salas"][this.mazmorra.salas.indexOf(this.mazmorra.salas.find(i=> i.id==this.salaSeleccionadaId))]);
                break;

                case "reloadFormEnemigoMazmorra":
                case "reloadForm":
                    this.formEnemigos.patchValue(this.mazmorra["salas"][this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex]);
                break;

                case "reloadFormEventosMazmorra":
                case "reloadForm":
                    this.formEventosMazmorra.patchValue(this.mazmorra["eventos"][this.mazmorra.eventos.indexOf(this.mazmorra.eventos.find(i=> i.id_eventoMazmorra==this.eventoSeleccionadoId))]);
                break;

                case "reloadFormTile":
                case "reloadForm":

                    //this.getTile(,j);
                    //this.formInMapGeneral.setValue();
                //
                break;

                case "reloadReticula":
                     //this.renderReticula = this.getReticula();
                break;
              }
    }

    renderizarElementoIsometrico(elemento: any):any{

        var opcionesCanvas = this.mazmorra.isometrico.MapSave.MapSettings
        var style = {
            "position": "absolute",
            "top": "",
            "left": "",
            "width": "",
            "height": "",
            "z-index": 0,
            "transform": "translate(-50%,-50%) scaleX(1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")",
            "display": "flex",
            "justify-content": "center",
            "filter": "none"
        }

        //Renderizar Elemento:
        var top = (parseFloat(elemento.Position.y)*this.escalaIsometrico/*+parseFloat(elemento.VisibilityColliderStackingOffset.y)*/) + "px";
        style["top"]= top.replace(/,/g,".")

        var left= (parseFloat(elemento.Position.x)*this.escalaIsometrico/*-parseFloat(elemento.VisibilityColliderStackingOffset.x)*/) + "px";
        style["left"]= left.replace(/,/g,".")

        var zIndex= (parseFloat(elemento.Position.z)+100)*10
        style["z-index"]= Math.floor(zIndex)

        if(elemento.Mirror=="true"){
            style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
        }
        if(elemento.Mirror==true){
            style.transform= "translate(-50%,-50%) scaleX(-1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")";
        }

        //Aplicar filtrado de visualizacion:
        style.display = "flex";
        if(!this.mostrarGrid){
            if(elemento.tipo == "grid"){
                style.display = "none";
            }
        }

        if(!this.mostrarDecorado){
            if(elemento.tipo == "decorado"){
                style.display = "none";
            }
        }

        //Aplicar filtrado de Sala
        if(!this.mostrarSalaNula){
            if(elemento.sala==0){
                style.display= "none";
            }
        }

        for(var i =0; i <this.mazmorra.salas.length; i++){
            if((!this.mazmorra.salas[i].mostrarIsometrico) && (elemento.sala==this.mazmorra.salas[i].id)){
                style.display= "none";
            }
        }

        //Renderizar Seleccion:
        if(elemento.seleccionado){
            style.filter = "sepia(100%) saturate(100)";
        }

        //Aplicar filtro de Seleccion:
        //var width= ((window.innerWidth*0.7)/opcionesCanvas.MapSizeX)*100 + "px";
        //style.width= width.replace(/,/g,".")

        //var height= ((window.innerHeight*0.6)/opcionesCanvas.MapSizeY)*100 + "%";
        //style.height= height.replace(/,/g,".")

        return style;
    }


    zoomIn(){

        if(this.mostrarIsometrico){
            this.escalaIsometrico += 0.1;
        }else{
            this.visorFila.pop();
            this.visorColumna.pop();
            return;
        }
        return;
    }

    zoomOut(){
        if(this.mostrarIsometrico){
            this.escalaIsometrico -= 0.1;
        }else{
            this.visorFila.push(this.visorFila[this.visorFila.length-1]+1);
            this.visorColumna.push(this.visorColumna[this.visorColumna.length-1]+1);
            if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1] <this.margenReticula){
              this.addColumnaReticula("right")
            }
            if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1] <this.margenReticula){
              this.addFilaReticula("bottom")
            }
            return;
        }
        return;
    }

    zoomMapaIsometrico(zoom:number){
        this.escalaMapaIsometrico += zoom;
        this.escalaMapaIsometrico = parseFloat(this.escalaMapaIsometrico.toFixed(2))

        //console.log(this.canvasMapa)
        //this.canvasMapa.nativeElement.scrollTop = 8281
        //this.canvasMapa.nativeElement.scrollLeft = 12400
    }

    posicionarMapaIsometrico(){
        //console.log(this.canvasMapa)
        this.canvasMapa.nativeElement.scrollTop = 8281
        this.canvasMapa.nativeElement.scrollLeft = 12400
    }

// *************************************************
//    PANEL MAZMORRA:
// *************************************************

  nuevaMazmorra(){
    this.mazmorra= {
      general: [
          {
              "evento_start_id": 0,
              "loot_finish_id": 0,
              "nombre": "",
              "descripcion": "",
              "imagen_id": 0,
              "evento_finish_id": 0,
              "nivel": 0
          }
      ],
      salas: [],
      enemigos: [],
      dialogos: [],
      eventos: [],
      celdas: [],
      nombre: "",
      nombreId: "Mazmorra"
    }

    this.inicializarReticula();
    //this.observarDesarrolladorService.next("reloadReticula");
    this.reloadForm("reloadForm");
    this.mazmorraInicializada= true;
  }

  cerrarMazmorra(){
    this.mazmorra= {}
    //this.inicializarReticula();
    this.mazmorraInicializada=false;
    this.salaSeleccionadaId=0;
    return;
  }

  seleccionarMazmorra(index){

    //Cargar Mazmorra:
    this.mazmorra= this.listaMazmorra[index];

    //Inicializar variables de control Builder:
    for(var i=0; i <this.mazmorra.salas.length; i++){
        this.mazmorra.salas[i].mostrarIsometrico = true;
    }

    this.visorFila= [];
    this.visorColumna=[];
    for (var i = 0; i < this.visorNumFilaIni; ++i) {this.visorFila.push(i);}
    for (var i = 0; i < this.visorNumColumnaIni; ++i) {this.visorColumna.push(i);}
    this.renderReticula.celdas= this.mazmorra.celdas;
    this.mostrarCargarMazmorra= false;
    this.reloadForm("reloadForm");
    this.mazmorraInicializada= true;
  }

  async cargarMazmorra(){
      this.listaMazmorra = await this.desarrolladorService.peticionListaMazmorras();
      if(this.listaMazmorra){
        this.mostrarCargarMazmorra=true;
      }else{
          console.error("Error obtieniendo lista Mazmorras");
      }
      return;
  }

  async guardarMazmorra(){
      //Procesar Guardado de celdas:
      //this.mazmorra.celdas = this.procesarGuardadoCeldas();
      //
      //Cambiando Nombre ID:
      if(this.mazmorra.general["nombre"]){
            this.mazmorra["nombreId"] = this.mazmorra.general["nombre"];
      }

      var result = await this.desarrolladorService.peticionGuardarMazmorra(this.mazmorra);

      if(result){
        console.log("Mazmorra guardada en Base de datos");
        this.desarrolladorService.mostrarBotonAceptar= true;
        this.desarrolladorService.mostrarSpinner= false;
        this.desarrolladorService.mensaje= "Mazmorra guardada con exito";
        this.desarrolladorService.mostrarMensaje= true;
      }else{
        console.error("Fallo en el guardado");
      }

    return;
  }

  async eliminarMazmorra(){
      console.warn("ELIMINANDO MAZMORRA: ",this.mazmorra);
      var result = await this.desarrolladorService.peticionEliminarMazmorra(this.mazmorra);
      if(result){
        console.log("Mazmorra eliminada con exito");
      }else{
        console.log("Fallo en la eliminación de la mazmorra");
      }
    return;
  }

  procesarGuardadoCeldas(){
        var objetoReticula = Object.assign([],this.renderReticula.celdas)

        //Procesar Celdas:
        //Procesado eje X:
        var flagBorrado = true;
        for(var i=0; i <objetoReticula.length; i++){
            flagBorrado= true;
            for(var j=0; j <objetoReticula[i].length; j++){ if(objetoReticula[i][j].pieza!= "none"){
                    flagBorrado= false;
                }
            }

            if(flagBorrado){
                objetoReticula.splice(i,1);
                i--;
            }
        }

        //Procesar Eje Y:
        for(var i=0; i <objetoReticula[0].length; i++){
            flagBorrado= true;
            for(var j=0; j <objetoReticula.length; j++){
               if(objetoReticula[j][i].pieza!= "none"){
                    flagBorrado= false;
                }
            }

            if(flagBorrado){
                for(var j=0; j <objetoReticula.length; j++){
                    objetoReticula[j].splice(i,1);
                }
                i--;
            }
        }

        return objetoReticula
  }


  inicializarReticula(){

    this.renderReticula= {
      estado: '',
      comando: '',
      celdas: []
    }

    this.visorFila= [];
    this.visorColumna=[];
    for (var i = 0; i < this.visorNumFilaIni; ++i) {this.visorFila.push(i);}
    for (var i = 0; i < this.visorNumColumnaIni; ++i) {this.visorColumna.push(i);}

    var numFilas = this.numFilasIni;
    var numColumnas = this.numColumnasIni;

    var vectorFila= []
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }

    //Creación reticula:
    for(var i= 0; i <numFilas; i++){

      //Creación de la fila:
      vectorFila= []
      for(var j= 0; j <numColumnas; j++){
        objetoSector.X= i-this.margenReticula;
        objetoSector.Y= j-this.margenReticula;

        vectorFila.push(Object.assign({},objetoSector));
      }

      this.renderReticula.celdas.push(Object.assign([],vectorFila));
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    //Ajuste de 0:
    for (var i = 0; i < this.visorColumna.length; ++i) {
      this.visorColumna[i]= this.visorColumna[i]+this.margenReticula;
    }

    for (var i = 0; i < this.visorFila.length; ++i) {
      this.visorFila[i]= this.visorFila[i]+this.margenReticula;
    }

    console.log(this.renderReticula)
    return this.renderReticula;
  }

  addFilaReticula(posicion){
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }

    var vectorFila = [];
    var numColumnas = this.renderReticula.celdas[0].length;
    var numFilas = this.renderReticula.celdas.length;

    switch (posicion) {
      case "bottom":
          for(var j= 0; j <numColumnas; j++){
            objetoSector.X= numFilas-this.margenReticula;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.push(Object.assign([],vectorFila));
        break;

      case "top":
          for(var j= 0; j <numColumnas; j++){
            objetoSector.X= this.numFilasIni-numFilas-this.margenReticula-1;
            objetoSector.Y= j-this.margenReticula;

            vectorFila.push(Object.assign({},objetoSector));
          }
          this.renderReticula.celdas.unshift(Object.assign([],vectorFila));
        break;
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    return;
  }

  addColumnaReticula(posicion){
    var objetoSector= {
      X: 0,
      Y: 0,
      tipo: "none",
      oriantacion: 1,
      pieza: "none",
      indexPieza: 0,
      ancla: false,
      seleccionada: false,
      color: "inherit",
      border: Object.assign([],["none", "none", "none", "none"])
    }
    var numColumnas = this.renderReticula.celdas[0].length;
    var numFilas = this.renderReticula.celdas.length;

    switch (posicion) {
      case "right":
        for (var i = 0; i < numFilas; ++i) {
          objetoSector.X= i-this.margenReticula;
          objetoSector.Y= numColumnas-this.margenReticula;
          this.renderReticula.celdas[i].push(Object.assign({},objetoSector))
        }
        break;

      case "left":
        for (var i = 0; i < numFilas; ++i) {
          objetoSector.X= i-this.margenReticula;
          objetoSector.Y= this.numColumnasIni-numColumnas-this.margenReticula-1;
          this.renderReticula.celdas[i].unshift(Object.assign({},objetoSector))
        }
        break;
    }

    //Paso por valor:
    for(var i= 0; i <numFilas; i++){
      for(var j= 0; j <numColumnas; j++){
        this.renderReticula.celdas[i][j].border= this.renderReticula.celdas[i][j].border.concat();
      }
    }

    return;
  }

  getReticula(){return this.renderReticula;}

  moverReticula(movimiento){
    console.log("Cambiando Reticula")
    switch (movimiento) {
      case "right":
        if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1] <this.margenReticula+2){
          this.addColumnaReticula("right")
        }
        for (var i = 0; i < this.visorColumna.length; ++i) {
          this.visorColumna[i]++;
        }
        break;

      case "left":

        if(this.renderReticula.celdas[0].length-this.visorColumna[this.visorColumna.length-1]>this.margenReticula){
            this.addColumnaReticula("left")
        }else{
          for (var i = 0; i < this.visorColumna.length; ++i) {
            this.visorColumna[i]--;
          }
        }
        break;

      case "up":
        if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1]>this.margenReticula){
          this.addFilaReticula("top")
        }else{
          for (var i = 0; i < this.visorFila.length; ++i) {
            this.visorFila[i]--;
          }
        }

        break;

      case "down":

        if(this.renderReticula.celdas.length-this.visorFila[this.visorFila.length-1] <this.margenReticula+2){
          this.addFilaReticula("bottom")
        }

        for (var i = 0; i < this.visorFila.length; ++i) {
          this.visorFila[i]++;
        }
        break;

      default:
        // code...
        break;
    }
  }

  addPieza(tipoPieza){
    this.desarrolladorService.log("Añadir pieza: "+tipoPieza,"orange");
    this.renderReticula.estado="add"
    this.renderReticula.comando= tipoPieza;
    return;
  }

  renderAnchoSector(){
    var width = 5;
    width= 100/this.visorColumna.length;
    return width+"%";
  }

  renderAltoSector(){
    var height = 8.33;
    height= 100/this.visorFila.length
    return height+"%";
  }

  toggleIsometrico(){
    this.mostrarIsometrico= !this.mostrarIsometrico;

    if(this.mostrarIsometrico){
        this.estadoMazmorra="isometrico";
    }else{
        this.estadoMazmorra="reticula"
    }

    console.log("Isometrico: "+this.mostrarIsometrico);
    return;
  }

  toggleVerCapaIsometrico(capa: string){
      switch(capa){
          case "grid":
            this.mostrarGrid = !this.mostrarGrid;
              break;
          case "decorado":
            this.mostrarDecorado = !this.mostrarDecorado;
              break;
      }
    return;
  }


  clickSector(x,y){
    console.log("X: "+x);
    console.log("Y: "+y);
    console.log(this.renderReticula.celdas[x][y])

    switch (this.renderReticula.estado) {
      case "add":
        var colision= false;
        var bordeSize = 3;
        var bordeColor = "black";
        this.cuentaIndexPieza++;

        switch (this.renderReticula.comando) {

          case "6x6":
            //Comprobar Colision:
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Border
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; j < 6; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "2x2":


            //Comprobar Colision:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 0; i < 2; ++i) {
              for (var j = 0; j < 2; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "2x1":

            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 1;
              jRotacion= 2;
            }else{
              iRotacion= 2;
              jRotacion= 1;
            }

            //Comprobar colision
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar Pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "6x4":

            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 4;
              jRotacion= 6;
            }else{
              iRotacion= 6;
              jRotacion= 4;
            }

            //Comprobar colision:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

             //Render Border:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                 //Render de borde:
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "4x2":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;

            if(this.rotacion==0 || this.rotacion==180){
              iRotacion= 2;
              jRotacion= 4;
            }else{
              iRotacion= 4;
              jRotacion= 2;
            }

            //Comprobar colision
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red")
                  colision= true;
                }
              }
            }
            if(colision){break;}
            //Dibujar pieza:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 0; i < iRotacion; ++i) {
              for (var j = 0; j < jRotacion; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "T":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;
            var iRotacion2= 0;
            var jRotacion2= 0;
            var iOffset=0;
            var jOffset=0;
            var iOffset2=0;
            var jOffset2=1;

            if(this.rotacion==0){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=1;
            }

            if(this.rotacion== 90){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=2;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=1;
              jOffset2=0;
            }

            if(this.rotacion== 180){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=2;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=1;
            }

            if(this.rotacion== 270){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=0;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=1;
              jOffset2=0;
            }

            //Comprobar Colision:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujado de pieza:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

          break;

          case "X":
            //Comprobar colision:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none"  && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar Pieza:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = 2; i < 4; ++i) {  //Palo Horizontal
              for (var j = 0; j < 6; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = 0; i < 6; ++i) { //Palo vertical
              for (var j = 2; j < 4; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          case "L":
            //Modificadores de rotacion:
            var iRotacion= 0;
            var jRotacion= 0;
            var iRotacion2= 0;
            var jRotacion2= 0;
            var iOffset=0;
            var jOffset=0;
            var iOffset2=0;
            var jOffset2=0;

            if(this.rotacion==0){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=2;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=2;
              jOffset2=0;
            }

            if(this.rotacion== 90){
              iRotacion= 4;
              jRotacion= 2;
              iOffset=0;
              jOffset=0;

              iRotacion2= 2;
              jRotacion2= 4;
              iOffset2=2;
              jOffset2=0;
            }

            if(this.rotacion== 180){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=0;
            }

            if(this.rotacion== 270){
              iRotacion= 2;
              jRotacion= 4;
              iOffset=0;
              jOffset=0;

              iRotacion2= 4;
              jRotacion2= 2;
              iOffset2=0;
              jOffset2=2;
            }

            //Comprobar colision:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none"  && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i][y+j].pieza !== "none" && this.renderReticula.celdas[x+i][y+j].indexPieza!==this.cuentaIndexPieza && !colision){
                  this.desarrolladorService.log("Error: Colisión de pieza.","red");
                  colision= true;
                }
              }
            }
            if(colision){break;}

            //Dibujar pieza:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                this.renderReticula.celdas[x+i][y+j].color= "orange"
                this.renderReticula.celdas[x+i][y+j].pieza= this.renderReticula.comando;
                this.renderReticula.celdas[x+i][y+j].indexPieza= this.cuentaIndexPieza;
              }
            }

            //Render Borde:
            for (var i = iOffset; i < iRotacion+iOffset; ++i) {  //Palo Horizontal
              for (var j = jOffset; j < jRotacion+jOffset; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }

            for (var i = iOffset2; i < iRotacion2+iOffset2; ++i) { //Palo vertical
              for (var j = jOffset2; j < jRotacion2+jOffset2; ++j) {
                if(this.renderReticula.celdas[x+i-1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[0]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i+1][y+j].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[2]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j+1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[1]= bordeColor+" "+bordeSize+"px solid"}
                if(this.renderReticula.celdas[x+i][y+j-1].indexPieza !== this.cuentaIndexPieza){this.renderReticula.celdas[x+i][y+j].border[3]= bordeColor+" "+bordeSize+"px solid"}
              }
            }
          break;

          default:
            // code...
            break;
        }
        break; //Fin estado add

      case "eliminar":
      var indexPiezaEliminar= this.renderReticula.celdas[x][y].indexPieza;
        for (var i = 0; i < this.renderReticula.celdas.length; ++i) {
          for (var j = 0; j < this.renderReticula.celdas[0].length; ++j) {
            if(this.renderReticula.celdas[i][j].indexPieza===indexPiezaEliminar){
             this.renderReticula.celdas[i][j]= {
                X: i,
                Y: j,
                tipo: "none",
                oriantacion: 1,
                pieza: "none",
                indexPieza: 0,
                ancla: false,
                seleccionada: false,
                color: "inherit",
                border: ["none", "none", "none", "none"]
              }
            }
          }
        }
        break;
      default:
        // code...
        break;
    }
    return;
  }

  seleccionarHerramienta(herramienta){
    switch (herramienta) {
      case "seleccion":
        this.desarrolladorService.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="seleccionar";
        this.herramientaReticula= "seleccionar";
        this.renderReticula.comando= "";
        break;

      case "add":
        this.desarrolladorService.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="add";
        this.herramientaReticula= "add";
        this.renderReticula.comando= "";
        break;

      case "eliminar":
        this.desarrolladorService.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="eliminar";
        this.herramientaReticula= "add";
        this.renderReticula.comando= "";
        break;

      case "rotar":
        this.desarrolladorService.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="rotar";
        this.herramientaReticula= "rotar";
        this.renderReticula.comando= "";
        if(this.rotacion==270){
          this.rotacion=0;
        }else{
          this.rotacion+=90;
        }
        break;

      case "cargarArchivoIsometrico":
        this.desarrolladorService.log("Herramienta: "+herramienta,"green");
        this.renderReticula.estado="parametros";
        this.estadoMazmorra= "isometrico";
        this.renderReticula.comando= "";
        break;

      default:
        this.desarrolladorService.log("Herramienta no valida: "+herramienta,"red");
        this.renderReticula.estado=""
        this.renderReticula.comando= "";
        break;
    }
    return;
  }

  seleccionarPanelParametros(parametros){
    this.estadoParametros= parametros;
    switch(parametros){
      case "Salas":
        console.log(this.mazmorra.salas);
      break;

    }
    return;
  }

  seleccionarSala(salaID: number){
    console.warn("Seleccionando Sala: ",salaID)
    this.salaSeleccionadaId = salaID;
    this.reloadForm("reloadFormSala");
  }

  seleccionarEnemigoMazmorra(enemigoID: number){
    this.enemigoSeleccionadoId = enemigoID;
    var tipoId= 0;

    //Buscar ID Enemigo:
    for(var i = 0; i <this.mazmorra.salas.length; i++){
        for(var j = 0; j <this.mazmorra.salas[i].enemigos.length; j++){
            if(this.mazmorra.salas[i].enemigos[j].enemigo_id == enemigoID){
                tipoId = this.mazmorra.salas[i].enemigos[j].tipo_enemigo_id;
                this.enemigoSeleccionadoSalaIndex = i;
                this.enemigoSeleccionadoIndex = j;
                break;
            }
        }
        if(tipoId!=0){break;}
    }

    if(tipoId==0){console.log("ERROR: No se ha encontrado ningun enemigo con ID: "+enemigoID);return}

    this.tipoEnemigoSeleccionado = this.enemigos.find(i=> i.id== tipoId);

    this.reloadForm("reloadFormEnemigoMazmorra");
    return;
  }

  seleccionarTipoEnemigo(tipoEnemigoID: number){

    this.mostrarTipoEnemigo =false;
    this.tipoEnemigoSeleccionado = this.enemigos.find(i=> i.id== tipoEnemigoID);

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].tipo_enemigo_id= tipoEnemigoID;

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].nombre= this.tipoEnemigoSeleccionado.nombre;

    this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex].enemigos[this.enemigoSeleccionadoIndex].imagen_id= this.tipoEnemigoSeleccionado.imagen_id;


    this.reloadForm("reloadFormEnemigoMazmorra");
    return;

  }

  seleccionarEventoMazmorra(eventoID: number){
    this.eventoSeleccionadoId = eventoID;
    this.reloadForm("reloadFormEventosMazmorra");
    return;
  }

  crearSala(){

    this.mazmorra.salas.push({
      id: 0,
      nombre: "",
      descripcion: "",
      evento_inicial_id: 0,
      evento_final_id: 0,
      mostrarIsometrico: true
    });

    this.mazmorra.salas.at(-1)["id"]= this.desarrolladorService.findAvailableID(this.mazmorra.salas);
    this.mazmorra.salas.at(-1)["nombre"]= "Sala "+this.mazmorra.salas.length;

    console.warn("Creando sala: "+this.mazmorra.salas.at(-1));
    this.seleccionarSala(this.mazmorra.salas.at(-1)["id"]);
  }

  crearEnemigo(indexSala){

    //Check ID de salas: (Se asigan un ID que este disponible)
    var cuentaID = 1;
    var idOcupados = [];

    for(var i = 0;i <this.mazmorra.salas.length;i++){
        if(this.mazmorra.salas[i].enemigos == null){
            this.mazmorra.salas[i].enemigos = [];
        }
        for(var j = 0;j < this.mazmorra.salas[i].enemigos?.length;j++){
            idOcupados.push(parseInt(this.mazmorra.salas[i].enemigos[j].enemigo_id));
        }
    }

    while((idOcupados.indexOf(cuentaID))!=-1){
      cuentaID++;
    }

    console.log("Creando enemigo con ID: "+cuentaID);

    var nombreEnemigo= "Enemigo_ID_"+cuentaID;
    this.mazmorra.salas[indexSala].enemigos.push({
      enemigo_id: cuentaID,
      tipo_enemigo_id: 1,
      salaId: this.mazmorra.salas[indexSala].id,
      nombre: nombreEnemigo,
      imagen_id: 1,
      nivel: 0,
      loot_id: 0,
      loot_prob: 0,
      buffo_perma_id: 0,
      evento_muerte_id: 0,
      evento_spawn_id: 0,
      evento_intervalo_id: 0,
      evento_intervalo_tiempo: 0
    });

    this.seleccionarEnemigoMazmorra(cuentaID);
    this.seleccionarTipoEnemigo(1);
  }

  incluirIsometrico(evt: any) {

      //Lectura de evento Input
      const target: DataTransfer = <DataTransfer>(evt.target);

      //Gestion de errores
      if(target.files.length !== 1) throw new Error('No se pueden seleccionar varios archivos');

      //Lectura de archivo
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(target.files[0]);
      reader.onload = (e: any) => {

        this.desarrolladorService.log("Cargando Archivo Isometrico...","lightblue");
        var obj = JSON.parse(e.target.result);

        delete obj.MapSave["-xmlns:xsd"]
        delete obj.MapSave["-xmlns:xsi"]

        for(var i= 0; i <obj.MapSave.Placeables.Placeable.length; i++){
            delete obj.MapSave.Placeables.Placeable[i].Credits
            obj.MapSave.Placeables.Placeable[i].oculto = false;
            obj.MapSave.Placeables.Placeable[i].sala = 0;
            obj.MapSave.Placeables.Placeable[i].evento = 0;
            obj.MapSave.Placeables.Placeable[i].seleccionado = false;
            if(obj.MapSave.Placeables.Placeable[i].Name=="Floor Grid"){
                obj.MapSave.Placeables.Placeable[i].tipo = "grid";
            }else{
                obj.MapSave.Placeables.Placeable[i].tipo = "decorado";
            }
        }

        this.mazmorra.isometrico = Object.assign({}, obj);
        console.log(this.mazmorra)
        console.log("Mapa Isometrico: ");
        console.log(obj);
      }
  }

  seleccionarElementoIsometrico(indexElemento: number){
        this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado = !this.mazmorra.isometrico.MapSave.Placeables.Placeable[indexElemento].seleccionado;
    return;
  }


  eliminarSala(salaSeleccionadaId: number){

        //Elimina elemento sala del Array de salas:
        this.mazmorra["salas"].splice(this.mazmorra.salas.indexOf(this.mazmorra.salas.find(i=> i.id==this.salaSeleccionadaId)),1);
        //Quita asignación de sala a elementos de sala eliminada:
        for(var i= 0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length;i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala==this.salaSeleccionadaId){
                this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala= 0;
            }
        }

        //Deselecciona la sala seleccionada:
        this.salaSeleccionadaId=0;

    return;
  }

  eliminarEnemigoMazmorra(){

        //Elimina elemento sala del Array de salas:
        this.mazmorra.salas[this.enemigoSeleccionadoSalaIndex]["enemigos"].splice(this.enemigoSeleccionadoIndex,1);

        //Deselecciona la sala seleccionada:
        this.enemigoSeleccionadoId=0;

    return;
  }


    abrirSeleccionarTipoEnemigo(){
        this.mostrarTipoEnemigo =true;
        return;
    }

    cerrarSeleccionarEnemigo(){
        this.mostrarTipoEnemigo= false;
        return;
    }

    botonAsignar(form:string){
        this.mostrarPanelAsignarSala = false;
        this.mostrarPanelAsignarEnemigo = false;
        this.mostrarPanelAsignarEspecial = false;
        this.mostrarPanelAsignarTipo = false;
        switch(form){
            case "sala":
                this.mostrarPanelAsignarSala = true;
                break;
            case "tipo":
                this.mostrarPanelAsignarTipo = true;
                break;
            case "especial":
                this.mostrarPanelAsignarEspecial = true;
                break;
            case "enemigo":
                this.mostrarPanelAsignarEnemigo = true;
                break;
        }
    }

    asignarSala(){
        console.log("Asignando Sala...");
        //Verificar Sala;
        var idSala = this.asignar_id_sala.value;
        var salaValida= false;
        for(var i=0; i <this.mazmorra.salas.length; i++){
            if(this.mazmorra.salas[i].id == idSala){
                salaValida = true;
            }
        }

        if(!salaValida && idSala!=0){
            this.mostrarPanelAsignarSala= true;
            this.desarrolladorService.mensaje= "Id Sala Invalido"
            this.desarrolladorService.mostrarMensaje= true;
            this.desarrolladorService.mostrarSpinner= false;
            this.desarrolladorService.mostrarBotonAceptar= true;
            console.log("Error: id_sala invalido"+idSala);
            return;
        }

        //Asignando ID SALA;
        for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala = idSala;
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
            }
        }

        this.mostrarPanelAsignarSala= false;
        this.desarrolladorService.mensaje = "Selección asignada"
        this.desarrolladorService.mostrarMensaje= true;
        this.desarrolladorService.mostrarSpinner= false;
        this.desarrolladorService.mostrarBotonAceptar= true;
        console.log("Sala Asignada: "+idSala);

        return;
    }

    asignarTipo(){

        var valor = this.formAsignarTipo.get("tipo").value;
        console.warn("Asignando Tipo...",valor);


        if(valor != "decorado" && valor != "grid"){
            this.mostrarPanelAsignarSala= true;
            this.desarrolladorService.mensaje= "Tipo Invalido"
            this.desarrolladorService.mostrarMensaje= true;
            this.desarrolladorService.mostrarSpinner= false;
            this.desarrolladorService.mostrarBotonAceptar= true;
            console.log("Error: Tipo invalido: "+valor);
            return;
        }

        //Asignando ID SALA;
        for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].tipo = valor;
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
            }
        }

        this.mostrarPanelAsignarTipo= false;
        this.desarrolladorService.mensaje = "Tipo "+valor+" asignado correctamente."
        this.desarrolladorService.mostrarMensaje= true;
        this.desarrolladorService.mostrarSpinner= false;
        this.desarrolladorService.mostrarBotonAceptar= true;
        return;
    }

    asignarEspecial(){

        var especial = this.formAsignarEspecial.get("especial").value;
        var mensaje = this.formAsignarEspecial.get("mensaje").value;
        var eventoId = this.formAsignarEspecial.get("eventoId").value;

        console.warn("Asignando Especial...",especial);

        //Asignando ID SALA;
        for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].especial = especial;
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].mensaje = mensaje;
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].eventoId = eventoId;
            }
        }

        this.mensajeExitoAsignacion("Especial "+especial+" asignado correctamente.");
        return;
    }

    asignarEnemigo(){

        var valor = this.formAsignarEnemigo.get("enemigoId").value;
        console.warn("Asignando Enemigo...",valor);

        var idSala = this.asignar_id_sala.value;
        var enemigoValido= false;
        var enemigoYaAsignado = false;
        var error = false;
        var salaEnemigo = 0;
        var flagSeleccionado= false;
        var tipoCasillaSeleccion = null;

        //Si se trata de una deseleccion:
        if(valor == 0){
            for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
                if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
                  this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].enemigoId = valor;
                  this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
                }
            }
            this.mensajeExitoAsignacion("Enemigo ID: "+valor+" asignado correctamente.");
            return;
        }

        //ID no valido.
        if(!valor || valor < 0){
            this.mensajeErrorAsignacion("Error: ID no valido");
            return;
        }

        //DETECTA SI HAY SELECCION MULTIPLE Y EN QUE SALA ESTA EL ENEMIGO:
        for(var i=0; i < this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
                if(flagSeleccionado){
                    this.mensajeErrorAsignacion("Error: No se puede asignar enemigo sobre multiples casillas.");
                    return;
                }
                tipoCasillaSeleccion = this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].tipo;
                salaEnemigo = Number(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].sala);
                flagSeleccionado = true;
            }
        }

        if(tipoCasillaSeleccion == "decorado"){
            this.mensajeErrorAsignacion("Error: No se puede asignar un enemigo sobre decorado.");
            return;
        }

        //SI NO SE ENCUENTRA ID O ESTA EN SALA INCORRECTA:
        for(var i=0; i <this.mazmorra.salas.length; i++){
            for(var j=0; j < this.mazmorra.salas[i].enemigos.length; j++){
            if(this.mazmorra.salas[i].enemigos[j].enemigo_id == valor){
                enemigoValido = true;
                if(salaEnemigo != this.mazmorra.salas[i].id){
                    this.mensajeErrorAsignacion("Error: El enemigo tiene que estar en su sala asignada.");
                    return;
                }
            }
            }
        }

        //Si no se ha encontrado enemigo con ese ID:
        if(!enemigoValido){
            this.mensajeErrorAsignacion("Error: No se ha encontrado enemigo con ID "+valor);
            return;
        }

        //Error Ya asignado:
        for(var i=0; i < this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].enemigoId== valor){
                this.mensajeErrorAsignacion("Error: El enemigo ya ha sido asignado");
                return;
            }
        }


        //Asignando ID ENEMIGO;
        for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].enemigoId = valor;
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
            }
        }

        this.mensajeExitoAsignacion("Enemigo ID: "+valor+" asignado correctamente.");
        return;
    }

    mensajeExitoAsignacion(mensaje?:string){
        this.desarrolladorService.mensaje = mensaje; 
        this.desarrolladorService.mostrarMensaje= true;
        this.desarrolladorService.mostrarSpinner= false;
        this.desarrolladorService.mostrarBotonAceptar= true;
        this.mostrarPanelAsignarSala= false;
        this.mostrarPanelAsignarEnemigo= false;
        this.mostrarPanelAsignarTipo= false;
        this.mostrarPanelAsignarEspecial= false;
    }

    mensajeErrorAsignacion(mensaje){
            this.mostrarPanelAsignarSala= true;
            this.desarrolladorService.mensaje= mensaje; 
            this.desarrolladorService.mostrarMensaje= true;
            this.desarrolladorService.mostrarSpinner= false;
            this.desarrolladorService.mostrarBotonAceptar= true;
            this.mostrarPanelAsignarSala= false;
            this.mostrarPanelAsignarEnemigo= false;
            this.mostrarPanelAsignarTipo= false;
            this.mostrarPanelAsignarEspecial= false;
            console.log("Error: "+mensaje);
            return;
    }

    deseleccionarTodo(){
        //Deseleccionar Todo;
        for(var i=0; i <this.mazmorra.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado){
              this.mazmorra.isometrico.MapSave.Placeables.Placeable[i].seleccionado = false;
            }
        }
    }

    testEvento(event: any){
        console.warn("Hola: ",event)
        this.appService.setMazmorra(this.mazmorra);
        this.desarrolladorService.testEvento(event);
    }
}





