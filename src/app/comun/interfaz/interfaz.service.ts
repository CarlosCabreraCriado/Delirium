
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InterfazService {

	private valorTirada:any = 0;
	public mostrarInterfaz: boolean= false;
  private pantallaInterfaz: string= "Hechizos";

  // Observable string sources
  private observarInterfaz = new Subject<any>();

  // Observable string streams
  observarInterfaz$ = this.observarInterfaz.asObservable();

  	constructor() { }


    setPantallaInterfaz(val):void{
      this.pantallaInterfaz= val;
      return;
    }

    getPantallaInterfaz():any{
      return this.pantallaInterfaz;
    }

    activarInterfaz():void{
      this.mostrarInterfaz = true;
    }

    desactivarInterfaz():void{
      this.mostrarInterfaz = false;
      this.pantallaInterfaz="Hechizos";
      this.observarInterfaz.next({comando: "cancelar",valor: "cancelar"});
    }

    setInterfaz(interfaz):void{
      this.pantallaInterfaz = interfaz;
      return;
    }

    selecionarHechizo(numHechizo):void{
      this.observarInterfaz.next({comando: "selecionarHechizo",valor: numHechizo});
      return;
    }

     lanzarHechizo():void{
      this.observarInterfaz.next({comando: "lanzarHechizo",valor: ""});
      this.desactivarInterfaz();
      return;
    }
}

