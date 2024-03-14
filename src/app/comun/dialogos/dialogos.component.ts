
import { Component , Inject, ViewChild,  ElementRef, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BotonComponent } from '../boton/boton.component';
import { SocketService } from '../socket/socket.service';
import { Subscription } from "rxjs";

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
    private indexOpcionSeleccionada: number = null;
    public estadoJugadores: boolean[] = [];
    public jugadorPropioSesionIndex: number = null;
    private contadorForzarCierre: number = 0;

    //Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription = null;

	constructor(private socketService: SocketService, public dialogRef: MatDialogRef<DialogoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(){

        //Inicializa el estado de los jugadores:
        this.jugadorPropioSesionIndex = 0;
        this.estadoJugadores = [false];
        this.indexOpcionSeleccionada = null;
        this.contadorForzarCierre = 0;

        if(this.data["numJugadores"] != undefined && this.data["jugadorPropioSesionIndex"] != undefined ){
            this.estadoJugadores = new Array(Number(this.data["numJugadores"])).fill(false);
            this.jugadorPropioSesionIndex = this.data["jugadorPropioSesionIndex"];

            if(typeof this.jugadorPropioSesionIndex != "number"){
                console.error("Error: Dialogo Index jugador no es un numero");
            }
        }

        //console.warn("Iniciando Dialogo:",this.data)
        this.textosDialogo = [];
        if(this.data.contenido){
            this.data.contenido = this.data.contenido.replaceAll("\n","</br>");
            this.data.contenido = this.data.contenido.replaceAll("$bold$","<b>")
            this.data.contenido = this.data.contenido.replaceAll("$/$","</b>")

            this.textosDialogo = this.data.contenido.split("$");
        }

        this.indexTextoMostrado = 0;
        this.opciones = [];

        if(this.textosDialogo.length == 1){
            this.opciones = this.data.opciones;
        }

        //Suscripcion Socket:
        this.socketSubscripcion = this.socketService.eventoSocket.subscribe(async(data) => {
            switch(data.peticion){
                case "comandoPartida":
                    switch(data.comando){

                        case "terminarDialogo":
                            //Cambiar flag de jugador:
                            this.estadoJugadores[data.contenido] = true;
                            for(var i = 0; i < this.estadoJugadores.length; i++){
                                if(!this.estadoJugadores[i]){return;} //Si hay algun jugador que no ha terminado el dialogo, no hace nada. (Comentar para eliminar mecanica de espera)
                            }

                            if(this.indexOpcionSeleccionada == null){
                                console.warn("OPCION ENCADENADO", this.data.ordenEncadenado)
                                this.dialogRef.close(this.data.ordenEncadenado);
                            }else{
                                this.dialogRef.close(this.opciones[this.indexOpcionSeleccionada].ordenIdEncadanado)
                            }
                        break;
                    }

                break;
            }
        }); //FIN SOCKET SUSCRIPTION:

    }

    ngOnDestroy(){
        this.socketSubscripcion.unsubscribe();
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
        if(this.opciones?.length > 0){
            return;

        //Si no hay opciones y todavia quedan dialogos por mostrar:
        }else if(this.textosDialogo.length-2 >= this.indexTextoMostrado){

            this.indexTextoMostrado++;
            if(this.indexTextoMostrado == this.textosDialogo.length-1){
                this.opciones = this.data.opciones;
            }
            return;

        }else{
            if(this.data["desarrollo"]){
                this.dialogRef.close(this.data.ordenEncadenado)
            }else{
                console.warn("TERMINANDO DIALOGO")
                this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "terminarDialogo", contenido: this.jugadorPropioSesionIndex});
            }

            return;
        }

//[mat-dialog-close]="data.ordenEncadenado"
    }

    seleccionarOpcion(indexOpcion: number){
        this.indexOpcionSeleccionada = indexOpcion;
        if(this.estadoJugadores.length == 0){
            this.dialogRef.close(this.opciones[this.indexOpcionSeleccionada].ordenIdEncadanado)
        }else{
            this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "terminarDialogo", contenido: this.jugadorPropioSesionIndex});
        }
    }

    forzarEnvioTerminarDialogo(){
          this.contadorForzarCierre++;
          this.socketService.enviarSocket("comandoPartida",{peticion: "comandoPartida", comando: "terminarDialogo", contenido: this.jugadorPropioSesionIndex});
          if(this.contadorForzarCierre > 3){
              if(this.indexOpcionSeleccionada == null){
                  this.dialogRef.close(this.data.ordenEncadenado)
              }else{
                  this.dialogRef.close(this.opciones[this.indexOpcionSeleccionada].ordenIdEncadanado)
              }
          }
    }

    retroceder(){
        this.indexTextoMostrado--;
        return;
    }


}





