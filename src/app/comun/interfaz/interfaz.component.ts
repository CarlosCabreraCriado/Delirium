
import { Component, OnInit, Input,  ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { InterfazService } from './interfaz.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-interfaz',
  templateUrl: './interfaz.component.html',
  styleUrls: ['./interfaz.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InterfazComponent implements OnInit {

	@Input() activarInterfaz: boolean = false;

    //Declara Suscripcion para Interfaz:
    private interfazSuscripcion: Subscription;

  constructor(private cdr: ChangeDetectorRef, public interfazService: InterfazService) { }


  ngOnInit() {
        //suscripcion Interfaz:
        this.interfazSuscripcion = this.interfazService.observarInterfaz$.subscribe((val) => {
            if(val == "reloadInterfaz"){
                this.cdr.detectChanges();
            }
        });
  }




}
