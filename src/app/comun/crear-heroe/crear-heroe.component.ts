
import { Component , Inject, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent} from '../boton/boton.component';

export interface CrearHeroeData {
  tipoDialogo: string;
  data: any;
}

@Component({
  selector: 'crearHeroeComponent',
  templateUrl: './crear-heroe.component.html',
  styleUrls: ['./crear-heroe.component.sass']
})

export class CrearHeroeComponent {

	private confirmation: boolean = false;
	private comando = "";

	private claseSeleccionada = "guerrero";
	private generoSeleccionado = "masculino";
	private nombre = "";
	public imagenId = 3;

	constructor(public dialogRef: MatDialogRef<CrearHeroeComponent>, @Inject(MAT_DIALOG_DATA) public data: CrearHeroeData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

	renderIdImagen(){

		switch(this.claseSeleccionada){
			case "guerrero":
				this.imagenId= 3;
				break
			case "hechicero":
				this.imagenId= 1;
				break
			case "sacerdote":
				this.imagenId= 7;
				break
			case "cazador":
				this.imagenId= 5;
				break
			case "picaro":
				this.imagenId= 9;
				break
		}

		if(this.generoSeleccionado=="femenino"){
			this.imagenId++;
		}

	}

	seleccionarClase(clase: string){
		this.claseSeleccionada = clase;
		this.renderIdImagen();
	}

	seleccionarGenero(genero: string){
		this.generoSeleccionado = genero;
		this.renderIdImagen();
	}


}





