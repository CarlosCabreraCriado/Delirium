
import { Component , Input, OnInit } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'panelPersonajeComponent',
  templateUrl: './panel-personaje.component.html',
  styleUrls: ['./panel-personaje.component.sass']
})

export class PanelPersonaje implements OnInit {

	private pantalla = "General";
	private mostrarSeleccionHeroe = false;

	public idImagenHechizo= [5,1,2,3,4];
	public imagenHechHorizontal= [0,0,0,0,0];
	public imagenHechVertical= [0,0,0,0,0];

	//Definicion estadisticas generales:
	private heroeHech: any;
	private heroeStat: any;
	private buff: any;
	private objetos: any;
	private perfil: any
	private personajes: any
	private heroeSeleccionado : any = null;

	constructor(private appService: AppService) {}

	ngOnInit(){

		console.log("Importando Datos de AppService... ")
		this.heroeStat=this.appService.getHeroesStats();
		this.heroeHech=this.appService.getHechizos();
		this.buff=this.appService.getBuff();
		this.objetos=this.appService.getObjetos();
		this.perfil=this.appService.getPerfil();
		this.personajes = this.appService.getPersonajes();
		this.heroeSeleccionado= this.appService.getHeroeSeleccionado();

		//Inicia el renderizado de los sprites de hechizos:
		this.renderizarImagenHechizos();

		//Cargar Descripciones de personaje:
		console.log(this.personajes)
		console.log(this.perfil)
		for(var i= 0; i<this.perfil.heroes.length; i++){ 
			this.perfil.heroes[i]["descripcion"] = this.personajes["personajes"].find(j=>j.clase==this.perfil.heroes[i].clase.toLowerCase())["descripcion"]
		}

		console.log("HEROES:")
		console.log(this.perfil)

		return;
	}

	cambiarPantalla(pantalla:string){
		this.pantalla=pantalla;
		return;	
	}

	renderizarImagenHechizos(){

		if(this.heroeSeleccionado==null){
			this.idImagenHechizo= [1,1,1,1,1];
			return;
		}	

        for(var i=0; i< 5; i++){
			this.idImagenHechizo[i] = this.heroeHech[this.heroeSeleccionado.clase.toLowerCase()][i].imagen_id;
		}

		//Inicializando parametros de visualización de Sprites
		var indexHorizontal=0;
		var indexVertical= 0;

        for(var i=0; i< 5; i++){
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

	seleccionarHeroe(index){
		this.heroeSeleccionado = this.perfil.heroes[index];

		//Añadir parametros al heroe:
		this.heroeSeleccionado["descripcion"] = this.personajes["personajes"].find(i=>i.clase==this.heroeSeleccionado.clase.toLowerCase())["descripcion"]

		this.heroeSeleccionado["idImagen"] = this.perfil.heroes[index].idImagen; 

		console.log("HEROE SELECCIONADO");
		console.log(this.heroeSeleccionado);

		this.appService.setHeroeSeleccionado(this.perfil.heroes[index])
		this.renderizarImagenHechizos();
		this.mostrarSeleccionHeroe=false;
	}

	renderizarOpcionSeleccionada(pantalla:string){
		var clase = "";
		if(pantalla == this.pantalla){
			clase = "seleccionado"
		}
		return clase;
	}

}





