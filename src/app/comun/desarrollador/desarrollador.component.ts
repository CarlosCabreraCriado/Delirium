
import { Component, OnInit , ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { DesarrolladorService } from './desarrollador.service';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { RenderReticula } from './renderReticula.class'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import { Subscription } from "rxjs";

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-desarrollador',
  templateUrl: './desarrollador.component.html',
  styleUrls: ['./desarrollador.component.sass']
})

export class DesarrolladorComponent implements OnInit{

    public cuenta: any;
    public token: any;

    public editorVerOptions: JsonEditorOptions;
    public editorModificarOptions: JsonEditorOptions;
    public data: any;
    public path= [];

    public renderReticula= {} as RenderReticula;
    private coordenadaSeleccionadaX= 0;
    private coordenadaSeleccionadaY= 0

    //Declara Suscripcion Evento Desarrollador:
    private desarrolladorSuscripcion: Subscription = null;

    //Variables Parametros Enemigos:
    private mostrarTipoEnemigo: boolean= false;

    //Variables Parametros Enemigos:
    readonly tiposOrdenes = ["Condición","Variable","Misión","Trigger","Diálogo","Hechizo","Loot","Enemigo","Mazmorra","Multimedia","Tiempo"];

    //Form Group InMap:
    private formInMapGeneral: UntypedFormGroup;
    private formInMapTerreno: UntypedFormGroup;
    private formInMapTrigger: UntypedFormGroup;
    private formInMapMisiones: UntypedFormGroup;

    //Campos Campos InMap General:
    private inMapNombre = new UntypedFormControl('null');
    private inMapDescripcion = new UntypedFormControl('null');
    private inMapIndicador = new UntypedFormControl('null');

    //Campos Campos InMap Terreno:
    private inMapTipoTerreno = new UntypedFormControl('normal');
    private inMapAtravesable = new UntypedFormControl(true);
    private inMapInspeccionable = new UntypedFormControl('0');
    private inMapMensajeInsapeccionable = new UntypedFormControl(null);
    private inMapUbicacionEspecial = new UntypedFormControl('0');

    //Campos Campos InMap Eventos:
    private inMapProbabilidadRandom = new UntypedFormControl(0);
    private inMapCategoriaRandom = new UntypedFormControl('???');
    private inMapLootProb = new UntypedFormControl('0');
    private inMapLootId = new UntypedFormControl('0');

    //Configuracion MapaGeneral:
    private mostrarNieblaGuerra = false;
    private mostrarInfranqueable = false;

    //Opciones Selectores:
    private opcionesInMapIndicador = ["Mision","Evento"]

    @ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;
    @ViewChild('contenedorMensajes',{static: false}) private contenedorMensajes: ElementRef;
    @ViewChild('canvasIsometrico',{static: false}) private canvasIsometrico: ElementRef;
    @ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;

    constructor(public appService: AppService, public desarrolladorService: DesarrolladorService, private formBuilder: UntypedFormBuilder) {

        this.editorVerOptions = new JsonEditorOptions()
        this.editorModificarOptions = new JsonEditorOptions()
        this.editorModificarOptions.mode = 'tree'; // set all allowed modes
        this.editorVerOptions.mode = 'view'; // set all allowed modes
        //this.options.mode = 'code'; //set only one mode
    }

    async ngOnInit(){

        this.desarrolladorService.log("-------------------------------","green");
        this.desarrolladorService.log("  Iniciando gestor de datos... ","green");
        this.desarrolladorService.log("-------------------------------","green");

        //Inicializar Reticula:
        //this.renderReticula = this.desarrolladorService.inicializarReticula();

    //Campos Campos InMap General:
        this.formInMapGeneral = this.formBuilder.group({
            inMapNombre: this.inMapNombre,
            inMapDescripcion: this.inMapDescripcion,
            inMapIndicador: this.inMapIndicador
        });

    //Campos Campos InMap Terreno:
        this.formInMapTerreno = this.formBuilder.group({
            inMapTipoTerreno: this.inMapTipoTerreno,
            inMapAtravesable: this.inMapAtravesable,
            inMapInspeccionable: this.inMapInspeccionable,
            inMapMensajeInsapeccionable: this.inMapMensajeInsapeccionable,
            inMapUbicacionEspecial: this.inMapUbicacionEspecial
        });

    //Campos Campos InMap Eventos:
        this.formInMapTrigger = this.formBuilder.group({
            inMapProbabilidadRandom: this.inMapProbabilidadRandom,
            inMapCategoriaRandom: this.inMapCategoriaRandom,
            inMapLootProb: this.inMapLootProb,
            inMapLootId: this.inMapLootId
        });

    //Campos Campos InMap Misiones:
        this.formInMapMisiones = this.formBuilder.group({
        });

    //Suscripcion DesarrolladorService:
        this.desarrolladorSuscripcion = this.desarrolladorService.observarDesarrolladorService$.subscribe(
            (val) => {
              switch (val) {

                case "reloadFormTile":
                case "reloadForm":
                    //this.desarrolladorService.getTile(,j);
                    //this.formInMapGeneral.setValue();
                //
                break;

                case "reloadReticula":
                     //this.renderReticula = this.desarrolladorService.getReticula();
                break;

              }
            }
        );

        await this.desarrolladorService.inicializarGestor();
        this.desarrolladorService.inicializarArchivos();

        //Obtener Sesion del servicio Electron Storage:
        this.appService.setSesion(await window.electronAPI.getSesion());
        this.appService.actualizarIndexHeroe();

        //Suscripcion de cambios formulario InMapGeneral:
        this.formInMapGeneral.valueChanges.subscribe((val) =>{
            this.desarrolladorService.setInMapGeneral(val);
            //console.log(val)
        });

        //Suscripcion de cambios formulario InMapTerreno:
        this.formInMapTerreno.valueChanges.subscribe((val) =>{
            this.desarrolladorService.setInMapTerreno(val);
            //console.log(val)
        });

        //Suscripcion de cambios formulario InMapEventos:
        this.formInMapTrigger.valueChanges.subscribe((val) =>{
            this.desarrolladorService.setInMapEventos(val);
            //console.log(val)
        });

        //Suscripcion de cambios formulario InMapMisiones:
        this.formInMapMisiones.valueChanges.subscribe((val) =>{
            this.desarrolladorService.setInMapMisiones(val);
            //console.log(val)
        });

        //Crear registro de nombres de enemigos para display de assets:
        var familia:string;
        for (var i = 0; i < this.desarrolladorService.enemigos.enemigos.length; ++i) {
            familia= this.desarrolladorService.enemigos.enemigos[i].familia;
            familia= familia.toLowerCase().replace(/ /g,'_').replace(/ñ/g,'n');
            this.desarrolladorService.enemigos.enemigos[i].familia= familia;
        }

        //Inicializar selección Tile:
        //this.seleccionarTile({x:0,y:0});

        setTimeout(()=>{
            this.appService.mostrarPantallacarga(false);
            //this.desarrolladorService.abrirTrigger("inmap",{})
        }, 3000);

        return;
    }

    /*
    subirArchivo(archivoInput: any){
        console.log("HOLA");
        console.log(archivoInput);
        this.path[0]= archivoInput.target.files[0].path;
    }*/

    scrollToBottom(): void {
        try {
            this.contenedorMensajes.nativeElement.scrollTop = this.contenedorMensajes.nativeElement.scrollHeight;
        } catch(err) { }
    }

    renderDatoSeleccionado(datoSeleccionado:string){
        if(this.desarrolladorService.archivoSeleccionado==datoSeleccionado){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderBotonAddSeleccionado(datoSeleccionado:string){
        if(this.desarrolladorService.estadoPanelDatosDerecha==datoSeleccionado){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderIconoDatosSeleccionado(datoSeleccionado:string){
        if(this.desarrolladorService.estadoHerramientaDatos==datoSeleccionado){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderClaseSeleccionada(claseSeleccionada:string){
        if(this.desarrolladorService.claseSeleccionada==claseSeleccionada){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderTipoObjetoSeleccionado(tipoObjetoSeleccionado:string){
        if(this.desarrolladorService.tipoObjetoSeleccionado==tipoObjetoSeleccionado){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderOpcionDatoSeleccionado(opcionSeleccionado:string){
        if(this.desarrolladorService.estadoDatos==opcionSeleccionado){
            return "seleccionado"
        }else{
            return ""
        }
    }

    renderListaSeleccionado(opcionSeleccionado:string,indiceSeleccionado:number){
        switch(opcionSeleccionado){
            case "subanimacion":
                if(this.desarrolladorService.subanimacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
                break;
            case "sonido":
                break;
            case "hechizo":
                if(this.desarrolladorService.hechizoSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
                break;
            case "buff":
                if(this.desarrolladorService.buffSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
                break;
            case "animaciones":
                if(this.desarrolladorService.animacionSeleccionadoIndex==indiceSeleccionado){return "seleccionado"}
                break;
            case "orden":
                if(this.desarrolladorService.ordenSeleccionadaIndex==indiceSeleccionado){return "seleccionado"}
                break;
        }
        return "";
    }

    renderizarSector(i,j){
        return;
    }

    mostrarEstadisticasEnemigo(){
        return;
    }



    renderizarSelector(opcion:string){

        if(opcion == 'add' && this.desarrolladorService.opcionesDesarrolloInMap.herramientaInMap == 'add'){
            return "opcion seleccionado";
        }

        if(opcion == 'eliminar' && this.desarrolladorService.opcionesDesarrolloInMap.herramientaInMap == 'eliminar'){
            return "opcion seleccionado";
        }

        if(opcion == 'base' && !this.desarrolladorService.opcionesDesarrolloInMap.opcionOverlay){
            return "opcion seleccionado";
        }

        if(opcion == 'overlay' && this.desarrolladorService.opcionesDesarrolloInMap.opcionOverlay){
            return "opcion seleccionado";
        }

        //Selector Formularios Tiles:
        if(opcion == 'general' && this.desarrolladorService.opcionPropiedades=="general"){
            return "opcion seleccionado";
        }
        if(opcion == 'terreno' && this.desarrolladorService.opcionPropiedades=="terreno"){
            return "opcion seleccionado";
        }
        if(opcion == 'trigger' && this.desarrolladorService.opcionPropiedades=="trigger"){
            return "opcion seleccionado";
        }
        if(opcion == 'misiones' && this.desarrolladorService.opcionPropiedades=="misiones"){
            return "opcion seleccionado";
        }

        return "opcion";
    }



    copiarTile(tileCopia:any){
        this.desarrolladorService.seleccionarImgTile(tileCopia);
    }

    async seleccionarTile(coordenadas:any){

        //Tile Seleccionado:

        //Guardar formulario de tile seleccionado anterior:
        if(!coordenadas.ignoraGuardado){
            await this.desarrolladorService.setTile(coordenadas.xAntigua,coordenadas.yAntigua,this.formInMapGeneral.value,this.formInMapTerreno.value,this.formInMapTrigger.value,this.formInMapMisiones.value)
        }
        //Asigna Coordenadas Seleccionada:
        this.coordenadaSeleccionadaX= coordenadas.x;
        this.coordenadaSeleccionadaY= coordenadas.y;

        //Actualizar fomulario:
        var valoresFormulario = await this.desarrolladorService.getTile(coordenadas["x"],coordenadas["y"])

        console.log("VALORES:");
        console.log(valoresFormulario);

        //Cambiar string NULL por valor null:
        for (const property in valoresFormulario) {
            if(valoresFormulario[property]=="null"){
                valoresFormulario[property]=null
            }
        }

        var formInMapGeneral = {
            inMapNombre: valoresFormulario.nombre,
            inMapDescripcion: valoresFormulario.descripcion,
            inMapIndicador: valoresFormulario.indicador
        };

    //Campos Campos InMap Terreno:
        var formInMapTerreno = {
            inMapTipoTerreno: valoresFormulario.tipoTerreno,
            inMapAtravesable: valoresFormulario.atravesable,
            inMapInspeccionable: valoresFormulario.inspeccionable,
            inMapMensajeInsapeccionable: valoresFormulario.mensajeInspeccion,
            inMapUbicacionEspecial: valoresFormulario.ubicacionEspecial
        };

    //Campos Campos InMap Eventos:
        var formInMapTrigger = {
            inMapProbabilidadRandom: valoresFormulario.probabilidadEvento,
            inMapCategoriaRandom: valoresFormulario.categoriaEvento,
            inMapLootProb: "",
            inMapLootId: ""
        };

    //Campos Campos InMap Misiones:
        var formInMapMisiones = {
        };

        this.formInMapGeneral.setValue(formInMapGeneral);
        this.formInMapTerreno.setValue(formInMapTerreno);
        this.formInMapTrigger.setValue(formInMapTrigger);
        this.formInMapMisiones.setValue(formInMapMisiones);

        console.log(this.formInMapTerreno)

    }

    async abrirTrigger(tipo: string){

        //Carga los triggers en función del tipo:
        var trigger = {}
        var tile = {}

        switch(tipo){
            case "inmap-evento":
                tile = await this.desarrolladorService.getTile(this.coordenadaSeleccionadaX,this.coordenadaSeleccionadaY)
                trigger= tile["triggersInMapEventos"]
                break;
            case "inmap-mision":
                tile = await this.desarrolladorService.getTile(this.coordenadaSeleccionadaX,this.coordenadaSeleccionadaY)
                trigger= tile["triggersInMapMisiones"]
                break;
        }

        //Abre el dialogo de Gestion de Triggers:
        this.desarrolladorService.abrirTrigger(tipo,trigger);

    }


}




