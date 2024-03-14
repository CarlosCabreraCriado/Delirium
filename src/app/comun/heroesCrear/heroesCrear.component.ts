
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { HeroesCrearService} from './heroesCrear.service';

@Component({
  selector: 'appHeroesCrear',
  templateUrl: './heroesCrear.component.html',
  styleUrls: ['./heroesCrear.component.sass']
})

export class HeroesCrearComponent implements OnInit{

	constructor(public appService: AppService, public heroesCrearService: HeroesCrearService/*, public electronService: ElectronService*/) { }

	public panelSeleccionado= "inicial";
	public mostrarHeroesCrear= false;

	ngOnInit(){

	}

	seleccionarPanel(panel:string):void{
		this.panelSeleccionado= panel;
		console.log(panel,"seleccionado");
	}

	activarHeroesCrear(){
		this.mostrarHeroesCrear= true;
	}

}

