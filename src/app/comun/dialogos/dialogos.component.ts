
import { Component , Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BotonComponent } from '../boton/boton.component';

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
		this.appService.crearCuenta(this.crearCorreoElement.nativeElement.value,this.crearCorreoElement.nativeElement.value,this.crearCorreoElement.nativeElement.value,this.crearCorreoElement.nativeElement.value);

		return;
	}

}





