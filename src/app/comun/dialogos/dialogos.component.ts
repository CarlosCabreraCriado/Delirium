
import { Component , Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent} from '../boton/boton.component';

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

	constructor(public dialogRef: MatDialogRef<DialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }
}





