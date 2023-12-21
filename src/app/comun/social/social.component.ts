
import { Component , Inject, ViewChild} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BotonComponent } from '../boton/boton.component';
import { AppService } from '../../app.service';
import { SocketService } from '../../comun/socket/socket.service';
import { Subscription } from "rxjs";

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
    public perfil: any = null;
    public estadoAmigos = [];

    //Declara Suscripcion Evento Socket:
    private socketSubscripcion: Subscription

	constructor(private socketService: SocketService, public dialogRef: MatDialogRef<SocialComponent>, @Inject(MAT_DIALOG_DATA) public data: SocialData, private appService: AppService) { }

    ngOnInit(){
    console.error("INIT")
       this.perfil = this.appService.getPerfilRam();
       //Suscripcion Socket (SERVER):
       this.socketSubscripcion = this.socketService.eventoSocket.subscribe((data) =>{
            switch(data.peticion){
                case "estadoAmigosServer":
                    console.warn("Estado Amigos: ",data)
                    this.estadoAmigos = data["estadoAmigosServer"]
                break;
            }//FIN SWITCH
       });

        this.socketService.enviarSocket("getEstadoAmigos",{amigos: this.perfil.amigos});
    }

    ngOnDestroy() {
        console.warn("Destruyendo Componente Social...")
        this.socketSubscripcion.unsubscribe();
    }

    reloadEstado(){
        this.socketService.enviarSocket("getEstadoAmigos",{amigos: this.perfil.amigos});
    }

    onAcceptClick(): void {
      this.confirmation = true;
      this.dialogRef.close();
    }

    reclutar(usuario: string){
        console.warn("Reclutando: "+usuario);
        this.appService.reclutarHeroe(usuario);
    }

}





