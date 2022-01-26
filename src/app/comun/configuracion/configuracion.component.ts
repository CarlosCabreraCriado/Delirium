
import { Component , Inject, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent} from '../boton/boton.component';

export interface ConfiguracionData {
  tipoDialogo: string;
  data: any;
}

@Component({
  selector: 'configuracionComponent',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.sass']
})

export class ConfiguracionComponent {

	private confirmation: boolean = false;
	private comando = "";

	constructor(public dialogRef: MatDialogRef<ConfiguracionComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfiguracionData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

	cerrarSesion():void{
		console.log("Cierre")
		//this.dialogRef.close("Cerrar");
		return;
	}

}




