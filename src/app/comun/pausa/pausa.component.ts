import { Component, OnInit } from '@angular/core';
import { PausaService} from './pausa.service'
import { AppService} from '../../app.service'

@Component({
  selector: 'app-pausa',
  templateUrl: './pausa.component.html',
  styleUrls: ['./pausa.component.sass']
})

export class PausaComponent implements OnInit {

  constructor(private appService:AppService, private pausaService:PausaService) { }

  private mostrarPausaConfirmar:boolean=false;
  private mostrarPausaGeneral:boolean=true;

  ngOnInit() {
  }

}
