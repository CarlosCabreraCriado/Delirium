 
import { Component , Inject, ViewChild,  ElementRef, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { BotonComponent } from '../boton/boton.component';
import { FrameComponent } from '../frame/frame.component';

@Component({
  selector: 'dialogoComponent',
  templateUrl: './dialogos.component.html',
  styleUrls: ['./dialogos.component.sass']
})

export class DialogoComponent implements OnInit {

private confirmation: boolean = false;

  	@ViewChild('crearCorreo',{static: false}) crearCorreoElement:ElementRef; 
  	@ViewChild('crearUsuario',{static: false}) crearUsuarioElement:ElementRef; 
  	@ViewChild('crearPassword',{static: false}) crearPasswordElement:ElementRef; 
  	@ViewChild('crearPassword2',{static: false}) crearPassword2Element:ElementRef; 

    public textosDialogo: string[] = [];
    public indexTextoMostrado: number = 0;
    public opciones: any = [];

	constructor(public dialogRef: MatDialogRef<DialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){
        console.warn("Iniciando Dialogo:",this.data)
        this.data.contenido = this.data.contenido.replaceAll("\n","</br>");
        this.indexTextoMostrado = 0;
        this.opciones = [];
        this.textosDialogo = this.data.contenido.split("$");
        if(this.textosDialogo.length == 1){
            this.opciones = this.data.opciones;
        }
    }

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

    nextDialogo(){

        //Si hay opciones Deshabilita el paso de dialogo:
        if(this.opciones.length > 0){
            return;
        //Si no hay opciones y todavia quedan dialogos por mostrar:
        }else if(this.textosDialogo.length-1 >= this.indexTextoMostrado){
            this.indexTextoMostrado++;
            if(this.indexTextoMostrado == this.textosDialogo.length-1){
                this.opciones = this.data.opciones;
            }
            return;
        }else{
            this.dialogRef.close("continuar")
            return;
        }
    }
        

}





