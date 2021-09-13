
import { Component , Inject, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent } from '../boton/boton.component';

export interface SocialData {
  tipoDialogo: string ;
  data: any;
}

@Component({
  selector: 'socialComponent',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.sass']
})

export class SocialComponent {

	private confirmation: boolean = false;
	private comando = "";

	constructor(public dialogRef: MatDialogRef<SocialComponent>, @Inject(MAT_DIALOG_DATA) public data: SocialData) { }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

}





