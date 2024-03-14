import { Component, OnInit } from '@angular/core';
import { PausaService} from './pausa.service'
import { AppService} from '../../app.service'

@Component({
  selector: 'app-pausa',
  templateUrl: './pausa.component.html',
  styleUrls: ['./pausa.component.sass']
})

export class PausaComponent implements OnInit {

  constructor(public appService:AppService, public pausaService:PausaService) { }

  public mostrarPausaConfirmar:boolean=false;
  public mostrarPausaGeneral:boolean=true;

  ngOnInit() {
  }

}
