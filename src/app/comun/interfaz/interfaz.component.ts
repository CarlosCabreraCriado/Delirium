
import { Component, OnInit, Input } from '@angular/core';
import { InterfazService } from './interfaz.service';

@Component({
  selector: 'app-interfaz',
  templateUrl: './interfaz.component.html',
  styleUrls: ['./interfaz.component.sass']
})
export class InterfazComponent implements OnInit {


	@Input() renderMazmorra: any;

    public hechizoSeleccionadoIndex = null;

  constructor(public interfazService: InterfazService) { }


  ngOnInit() {
    
  }

  seleccionarHechizo(indexHechizo){
        this.hechizoSeleccionadoIndex = indexHechizo;
        this.interfazService.selectHechizo(indexHechizo);
  }

  lanzarHechizo(){
        this.interfazService.seleccionarHechizo(this.hechizoSeleccionadoIndex); 
        this.hechizoSeleccionadoIndex = null;
        //this.interfazService.desactivarInterfaz();
  }


}
