
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
        this.appService.sesion$.subscribe((sesion) => {
          if(!sesion){return;}
          this.historial = sesion.render.historial;
        });
    }

}





