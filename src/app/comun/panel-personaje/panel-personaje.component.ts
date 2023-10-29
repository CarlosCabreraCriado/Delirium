
import { Component, ChangeDetectorRef, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'panelPersonajeComponent',
  templateUrl: './panel-personaje.component.html',
  styleUrls: ['./panel-personaje.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PanelPersonaje implements OnInit {

	public pantalla = "General";
	public mostrarSeleccionHeroe = false;

	public idImagenHechizo= [5,1,2,3,4];
	public imagenHechHorizontal= [0,0,0,0,0];
	public imagenHechVertical= [0,0,0,0,0];

	//Definicion estadisticas generales:
	private perfil: any = null;
	private clases: any = null;
	private objetos: any = null;
	private perks: any = null;

	public hechizos: any = null;
	public buff: any = null;

	public heroeSeleccionado : any = null;
    public hechizosAprendidos = [];
    public hechizosEquipados = [];
    public sesion: any;
    public estadoApp: any;
    public hechizoSeleccionadoIndex = null;

	constructor(private cdr: ChangeDetectorRef, private appService: AppService) {}

	async ngOnInit(){

		console.log("Importando Datos de AppService... ")
		this.perfil= await this.appService.getPerfil();
		this.clases= await this.appService.getClases();
		this.objetos= await this.appService.getObjetos();
		this.perks= await this.appService.getPerks();
		this.hechizos= await this.appService.getHechizos();
		this.buff= await this.appService.getBuff();
		this.sesion= await this.appService.getSesion();
		this.estadoApp= await this.appService.getEstadoApp();
        
		this.heroeSeleccionado= this.sesion.jugadores[this.estadoApp.jugadorPropioSesionIndex].personaje;

		//Inicia el renderizado de los sprites de hechizos:
		this.renderizarImagenHechizos();

		//Cargar Descripciones de personaje:
		console.log(this.clases)
		console.log(this.perfil)
		console.log(this.sesion)
		for(var i= 0; i < this.perfil.heroes.length; i++){
			//this.perfil.heroes[i]["descripcion"] = this.clases["clases"].find(j=>j.nombre==this.perfil.heroes[i].clase.toLowerCase())["descripcion"]
		}

		console.log("HEROES:")
		console.log(this.perfil)
        console.log(this.hechizos)
        console.log(this.heroeSeleccionado)

        console.log("Index Heroe", this.estadoApp.heroePropioSesionIndex, this.heroeSeleccionado)

        for(var i = 0; i < this.perfil.heroes[0].hechizos.aprendidos.length; i++){
          this.hechizosAprendidos.push(this.hechizos.hechizos.find(j => j.id == this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].hechizos.aprendidos[i]))
        }

        for(var i = 0; i < this.perfil.heroes[0].hechizos.equipados.length; i++){
          this.hechizosEquipados.push(this.hechizos.hechizos.find(j => j.id == this.perfil.heroes[this.estadoApp.heroePropioPerfilIndex].hechizos.equipados[i]))
        }

		console.log("APRENDIDOS:")
		console.log(this.hechizosAprendidos)

		console.log("EQUIPADOS:")
		console.log(this.hechizosEquipados)

        this.cdr.detectChanges()

		return;
	}

	cambiarPantalla(pantalla:string){
		this.pantalla=pantalla;
		return;
	}

    seleccionarHechizo(indexSeleccion){
        this.hechizoSeleccionadoIndex= indexSeleccion;
        return;
    }

	renderizarImagenHechizos(){

		if(this.heroeSeleccionado==null){
			this.idImagenHechizo= [1,1,1,1,1];
			return;
		}

        for(var i=0; i < 5; i++){
			this.idImagenHechizo[i] = this.hechizos.hechizos[i].imagen_id;
		}

		//Inicializando parametros de visualización de Sprites
		var indexHorizontal=0;
		var indexVertical= 0;

        for(var i=0; i < 5; i++){
          indexVertical= Math.floor(this.idImagenHechizo[i]/18);
          indexHorizontal= this.idImagenHechizo[i]-indexVertical*18;

          this.imagenHechHorizontal[i]= 0.4+5.84*indexHorizontal;
          this.imagenHechVertical[i]= 19.8*indexVertical;
        }
		return;
	}

	camelize(texto: string){
 		return texto.toLowerCase().charAt(0).toUpperCase() + texto.toLowerCase().slice(1);
	}

	toggleMostrarSeleccionHeroe(){
		if(this.heroeSeleccionado==null){
			this.appService.mostrarDialogo("Informativo",{titulo: "Seleccione un heroe",contenido:"Para confinuar primero debe seleccionar un heroe."});
		}else{
			this.mostrarSeleccionHeroe=!this.mostrarSeleccionHeroe;
		}
		return;
	}

	renderizarOpcionSeleccionada(pantalla:string){
		var clase = "";
		if(pantalla == this.pantalla){
			clase = "seleccionado"
		}
		return clase;
	}

    equiparHechizo(indexHechizoEquipar){
        if(this.hechizoSeleccionadoIndex==null){return;}
        this.hechizosEquipados[this.hechizoSeleccionadoIndex] = this.hechizosAprendidos[indexHechizoEquipar]

        //Actualizar SESION -> Jugador:
        var hechizosEquipadosIDs = [];
        for(var i = 0; i < this.hechizosEquipados.length; i++){
            hechizosEquipadosIDs.push(this.hechizosEquipados[i].id);
        }

        console.warn("EQUIPADOS: ",hechizosEquipadosIDs)
        this.appService.setHechizosEquipados(this.estadoApp.jugadorPropioSesionIndex, hechizosEquipadosIDs);
        return;
    }

    

}





