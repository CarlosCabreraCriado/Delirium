
import { Component , Inject, ViewChild,  ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { BotonComponent } from '../boton/boton.component';
import { FrameComponent } from '../frame/frame.component';

export interface DialogData {
  tipoDialogo: string;
  data: any;
}

@Component({
  selector: 'dialogoComponent',
  templateUrl: './dialogos.component.html',
  styleUrls: ['./dialogos.component.sass']
})

export class DialogoComponent {

private confirmation: boolean = false;

  	@ViewChild('crearCorreo',{static: false}) crearCorreoElement:ElementRef; 
  	@ViewChild('crearUsuario',{static: false}) crearUsuarioElement:ElementRef; 
  	@ViewChild('crearPassword',{static: false}) crearPasswordElement:ElementRef; 
  	@ViewChild('crearPassword2',{static: false}) crearPassword2Element:ElementRef; 

	constructor(public dialogRef: MatDialogRef<DialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

	crearCuenta(){

		var camposCuenta = {
			usuario: this.crearUsuarioElement.nativeElement.value,
			email: this.crearCorreoElement.nativeElement.value,
			password: this.crearPasswordElement.nativeElement.value,
			password2: this.crearPassword2Element.nativeElement.value
		}

		return camposCuenta;
	}

}





