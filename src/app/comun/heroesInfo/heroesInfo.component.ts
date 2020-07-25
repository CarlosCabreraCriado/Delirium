
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { HeroesInfoService} from './heroesInfo.service';

@Component({
  selector: 'appHeroesInfo',
  templateUrl: './heroesInfo.component.html',
  styleUrls: ['./heroesInfo.component.sass']
})

export class HeroesInfoComponent implements OnInit{

	constructor(public appService: AppService, public heroesInfoService: HeroesInfoService/*, public electronService: ElectronService*/) { }

	private panelSeleccionado= "personaje";
	private mostrarHeroesInfo= false;

	ngOnInit(){
	}

	seleccionarPanel(panel:string):void{
		this.panelSeleccionado= panel;
	}

	activarHeroesInfo(){
		this.mostrarHeroesInfo= true;
	}

}




