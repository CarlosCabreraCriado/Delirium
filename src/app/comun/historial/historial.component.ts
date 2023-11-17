
import { Component } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'historialComponent',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.sass']
})

export class HistorialComponent {

    public historial: any;

    constructor(private appService: AppService) {
        console.error("CAMBIO SESION")
        this.appService.sesion$.subscribe(sesion => this.historial = sesion.render.historial);
    }

}





