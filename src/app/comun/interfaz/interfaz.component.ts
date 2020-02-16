
import { Component, OnInit, Input } from '@angular/core';
import { InterfazService } from './interfaz.service';

@Component({
  selector: 'app-interfaz',
  templateUrl: './interfaz.component.html',
  styleUrls: ['./interfaz.component.sass']
})
export class InterfazComponent implements OnInit {


	@Input() renderMazmorra: any;

  constructor(private interfazService: InterfazService) { }


  ngOnInit() {

  }


}
