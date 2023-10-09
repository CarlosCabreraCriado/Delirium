
import { Component , ChangeDetectorRef, Input, Output, EventEmitter, ElementRef , ViewChild, ChangeDetectionStrategy, OnInit} from '@angular/core';
import { PinchZoomComponent } from '../../comun/pinch-zoom/pinch-zoom.component';

@Component({
  selector: 'mapaMazmorraComponent',
  templateUrl: './mapa-mazmorra.component.html',
  styleUrls: ['./mapa-mazmorra.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapaMazmorraComponent implements OnInit{

    @Input() isometrico: any;
    @Input() salasDescubiertas: any;
    @Input() escalaIsometrico: number;
    @Input() renderMazmorra: any = [];
    @Input() renderEnemigos: any = [];
    @Output() eventoClickElemento = new EventEmitter<any>();

    constructor(private cdr: ChangeDetectorRef) {}

    @ViewChild('canvasIsometrico',{static: false}) canvasIsometrico: ElementRef;
    @ViewChild('pinchZoom',{static: false}) private pinchZoom: PinchZoomComponent;

    public estiloContenedorIsometrico: any
    public estiloIsometrico: any
    private posicionMax_x: number
    private posicionMax_y: number
    private posicionMin_x: number
    private posicionMin_y: number

    private vw: number = 0;
    private vh: number = 0;
    public renderX: number;
    public renderY: number;

    private flagRePaint: boolean = true;
    private intervaloRepaint: any;

    ngOnInit(){
      this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      this.vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      this.renderizarCanvasIsometrico();
      this.intervaloRepaint = setInterval(() => {
            if(this.flagRePaint){
                this.renderX++;
            }else{
                this.renderX--;
            }
            this.flagRePaint = !this.flagRePaint;
            this.estiloContenedorIsometrico = {
                "width": this.renderX +"px",
                "height": this.renderY +"px"
                
            }
            this.cdr.detectChanges();
        },2000)
    }

    ngOnDestroy(){
        clearInterval(this.intervaloRepaint)
    }


    //********************
    // RENDER ISOMETRICO
    //********************
  checkOculto(){

    //Verifica los elementos que estan ocultos

    //Oculto por sala no descubierta:
    for(var j= 0; j < this.isometrico.MapSave.Placeables.Placeable.length; j++){
      this.isometrico.MapSave.Placeables.Placeable[j]["oculto"] = true;
          for(var i =0; i <this.salasDescubiertas.length; i++){
        if((this.salasDescubiertas[i])==Number(this.isometrico.MapSave.Placeables.Placeable[j].sala)){
          this.isometrico.MapSave.Placeables.Placeable[j].oculto = false;
        }
      }
        }

  }//Fin checkOculto()

    renderizarCanvasIsometrico(){
    //Comprobar elementos Ocultos:
    this.checkOculto();

        this.posicionMax_x = 0;
        this.posicionMax_y = 0;

        this.posicionMin_x = this.isometrico.MapSave.Placeables.Placeable[0].Position.x;
        this.posicionMin_y = this.isometrico.MapSave.Placeables.Placeable[0].Position.y;;

        for(var i = 0; i < this.isometrico.MapSave.Placeables.Placeable.length; i++){
            if(this.isometrico.MapSave.Placeables.Placeable[i].Position.x > this.posicionMax_x && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
                this.posicionMax_x = this.isometrico.MapSave.Placeables.Placeable[i].Position.x;
            }
            if(this.isometrico.MapSave.Placeables.Placeable[i].Position.x < this.posicionMin_x && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
                this.posicionMin_x = this.isometrico.MapSave.Placeables.Placeable[i].Position.x;
            }
            if(this.isometrico.MapSave.Placeables.Placeable[i].Position.y > this.posicionMax_y && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
                this.posicionMax_y = this.isometrico.MapSave.Placeables.Placeable[i].Position.y;
            }
            if(this.isometrico.MapSave.Placeables.Placeable[i].Position.y < this.posicionMin_y && !this.isometrico.MapSave.Placeables.Placeable[i].oculto){
                this.posicionMin_y = this.isometrico.MapSave.Placeables.Placeable[i].Position.y;
            }
        }

    this.renderX = (this.posicionMax_x-this.posicionMin_x)*this.escalaIsometrico
    this.renderY = (this.posicionMax_y-this.posicionMin_y)*this.escalaIsometrico

    //this.pinchZoom.pinchZoom._properties

        this.estiloIsometrico = {
            "width": ""+(this.posicionMax_x-this.posicionMin_x)*this.escalaIsometrico+"px",
            "height": ""+(this.posicionMax_y-this.posicionMin_y)*this.escalaIsometrico+"px"
            //"margin-left": ""+(posicionMax_x/2)+"px",
            //"margin-top": ""+(posicionMax_y/2)+"px",
            //"margin-right": ""+(posicionMax_x/2)+"px",
            //"margin-bottom": ""+(posicionMax_y/2)+"px"
        }

        this.estiloContenedorIsometrico = {
            "width": ""+(this.posicionMax_x-this.posicionMin_x)*this.escalaIsometrico+"px",
            "height": ""+(this.posicionMax_y-this.posicionMin_y)*this.escalaIsometrico+"px"
            //"margin-left": ""+(posicionMax_x/2)+"px",
            //"margin-top": ""+(posicionMax_y/2)+"px",
            //"margin-right": ""+(posicionMax_x/2)+"px",
            //"margin-bottom": ""+(posicionMax_y/2)+"px"
        }


        //Centrar el isometrico:
        //this.canvasIsometrico.nativeElement.scrollTop = posicionMax_y/2
        //this.canvasIsometrico.nativeElement.scrollLeft = posicionMax_x/2

        this.cdr.detectChanges();

    }

    renderizarElementoIsometrico(elemento: any):any{

        var opcionesCanvas = this.isometrico.MapSave.MapSettings
        var style = {
            "position": "absolute",
            "top": "",
            "left": "",
            "width": "max-content",
            "height": "",
            "z-index": 0,
            "transform": "translate(-50%,-50%) scaleX(1) scale("+(elemento.CustomScale*this.escalaIsometrico)+")",
            "-webkit-mask-image": "url('"+elemento.ImagePath+"')",
            //"mix-blend-mode": "multiply"',
            "display": "flex",
            "justify-content": "center",
            "pointer-events": "none"
        }

        //Renderizar Elemento:
        var top = ((parseFloat(elemento.Position.y)-this.posicionMin_y)*this.escalaIsometrico/*+parseFloat(elemento.VisibilityColliderStackingOffset.y)*/) + "px";
        style["top"]= top.replace(/,/g,".")

        var left= ((parseFloat(elemento.Position.x)-this.posicionMin_x)*this.escalaIsometrico/*-parseFloat(elemento.VisibilityColliderStackingOffset.x)*/) + "px";
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
        style["display"] = "none";

        for(var i =0; i <this.salasDescubiertas.length; i++){
            if(Number(this.salasDescubiertas[i])==Number(elemento.sala)){
                style.display= "flex";
            }
        }

        if(elemento.seleccionable || elemento.especial ){
            style["pointer-events"] = "all";
            if(this.renderMazmorra?.interactuado){
                for(var i = 0; i < this.renderMazmorra["interactuado"].length; i++){
                    if(elemento.Id == this.renderMazmorra["interactuado"][i]){
                        style["display"] = "none";
                    }
                }
            }
        }else{
              style["pointer-events"] = "none";
        }

        if(elemento.enemigoId){

        }

        //Renderizar Seleccion:
        if(elemento.seleccionado){
            style["filter"] = "sepia(100%) saturate(100)";
        }

        //Aplicar filtro de Seleccion:
        //var width= ((window.innerWidth*0.7)/opcionesCanvas.MapSizeX)*100 + "px";
        //style.width= width.replace(/,/g,".")

        //var height= ((window.innerHeight*0.6)/opcionesCanvas.MapSizeY)*100 + "%";
        //style.height= height.replace(/,/g,".")

        return style;
    }

    renderizarEnemigoIsometrico(elemento){
        var style = {
            "display": "none",
            "mix-blend-mode": "multiply",
            "border": "none"
        }
       for(var i = 0; i < this.renderEnemigos.length; i++){
           if(this.renderEnemigos[i].enemigo_id == elemento.enemigoId){
                style["border"] = "10px solid "+this.renderEnemigos[i].color;
                style["display"] = "block";
           }
       }
       return style;
        
    }

    clickElemento(elemento){
      this.eventoClickElemento.emit(elemento);
    }

    centrarMazmorra(){

        if(this.pinchZoom==undefined){return}

        this.pinchZoom.pinchZoom.moveX =  -0.5*this.renderX-0.12*this.vw;
        this.pinchZoom.pinchZoom.moveY = -0.5*this.renderY;
        this.pinchZoom.pinchZoom.scale = 1
        this.pinchZoom.pinchZoom.transformElement(1000);
        this.pinchZoom.pinchZoom.updateInitialValues();

    }
}





