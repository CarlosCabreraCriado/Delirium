
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppComponent} from './app.component';

//Declaración de componentes:
import { IndexComponent } from './comun/index/index.component';
import { MazmorraComponent } from './comun/mazmorra/mazmorra.component';
import { DesarrolladorComponent } from './comun/desarrollador/desarrollador.component';
import { InMapComponent } from './comun/inmap/inmap.component';

const routes: Routes = [
	{path: '' ,redirectTo: "/index", pathMatch: "full" },
	{path: 'index',component: IndexComponent},
	{path: 'mazmorra', redirectTo: "/mazmorra", pathMatch: "full"},
	{path: 'mazmorra', component: MazmorraComponent},
	{path: 'desarrollador', redirectTo: "/desarrollador", pathMatch: "full"},
	{path: 'desarrollador', component: DesarrolladorComponent},
	{path: 'inmap', redirectTo: "/inmap", pathMatch: "full"},
	{path: 'inmap', component: InMapComponent}
   
	];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})

export class AppRoutingModule { }
