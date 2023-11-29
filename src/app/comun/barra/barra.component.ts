
import { Component , Input , ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'barraComponent',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.sass'],
  //changeDetection: ChangeDetectionStrategy.OnPush

})

export class BarraComponent {

	@Input() texto: string;
	@Input() tipo: string;
	@Input() valor: number;
	@Input() escudo: number;
	@Input() badge: boolean = false;
	@Input() orientacion: string = "horizontal";
  @Input() identificador: string;

  public valorRadial: number = 0;

	constructor() {}

}





