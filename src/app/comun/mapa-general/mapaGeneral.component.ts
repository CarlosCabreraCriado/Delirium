
import { Component, OnInit , Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { AppService } from '../../app.service';
import { TriggerService } from '../../trigger.service';
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { PinchZoomComponent } from '../../comun/pinch-zoom/pinch-zoom.component';

import { InMapService } from '../../comun/inmap/inmap.service';
import { MapaGeneralService } from '../../comun/mapa-general/mapaGeneral.service';

export interface Coordenadas { //PENDINTE DECOMISION
    posicion_x: number,
    posicion_y: number,
    region: string
}

@Component({
  selector: 'mapaGeneralComponent',
  templateUrl: './mapaGeneral.component.html',
  styleUrls: ['./mapaGeneral.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapaGeneralComponent implements OnInit {

    private casillaSeleccionadaX = 0;
    private casillaSeleccionadaY = 0;

    //Variables generales
    public mapaCargado:boolean = false;
    public mostrarNubes:boolean = true;

    //Variables INMAP:
    public region: any = {};
    private coordenadaX: number = 0;  //PENDINTE DECOMISION
    private coordenadaY: number = 0;  //PENDINTE DECOMISION
    private regionSeleccionada: string = "";
    public opcionOverlay: boolean = false;
    public pointerEventCelda: "all"|"none" = "none"

    public traslacionIsometricoX: number = 0;
    public traslacionIsometricoY: number = 0;
    private tileSize: number = 48;
    private bloqueoMovimiento: boolean = false; 
    private direccionMovimientoPermitido: boolean[] = [true,true,true,true]; 

	@Input() tileImgSeleccionado: number;
	@Input() herramientaInMap: string;
	@Input() opcionesDesarrolloInMap: any;

	@Input() desarrollo: boolean = false;
	@Input() mostrarNiebla: boolean = true;
	@Input() mostrarNieblaFija: boolean = false;
	@Input() mostrarInfranqueable: boolean = false;
	@Input() mostrarTriggers: boolean = false;
	@Input() mostrarCentro: boolean = false;
	@Input() esTurnoPropio: boolean = false;
	@Input() escalaMapaIsometrico: number = 1;

	@Input() coordenadas: Coordenadas = null; //PENDINTE DECOMISION
	@Input() radioRenderIsometrico: number;

    //Emisores de eventos:
    @Output() comandoMapaGeneral = new EventEmitter<any>();
    @Output() tileCopiado = new EventEmitter<number>();
    @Output() tileSeleccionado = new EventEmitter<{x: number, y: number, xAntigua: number, yAntigua: number, ignoraGuardado: boolean}>();

  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;
  	@ViewChild('pinchZoom',{static: false}) private pinchZoom: PinchZoomComponent;

    //Suscripciones:
    private appServiceSuscripcion: Subscription
    private mapaGeneralSuscripcion: Subscription

    public sesion: any;

	constructor(private mapaGeneralService: MapaGeneralService, private cdr: ChangeDetectorRef, public appService: AppService, public triggerService: TriggerService, private inmapService: InMapService) {
        this.appService.sesion$.subscribe(sesion => this.sesion = sesion);
    }

  ngOnInit(){
      
       //Suscripcion AppService:
       this.appServiceSuscripcion = this.appService.eventoAppService.subscribe((comando) =>{
          switch(comando){

              case "centrarMapa":
                    console.log("Centrando Mapa Global...")
                    //this.pinchZoom.pinchZoom.centeringImage();
                    this.pinchZoom.pinchZoom.moveX = 0 
                    this.pinchZoom.pinchZoom.moveY = 0 
                    this.pinchZoom.pinchZoom.scale= 1
                    //this.pinchZoom.pinchZoom.setZoom({scale: 1, center:[0,0]})
                    this.cdr.detectChanges();
                  break;

              case "centrarIsometrico":
                    console.log("Centrando Isometrico...")
                    this.pinchZoom.pinchZoom.centeringImage();

                    this.pinchZoom.pinchZoom.moveX = 0 
                    this.pinchZoom.pinchZoom.moveY = 0 
                  break;

              case "region1":
                  console.log("CENTRANDO REGION 1...")
                  //this.pinchZoom.pinchZoom.moveX = 656 
                  //this.pinchZoom.pinchZoom.moveY = 387 
                  //this.pinchZoom.pinchZoom.scale= 3
                    if(this.pinchZoom.pinchZoom.scale==1){
                        this.pinchZoom.pinchZoom.setZoom({scale: 3, center:[656,387]})
                    }else{
                        this.pinchZoom.pinchZoom.moveX = 0 
                        this.pinchZoom.pinchZoom.moveY = 0 
                        this.pinchZoom.pinchZoom.scale= 1
                    }
                  break;
            }
            this.pinchZoom.pinchZoom.transformElement(1000);
            this.pinchZoom.pinchZoom.updateInitialValues();
        });

        //Suscripcion MapaGeneralService:
        this.mapaGeneralSuscripcion = this.mapaGeneralService.eventoMapaGeneral.subscribe((comando) =>{

           switch(comando){
              case "verificarMovimiento":
                  this.checkMovimientoValido()
                  break;

              case "cargarMapa":
                    console.warn("CARGANDO")
                    this.mapaCargado = false;
                    this.mostrarNubes = true;
                    this.cdr.detectChanges();
                    break;

              case "cargaMapaCompleta":
                    console.warn("CARGA COMPLETA")
                    this.mapaCargado = true;
                    this.cdr.detectChanges();
                    setTimeout(()=>{
                        this.mostrarNubes = false;
                        this.cdr.detectChanges();
                    },1000)
                  break;

              case "movimientoNorEste":
                  this.procesarMoverPersonaje("NorEste")
                  break;
              case "movimientoSurEste":
                  this.procesarMoverPersonaje("SurEste")
                  break;
              case "movimientoNorOeste":
                  this.procesarMoverPersonaje("NorOeste")
                  break;
              case "movimientoSurOeste":
                  this.procesarMoverPersonaje("SurOeste")
                  break;

           }
        });

        if(this.desarrollo){
            this.pointerEventCelda = "all";
        }else{
            this.pointerEventCelda = "none";
        }
        this.mapaGeneralService.setDesarrollador(this.desarrollo);

  }//Fin OnInit

  ngOnDestroy(){
        console.log("Destruyendo Componente INMAP")
        this.mapaGeneralSuscripcion.unsubscribe();
        this.appServiceSuscripcion.unsubscribe();
  }

  clickTile(i:number,j:number,event: any){
      
    console.log("Click: i: "+i+" j: "+j,this.desarrollo) 

      if(!this.desarrollo){return}

    console.log("Click: i: "+i+" j: "+j) 
    console.log("TILE:")
    console.log(this.mapaGeneralService.region.isometrico[i][j])

    //Detectar Primer Click Seleccion: 
    if(this.casillaSeleccionadaX != i || this.casillaSeleccionadaY != j){
       //Seleccionando Casilla: 
        var flagIgnoraGuardadoForm = false
        if(this.casillaSeleccionadaX == 0 && this.casillaSeleccionadaY == 0){
            flagIgnoraGuardadoForm = true
        }
        this.tileSeleccionado.emit({x: i,y: j,xAntigua: this.casillaSeleccionadaX,yAntigua: this.casillaSeleccionadaY, ignoraGuardado: flagIgnoraGuardadoForm});
        this.casillaSeleccionadaX = i;
        this.casillaSeleccionadaY = j;
    }else{

    //Segundo Click:
        console.warn("Segundo Click...")

    } // Fin Else opcion accion de herramienta
  } //Fin click

  clickTileAux(i:number,j:number,event: any){

      console.warn("AUX CLICK",event)

    //Set Tile con click derecho del raton:
    if(event.which === 3){
        switch(this.herramientaInMap){
            case "InMap":
                break
            case "add":
                console.log("Añadiendo")
                if(!this.opcionesDesarrolloInMap.opcionOverlay){
                    this.mapaGeneralService.region.isometrico[i][j].tileImage= this.opcionesDesarrolloInMap.tileImgSeleccionado;
                }else{
                    this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay= this.opcionesDesarrolloInMap.tileImgSeleccionado;
                }
                break;
            case "eliminar":
                console.log("Eliminando")
                if(!this.opcionesDesarrolloInMap.opcionOverlay){
                    this.mapaGeneralService.region.isometrico[i][j].tileImage=0;
                }else{
                    this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay=0;
                }
                break;
        }
    }

    //Copiar Tile con click de la rueda del raton:
    if(event.which === 2){
        if(this.opcionesDesarrolloInMap.opcionOverlay){
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImageOverlay);
        }else{
            this.tileCopiado.emit(this.mapaGeneralService.region.isometrico[i][j].tileImage);
        }
    }
  } //Fin click AUX

  renderTile(i:number, j:number){

      if(!this.desarrollo){return "";}

      //Si está Seleccionada:
      if(this.casillaSeleccionadaX === i && this.casillaSeleccionadaY === j){
          return "desarrollador seleccionada";
      }

      if(this.mostrarInfranqueable){
          if(!this.mapaGeneralService.region.isometrico[i][j].atravesable){
              return "desarrollador infranqueable";
          }
      }

      if(this.mostrarTriggers){
          if(this.mapaGeneralService.region.isometrico[i][j].triggersInMapEventos.length != 0){
              return "desarrollador triggers";
          }
      }
      return "noDisplay";
  }

  renderImagenMarcador(ubicacionEspecial:string){
      switch(ubicacionEspecial){
          case "portal":
              return "013";
              break;
          case "herrero":
              return "018";
              break;
          case "armero":
              return "008";
              break;
          case "instructor":
              return "005";
              break;
          case "mercado":
              return "017";
              break;
          case "posada":
              return "002";
              break;
      }
  }

  moverPersonaje(direccion:"NorEste"|"SurEste"|"SurOeste"|"NorOeste"){
      //Realizando Desplazamiento General:
      this.inmapService.realizarMovimientoInMap(direccion);
  }
  
  procesarMoverPersonaje(direccion: string){

      //Evitar Si hay bloqueo de Movimiento: 
      if(this.bloqueoMovimiento){
          console.log("Bloqueando Movimiento")
          return false;
      }

      console.log("REGION: ");
      console.log(this.mapaGeneralService.renderIsometrico)

      //Extraer Coordenadas renderizadas:
      var renderIsometricoLength= this.mapaGeneralService.radioRenderIsometrico*2; 

      var minRenderX = this.sesion.render.inmap.posicion_x - this.mapaGeneralService.radioRenderIsometrico;
      var maxRenderX = this.sesion.render.inmap.posicion_x + this.mapaGeneralService.radioRenderIsometrico;
      var minRenderY = this.sesion.render.inmap.posicion_y - this.mapaGeneralService.radioRenderIsometrico;
      var maxRenderY = this.sesion.render.inmap.posicion_y + this.mapaGeneralService.radioRenderIsometrico;

      //ACTUALIZA POSICION:
      switch(direccion){
          case "NorEste":
                this.sesion.render.inmap.posicion_x -= 1;
              break
          case "SurEste":
                this.sesion.render.inmap.posicion_y += 1;
              break
          case "SurOeste":
                this.sesion.render.inmap.posicion_x += 1;
              break
          case "NorOeste":
                this.sesion.render.inmap.posicion_y -= 1;
              break
      }
       
      console.log("Direccion: "+direccion)

      switch(direccion){

          case "NorEste":

                //Añadir ROW NORESTE:
                this.bloqueoMovimiento = true;

                var clone = this.mapaGeneralService.region.isometrico[minRenderX-1].slice(minRenderY,maxRenderY+1);
                this.mapaGeneralService.renderIsometrico.pop()
                this.mapaGeneralService.renderIsometrico.unshift(clone)

                console.log("MOVIENDO")
                this.cdr.detectChanges();

                setTimeout(()=>{    
                    this.triggerService.checkTrigger("entrarCasilla",{
                          posicion_x: this.sesion.render.inmap.posicion_x,
                          posicion_y: this.sesion.render.inmap.posicion_y
                    });
                    this.checkMovimientoValido();
                    this.bloqueoMovimiento = false;
                    this.cdr.detectChanges();
                }, 1000);

              break;

          case "SurOeste":
                //Añadir ROW SUROESTE:
                this.bloqueoMovimiento = true;

                var clone = this.mapaGeneralService.region.isometrico[maxRenderX+1].slice(minRenderY,maxRenderY+1);
                this.mapaGeneralService.renderIsometrico.push(clone)
                this.mapaGeneralService.renderIsometrico.shift()

                setTimeout(()=>{    
                    this.triggerService.checkTrigger("entrarCasilla",{
                          posicion_x: this.sesion.render.inmap.posicion_x,
                          posicion_y: this.sesion.render.inmap.posicion_y
                    });
                    this.checkMovimientoValido();
                    this.bloqueoMovimiento = false;
                    this.cdr.detectChanges();
                }, 1000);
              break;

          case "SurEste":
                //Añadir ROW SUROESTE:
                this.bloqueoMovimiento = true;

                for(var i = 0; i <= maxRenderY-minRenderY; i++){
                    this.mapaGeneralService.renderIsometrico[i].push(
                        this.mapaGeneralService.region.isometrico[minRenderX+i][maxRenderY+1]
                    )
                }

                for(var i = 0; i <= maxRenderY-minRenderY; i++){
                    this.mapaGeneralService.renderIsometrico[i].shift()
                }
                setTimeout(()=>{    
                    this.triggerService.checkTrigger("entrarCasilla",{
                          posicion_x: this.sesion.render.inmap.posicion_x,
                          posicion_y: this.sesion.render.inmap.posicion_y
                    });
                    this.checkMovimientoValido();
                    this.bloqueoMovimiento = false;
                    this.cdr.detectChanges();
                }, 1000);
              break;

          case "NorOeste":
                //Añadir ROW SUROESTE:
                this.bloqueoMovimiento = true;

                for(var i = 0; i <= maxRenderY-minRenderY; i++){
                    this.mapaGeneralService.renderIsometrico[i].unshift(
                        this.mapaGeneralService.region.isometrico[minRenderX+i][minRenderY-1]
                    )
                }

                for(var i = 0; i <= maxRenderY-minRenderY; i++){
                    this.mapaGeneralService.renderIsometrico[i].pop()
                }
                setTimeout(()=>{    
                    this.triggerService.checkTrigger("entrarCasilla",{
                          posicion_x: this.sesion.render.inmap.posicion_x,
                          posicion_y: this.sesion.render.inmap.posicion_y
                    });
                    this.checkMovimientoValido();
                    this.bloqueoMovimiento = false;
                    this.cdr.detectChanges();
                }, 1000);
            break;
      }


  }//FIN MOVIMIENTO

  checkMovimientoValido(){

      var movimiento = [false,false,false,false]
      var centro = this.mapaGeneralService.radioRenderIsometrico;

      if(this.mapaGeneralService.renderIsometrico[centro-1][centro]["atravesable"]){movimiento[0]=true}
      if(this.mapaGeneralService.renderIsometrico[centro][centro+1]["atravesable"]){movimiento[1]=true}
      if(this.mapaGeneralService.renderIsometrico[centro+1][centro]["atravesable"]){movimiento[2]=true}
      if(this.mapaGeneralService.renderIsometrico[centro][centro-1]["atravesable"]){movimiento[3]=true}

      this.direccionMovimientoPermitido = movimiento; 

  } // Fin Check Movimiento Valido

} //Fin Componente




