
import { Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {trigger,state,style,animate,transition, keyframes} from '@angular/animations';
import {MazmorraService} from '../mazmorra/mazmorra.service';

@Component({
  selector: 'appMarcoClase',
  templateUrl: './marco-clase.component.html',
  styleUrls: ['./marco-clase.component.sass']
})

export class MarcoClaseComponent implements OnInit {

	public heroeClase: string;

	@Input() heroe: any;
	@Input() heroeIndex: number;


  	constructor(private mazmorraService: MazmorraService) { }

  	ngOnInit() {
  		this.heroeClase = this.heroe.clase;
  	}

    renderIndividual(): any{
      var clase= "";
      if(this.mazmorraService.getDispositivo()=="Movil"){
        clase= clase+" Individual"
      }
    return clase;
  }

}
