
import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'seleccionPersonajeComponent',
  templateUrl: './seleccion-personaje.component.html',
  styleUrls: ['./seleccion-personaje.component.sass']
})

export class SeleccionPersonajeComponent implements OnInit {

    public heroeSeleccionado = null;
    public heroes: any[] = [];
    private appServiceSuscripcion: Subscription

	constructor(private appService: AppService) {}


    ngOnInit(){

        var perfil = this.appService.getPerfilRam();
        this.heroes = perfil["heroes"];
        this.renderBadge();
       
        //Suscripcion AppService:
        this.appServiceSuscripcion = this.appService.eventoAppService.subscribe((comando) =>{
            switch(comando){
                case "actualizarHeroeSeleccionado":
                    var perfil = this.appService.getPerfilRam();
                    this.heroes = perfil["heroes"];
                    this.renderBadge();
                    this.heroeSeleccionado = null;
                    break;
            }
        });

    }

    seleccionarHeroe(index:number){
        this.heroeSeleccionado= index;
    }

    mostrarCrearHeroe(){
        this.heroeSeleccionado= null;
        this.appService.mostrarCrearHeroe();
    }
    
    renderBadge(){
        for(var i = 0; i < this.heroes.length; i++){
            if(this.heroes[i].clase == undefined){continue}
            switch(this.heroes[i].clase){
                case "guerrero":
                    this.heroes[i]["badgeId"]= 1;
                    break;
                case "hechicero":
                    this.heroes[i]["badgeId"]= 2;
                    break;
                case "cazador":
                    this.heroes[i]["badgeId"]= 3;
                    break;
                case "ladrón":
                    this.heroes[i]["badgeId"]= 5;
                    break;
                case "sacerdote":
                    this.heroes[i]["badgeId"]= 4;
                    break;
            }
        }
        return;
    }

    entrar(){
        this.appService.entrarMundo(this.heroeSeleccionado);
        
    }

    abrirConfiguracion(){
        this.appService.mostrarConfiguracion("",{})
    }

    eliminarPersonaje(){
       const dialogoEliminar = this.appService.mostrarDialogo("Confirmacion", {titulo: "¿Seguro que desee eliminar el personaje?",contenido: "Esta acción no podrá deshacerse una vez realizada."})

        dialogoEliminar.afterClosed().subscribe(result => {
            if(result){
                console.warn('Eliminando Personaje...');
                this.appService.eliminarPersonaje(this.heroeSeleccionado);
            }
        })

        return;
    }


}





