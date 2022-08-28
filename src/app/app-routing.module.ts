
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from './app.component';

//Declaración de componentes:
import { DeveloperComponent } from './comun/developer/developer.component';
import { IndexComponent } from './comun/index/index.component';
import { MazmorraComponent } from './comun/mazmorra/mazmorra.component';
import { SalaComponent } from './comun/sala/sala.component';
import { CargarPartidaComponent } from './comun/cargarPartida/cargarPartida.component';
import { HeroesComponent } from './comun/heroes/heroes.component';
import { UnirsePartidaComponent } from './comun/unirsePartida/unirsePartida.component';
import { DesarrolladorComponent } from './comun/desarrollador/desarrollador.component';
import { InMapComponent } from './comun/inmap/inmap.component';

const routes: Routes = [
	{path: '' ,redirectTo: "/index", pathMatch: "full" },
	{path: 'index',component: IndexComponent},
	{path: 'snack',redirectTo: "/index", pathMatch: "full"},
	{path: 'mazmorra', redirectTo: "/mazmorra", pathMatch: "full"},
	{path: 'mazmorra', component: MazmorraComponent},
	{path: 'cargarPartida', redirectTo: "/cargarPartida", pathMatch: "full"},
	{path: 'cargarPartida', component: CargarPartidaComponent},
	{path: 'unirsePartida', redirectTo: "/unirsePartida", pathMatch: "full"},
	{path: 'unirsePartida', component: UnirsePartidaComponent},
	{path: 'sala', redirectTo: "/sala", pathMatch: "full"},
	{path: 'sala', component: SalaComponent},
	{path: 'heroes', redirectTo: "/heroes", pathMatch: "full"},
	{path: 'heroes', component: HeroesComponent},
	{path: 'desarrollador', redirectTo: "/desarrollador", pathMatch: "full"},
	{path: 'desarrollador', component: DesarrolladorComponent},
	{path: 'inmap', redirectTo: "/inmap", pathMatch: "full"},
	{path: 'inmap', component: InMapComponent}

	];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
