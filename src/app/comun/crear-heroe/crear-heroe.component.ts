
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
	private idImagen = 3;

	constructor(public dialogRef: MatDialogRef<CrearHeroeComponent>, @Inject(MAT_DIALOG_DATA) public data: CrearHeroeData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

	renderIdImagen(){

		switch(this.claseSeleccionada){
			case "guerrero":
				this.idImagen= 3;
				break
			case "hechicero":
				this.idImagen= 1;
				break
			case "sacerdote":
				this.idImagen= 7;
				break
			case "cazador":
				this.idImagen= 5;
				break
			case "picaro":
				this.idImagen= 9;
				break
		}

		if(this.generoSeleccionado=="femenino"){
			this.idImagen++;
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





