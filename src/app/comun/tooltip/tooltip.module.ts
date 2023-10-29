
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipObjetoComponent } from './objetos/objeto.component';
import { TooltipDirective } from './directiva/tooltip.directive';
import { BotonComponent } from '../boton/boton.component';

@NgModule({
    imports: [CommonModule],
    declarations: [
        TooltipObjetoComponent,
        TooltipDirective,
        BotonComponent
    ],
    exports: [TooltipDirective, BotonComponent],
})

export class TooltipModule {}






