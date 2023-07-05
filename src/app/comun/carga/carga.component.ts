

import { Component, OnInit } from '@angular/core';
import { AppService} from '../../app.service'

@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.sass']
})
export class CargaComponent implements OnInit {

  constructor(private appService: AppService) { }

  public mostrarPantallaCarga: boolean = true;
  private subtituloCarga: string = "Cargando";
  private progreso:string = "0%";
  public opacidad:any = 1;

  ngOnInit() {

    //Inicio suscripción mostrar carga
    this.appService.mostrarCarga.subscribe(mostrar => {
      if(mostrar){
		  this.mostrarPantallaCarga=true;
		  this.opacidad=1; 
	  }else{
		  this.opacidad=0; 
 			setTimeout(()=>{  
				this.mostrarPantallaCarga=false;
 			}, 2000);	
	  }
    });

    //Inicio suscripcion evento progreso Carga
    this.appService.progresoCarga.subscribe(progreso => {
      this.progreso= progreso;
    });
  }// Final OnInit

}
