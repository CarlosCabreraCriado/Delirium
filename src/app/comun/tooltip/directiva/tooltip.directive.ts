
import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { Subscription } from "rxjs";
import { TooltipObjetoComponent } from '../objetos/objeto.component';

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective {

  @Input() tooltipTextoBoton = null;
  @Input() tooltipPosition: "top"|"bottom"|"left"|"right" = 'top';
  @Input() tooltipObjeto: any;
  @Output() accionBotonTooltip = new EventEmitter<void>();

  private tooltipComponent?: ComponentRef<any>;

  //Component Suscripcion Evento Socket:
  private botonTooltipSuscription: Subscription

  @HostListener('mouseenter',["$event"])
  onMouseEnter(event): void {
    //console.log('onMouseEnter');
    if (this.tooltipComponent) {
        return;
    }

    if(event.relatedTarget?.innerText == "Equipar" || event.relatedTarget?.innerText == "Desequipar"){
        return;
    }

    const tooltipComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
      TooltipObjetoComponent
    );

    this.tooltipComponent = tooltipComponentFactory.create(this.injector);
    this.document.body.appendChild(
      this.tooltipComponent.location.nativeElement
    );

    this.setTooltipComponentProperties();
    this.tooltipComponent.hostView.detectChanges();
  }

  @HostListener('mouseleave',['$event'])
  onMouseLeave(event): void {
    //console.log('onMouseLeave');
    if (!this.tooltipComponent) {
      return;
    }

    if(event.relatedTarget?.innerText == this.tooltipTextoBoton){
        this.accionBotonTooltip.emit();
    }

    this.appRef.detachView(this.tooltipComponent.hostView);
    this.tooltipComponent.destroy();
    this.tooltipComponent = undefined;
  }

  private setTooltipComponentProperties() {
    if (!this.tooltipComponent) {
      return;
    }

    this.tooltipComponent.instance.tooltipTextoBoton = this.tooltipTextoBoton;

    const {
      left,
      right,
      bottom,
      top
    } = this.elementRef.nativeElement.getBoundingClientRect();

    this.tooltipComponent.instance.left = left;
    this.tooltipComponent.instance.top = top;
    this.tooltipComponent.instance.bottom = bottom;
    this.tooltipComponent.instance.right = right;
    this.tooltipComponent.instance.posicion = this.tooltipPosition;
    this.tooltipComponent.instance.posicion = this.tooltipPosition;
    this.tooltipComponent.instance.objeto = this.tooltipObjeto;

  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private elementRef: ElementRef,
    private appRef: ApplicationRef,
    @Inject(DOCUMENT) private document: Document
  ) {}
}




