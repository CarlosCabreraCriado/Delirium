
import { Component, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'historialComponent',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.sass']
})

export class HistorialComponent {

    public historial: any;
	  @Output() subscripcionHistorial: EventEmitter<any> = new EventEmitter();

    constructor(private appService: AppService) {
        this.appService.sesion$.subscribe((sesion) => {
          if(!sesion){return;}
          this.historial = sesion.render.historial;
        });
    }

    cerrarHistorial(){
      this.subscripcionHistorial.emit("cerrarHistorial");
    }

}





