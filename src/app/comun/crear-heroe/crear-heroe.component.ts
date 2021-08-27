
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

	constructor(public dialogRef: MatDialogRef<CrearHeroeComponent>, @Inject(MAT_DIALOG_DATA) public data: CrearHeroeData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }


}





