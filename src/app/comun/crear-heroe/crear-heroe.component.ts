
import { Component, OnInit, Inject, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent} from '../boton/boton.component';
import { FormControl} from '@angular/forms';
import { AppService } from '../../app.service';

export interface CrearHeroeData {
  tipoDialogo: string;
  data: any;
}

@Component({
  selector: 'crearHeroeComponent',
  templateUrl: './crear-heroe.component.html',
  styleUrls: ['./crear-heroe.component.sass']
})

export class CrearHeroeComponent implements OnInit {

	private confirmation: boolean = false;
	private comando = "";

	public claseSeleccionada = "Guerrero";
	public generoSeleccionado: "masculino"|"femenino" = "masculino";
    public descripcion: string = "";
	public imagenId:number = 3;

    public tank = true;
    public dps = true;
    public heal = false;
    public nombre = new FormControl('');

	constructor(public dialogRef: MatDialogRef<CrearHeroeComponent>, @Inject(MAT_DIALOG_DATA) public data: CrearHeroeData, private appService: AppService) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }
    
    ngOnInit(){
        this.descripcion = this.data["contenido"].clases[0].descripcion;
        this.renderIdImagen();
    }

	renderIdImagen(){

		switch(this.claseSeleccionada){
			case "Guerrero":
				this.imagenId= 3;
                this.tank = true;
                this.dps = true;
                this.heal = false;
                this.descripcion = this.data["contenido"].clases[0].descripcion;
				break
			case "Hechicero":
				this.imagenId= 1;
                this.tank = false;
                this.dps = true;
                this.heal = false;
                this.descripcion = this.data["contenido"].clases[1].descripcion;
				break
			case "Cazador":
				this.imagenId= 5;
                this.tank = false;
                this.dps = true;
                this.heal = true;
                this.descripcion = this.data["contenido"].clases[2].descripcion;
				break
			case "Sacerdote":
				this.imagenId= 7;
                this.tank = false;
                this.dps = true;
                this.heal = true;
                this.descripcion = this.data["contenido"].clases[3].descripcion;
				break
			case "Ladrón":
				this.imagenId= 9;
                this.tank = false;
                this.dps = true;
                this.heal = false;
                this.descripcion = this.data["contenido"].clases[4].descripcion;
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

	seleccionarGenero(genero: "masculino"|"femenino"){
		this.generoSeleccionado = genero;
		this.renderIdImagen();
	}

    crearPersonaje(){
        if(this.nombre.value==""){
            this.appService.mostrarDialogo("Informativo",{titulo: "Nombre no valido",contenido: "Introduzca un nombre de heroe valido."})
            return;
        }

        //Si el nombre es valido Crea el personaje
        this.appService.crearHeroe(this.nombre.value,this.claseSeleccionada,this.generoSeleccionado,this.imagenId,this.dialogRef)



    }

}





