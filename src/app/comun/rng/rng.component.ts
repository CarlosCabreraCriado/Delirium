
import { Component, OnInit } from '@angular/core';
import {RngService} from './rng.service';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-rng',
  templateUrl: './rng.component.html',
  styleUrls: ['./rng.component.sass']
})
export class RngComponent implements OnInit {

  constructor(public rngService: RngService, public appService: AppService) { }


  ngOnInit() {

  }


}
