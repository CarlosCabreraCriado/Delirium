
import { Component, OnInit } from '@angular/core';
import { AppService} from '../../app.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-developer',
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.css']
})

export class DeveloperComponent implements OnInit{

	constructor(private appService: AppService){}

	private tecla: string;
	private teclaSuscripcion: Subscription = null;


	ngOnInit(){
		this.teclaSuscripcion = this.appService.observarTeclaPulsada$.subscribe(
        (val) => {
          this.tecla= val;
          this.actualizarComponente();
        }
      );
	}

	actualizarComponente(): void{
		switch(this.tecla){
			case "ArrowUp":
			
			break;
			case "ArrowDown":
			
			break;
			case "Enter":
				
			break;
		}
	}



}
