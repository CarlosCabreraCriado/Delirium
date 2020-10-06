
import { Component , Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

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

  public editorVerOptions: JsonEditorOptions;
  public editorModificarOptions: JsonEditorOptions;

  private confirmation: boolean = false;

  @ViewChild(JsonEditorComponent, { static: true }) editor: JsonEditorComponent;

	constructor(public dialogRef: MatDialogRef<DialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    this.editorVerOptions = new JsonEditorOptions()
    this.editorModificarOptions = new JsonEditorOptions()
    this.editorModificarOptions.mode = 'tree'; // set all allowed modes
    this.editorVerOptions.mode = 'view'; // set all allowed modes

  }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }
}





