
import { Injectable } from '@angular/core';
import { AppService} from '../../app.service';

@Injectable({
  providedIn: 'root'
})

export class RngService {

	private valorTirada:any = 0;
	public mostrarRng: boolean= false;

  	constructor(private appService: AppService) { }

 	  setValorTirada(val):void{
  		this.valorTirada= val;
  	}

  	getValorRng():number{
  		return this.valorTirada;
  	}

  	activarRng():void{
  		this.mostrarRng = true;
  	}

  	desactivarRng():void{
  		this.mostrarRng = false;
  	}

    lanzarRng(valor):void{
      this.valorTirada= valor;
      this.appService.teclaPulsada("Enter");
    }

}

