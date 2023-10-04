
import { Component, OnInit , Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { MapaGeneralService } from './mapaGeneral.service';
import { AppService } from '../../app.service';
import { TriggerService } from '../../trigger.service';
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { PinchZoomComponent } from '../../comun/pinch-zoom/pinch-zoom.component';
import { InMapService } from '../../comun/inmap/inmap.service';

export interface Coordenadas {
    x: number,
    y: number,
    mapa: string
}

@Component({
  selector: 'mapaGeneralComponent',
  templateUrl: './mapaGeneral.component.html',
  styleUrls: ['./mapaGeneral.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapaGeneralComponent implements OnInit {

    private casillaSeleccionadaX = 0;
    private casillaSeleccionadaY = 0;

    //Variables INMAP:
    public region: any = {};
    private coordenadaX: number = 0; 
    private coordenadaY: number = 0; 
    private regionSeleccionada: string = "";
    public opcionOverlay: boolean = false;

    public traslacionIsometricoX: number = 0;
    public traslacionIsometricoY: number = 0;
    private tileSize: number = 48;
    private bloqueoMovimiento: boolean = false; 
    private direccionMovimientoPermitido: boolean[] = [false,false,false,false]; 

	@Input() tileImgSeleccionado: number;
	@Input() herramientaInMap: string;
	@Input() opcionesDesarrolloInMap: any;

	@Input() desarrollo: boolean = false;
	@Input() mostrarNiebla: boolean = true;
	@Input() mostrarNieblaFija: boolean = false;
	@Input() mostrarInfranqueable: boolean;
	@Input() mostrarCentro: boolean = false;

	@Input() coordenadas: Coordenadas = null;
	@Input() radioRenderIsometrico: number;

    //Emisores de eventos:
    @Output() comandoMapaGeneral = new EventEmitter<any>();
    @Output() tileCopiado = new EventEmitter<number>();
    @Output() tileSeleccionado = new EventEmitter<{x: number, y: number, xAntigua: number, yAntigua: number, ignoraGuardado: boolean}>();

  	@ViewChild('canvasMapa',{static: false}) canvasMapa: ElementRef;
  	@ViewChild('pinchZoom',{static: false}) private pinchZoom: PinchZoomComponent;

    //Suscripcion AppService:
    private appServiceSuscripcion: Subscription
    public sesion: any;

	constructor(public appService: AppService, public triggerService: TriggerService, private inmapService: InMapService) {
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

              case "inicializarIsometrico":
                  this.inicializarIsometrico();
                  break;
            }
            this.pinchZoom.pinchZoom.transformElement(1000);
            this.pinchZoom.pinchZoom.updateInitialValues();
        });

  }//Fin OnInit

  inicializarIsometrico(){
      //Inicializar RENDER:
      this.checkMovimientoValido()
  }

  clickTile(i:number,j:number,event: any){
      if(!this.desarrollo){return}

    console.log("Click: i: "+i+" j: "+j) 
    console.log("TILE:")
    console.log(this.appService.region.isometrico[i][j])

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
    switch(this.herramientaInMap){
        case "InMap":
            break
        case "add":
            console.log("Añadiendo")
            if(!this.opcionesDesarrolloInMap.opcionOverlay){
                this.appService.region.isometrico[i][j].tileImage= this.opcionesDesarrolloInMap.tileImgSeleccionado;
            }else{
                this.appService.region.isometrico[i][j].tileImageOverlay= this.opcionesDesarrolloInMap.tileImgSeleccionado;
            }
            break;
        case "eliminar":
            console.log("Eliminando")
            if(!this.opcionesDesarrolloInMap.opcionOverlay){
                this.appService.region.isometrico[i][j].tileImage=0;
            }else{
                this.appService.region.isometrico[i][j].tileImageOverlay=0;
            }
            break;
    }

    } // Fin Else opcion accion de herramienta
  } //Fin click

  clickTileAux(i:number,j:number,event: any){

    //Copiar Tile con click de la rueda del raton:
    if(event.which === 2){
        if(this.opcionesDesarrolloInMap.opcionOverlay){
            this.tileCopiado.emit(this.appService.region.isometrico[i][j].tileImageOverlay);
        }else{
            this.tileCopiado.emit(this.appService.region.isometrico[i][j].tileImage);
        }
    }
  } //Fin click AUX

  renderTile(i:number, j:number){

      //Si está Seleccionada:
      if(this.casillaSeleccionadaX === i && this.casillaSeleccionadaY === j){
          return "seleccionada";
      }

      if(this.mostrarInfranqueable){
          if(!this.appService.region.isometrico[i][j].atravesable){
              return "infranqueable";
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

  regularizarRegion(){
      for(var i=0; i < this.appService.region.isometrico.length; i++){

          this.appService.region.isometrico[i].forEach(function(v){
              delete v.probabilidadEventoCamino
              delete v.categoriaEventoCamino
              delete v.eventoId
              delete v.indicadorCogerMision
              delete v.indicadorEvento
              delete v.indicadorPeligro
              delete v.indicadorTerrenoDificil
          })
          
        for(var j=0; j < this.appService.region.isometrico[i].length; j++){

            this.appService.region.isometrico[i][j]["probabilidadEvento"] = 0;
            this.appService.region.isometrico[i][j]["categoriaEvento"] = "camino";
            this.appService.region.isometrico[i][j]["indicador"] = null;
            this.appService.region.isometrico[i][j]["eventoInspeccion"] = 0;
            this.appService.region.isometrico[i][j]["eventoInspeccion"] = 0;
            this.appService.region.isometrico[i][j]["ubicacionEspecial"] = null;
            this.appService.region.isometrico[i][j]["checkMisiones"] = [];
            this.appService.region.isometrico[i][j]["nombre"] = null;
            this.appService.region.isometrico[i][j]["descripcion"] = null;

            //Defecto Mar:
            if(this.appService.region.isometrico[i][j].tileImage == 122){ 
                this.appService.region.isometrico[i][j].atravesable = false;
            }

            //Defecto Montaña:
            if(this.appService.region.isometrico[i][j].tileImage == 14){ 
                this.appService.region.isometrico[i][j].atravesable = false;
            }
            if(this.appService.region.isometrico[i][j].tileImage == 118){ 
                this.appService.region.isometrico[i][j].atravesable = false;
            }

            //Bosque;
            if(this.appService.region.isometrico[i][j].tileImage == 118){ 
                this.appService.region.isometrico[i][j].tipoTerreno = "bosque";
            }
        }
      }

      console.log("REGION REGULARIZADA: ");
      console.log(this.appService.region)
  }

  moverPersonaje(direccion: string){
      //Realizando Desplazamiento General:
      this.procesarMoverPersonaje(direccion)

  }
  
  procesarMoverPersonaje(direccion: string){

      //Evitar Si hay bloqueo de Movimiento: 
      if(this.bloqueoMovimiento){
          console.log("Bloqueando Movimiento")
          return false;
      }

      console.log("REGION: ");
      console.log(this.appService.renderIsometrico)

      //Extraer Coordenadas renderizadas:
      var renderIsometricoLength= this.appService.radioRenderIsometrico*2; 

      var minRenderX = this.sesion.inmap.posicion_x - this.appService.radioRenderIsometrico;
      var maxRenderX = this.sesion.inmap.posicion_x + this.appService.radioRenderIsometrico;
      var minRenderY = this.sesion.inmap.posicion_y - this.appService.radioRenderIsometrico;
      var maxRenderY = this.sesion.inmap.posicion_y + this.appService.radioRenderIsometrico;

      //ACTUALIZA POSICION:
      switch(direccion){
          case "NorEste":
                this.sesion.inmap.posicion_x -= 1;
              break
          case "SurEste":
                this.sesion.inmap.posicion_y += 1;
              break
          case "SurOeste":
                this.sesion.inmap.posicion_x += 1;
              break
          case "NorOeste":
                this.sesion.inmap.posicion_y -= 1;
              break
      }
       
      console.log("Direccion: "+direccion)

      switch(direccion){

          case "NorEste":
              //Añadir ROW NORESTE:
              this.bloqueoMovimiento = true;
              var clone = this.appService.region.isometrico[minRenderX-1].slice(minRenderY,maxRenderY+1);
              this.appService.renderIsometrico.unshift(clone)
                setTimeout(()=>{    
                    this.appService.renderIsometrico.pop()
                    this.checkMovimientoValido();
                }, 500);
                setTimeout(()=>{    
                      this.bloqueoMovimiento = false;
                }, 1000);
              break;

          case "SurOeste":
              //Añadir ROW SUROESTE:
              this.bloqueoMovimiento = true;

              var clone = this.appService.region.isometrico[maxRenderX+1].slice(minRenderY,maxRenderY+1);
              this.appService.renderIsometrico.push(clone)
                setTimeout(()=>{    
                    this.appService.renderIsometrico.shift()
                    this.checkMovimientoValido();
                }, 500);
                setTimeout(()=>{    
                      this.bloqueoMovimiento = false;
                }, 1000);
              break;

          case "SurEste":
              //Añadir ROW SUROESTE:
              this.bloqueoMovimiento = true;
              for(var i = 0; i <= maxRenderY-minRenderY; i++){
                this.appService.renderIsometrico[i].push(
                    this.appService.region.isometrico[minRenderX+i][maxRenderY+1]
                )
              }
                setTimeout(()=>{    
                      for(var i = 0; i <= maxRenderY-minRenderY; i++){
                        this.appService.renderIsometrico[i].shift()
                      }
                    this.checkMovimientoValido();
                }, 500);
                setTimeout(()=>{    
                      this.bloqueoMovimiento = false;
                }, 1000);
              break;

          case "NorOeste":
              //Añadir ROW SUROESTE:
              this.bloqueoMovimiento = true;

              for(var i = 0; i <= maxRenderY-minRenderY; i++){
                this.appService.renderIsometrico[i].unshift(
                    this.appService.region.isometrico[minRenderX+i][minRenderY-1]
                )
              }
                setTimeout(()=>{    
                      for(var i = 0; i <= maxRenderY-minRenderY; i++){
                        this.appService.renderIsometrico[i].pop()
                      }
                    this.checkMovimientoValido();
                }, 500);
                setTimeout(()=>{    
                      this.bloqueoMovimiento = false;
                }, 1000);
              break;
      }

      this.triggerService.checkTrigger("entrarCasilla",{
          posicion_x: this.sesion.inmap.posicion_x,
          posicion_y: this.sesion.inmap.posicion_y
      });

      this.inmapService.realizarMovimiento();


  }//FIN MOVIMIENTO

  checkMovimientoValido(){
      var movimiento = [false,false,false,false]
      var centro = this.appService.radioRenderIsometrico;

      if(this.appService.renderIsometrico[centro-1][centro]["atravesable"]){movimiento[0]=true}
      if(this.appService.renderIsometrico[centro][centro+1]["atravesable"]){movimiento[1]=true}
      if(this.appService.renderIsometrico[centro+1][centro]["atravesable"]){movimiento[2]=true}
      if(this.appService.renderIsometrico[centro][centro-1]["atravesable"]){movimiento[3]=true}

      this.direccionMovimientoPermitido = movimiento; 
  } // Fin Check Movimiento Valido

} //Fin Componente




