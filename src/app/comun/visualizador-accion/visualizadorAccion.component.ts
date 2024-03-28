
import { Component , Input } from '@angular/core';

@Component({
  selector: 'visualizadorAccion',
  templateUrl: './visualizadorAccion.component.html',
  styleUrls: ['./visualizadorAccion.component.sass']
})

export class VisualizadorAccionComponent {

  public renderHeroe: any;
  public renderEnemigo: any;
  public modoVisualizador: null | "ataqueEnemigo" | "realizarMovimiento" | "lanzarHechizo" | "movimientoEnemigo"  = null;
  public valorAccion: any = null;
  public mensajeAccion: string = "";
  public mostrarMensajeAccion: boolean = false;
  public ordenActual: number = null;
  public indexHechizo: number = null;

	constructor() {}

  finalizarOrdenPartida(){
    //Desactiva la visualización de la orden:
    this.modoVisualizador = null;
    this.mostrarMensajeAccion = false;
  }

  iniciarOrdenMovimiento(idOrden: number,renderHeroe: any, valorMovimiento: number){
    //Inicia visualización para orden de movimiento:
    this.ordenActual = idOrden;
    this.mensajeAccion = "Movimiento de " + renderHeroe.nombre + ":  " + valorMovimiento + " casillas";
    this.renderHeroe = renderHeroe;
    this.valorAccion = valorMovimiento;
    this.modoVisualizador = "realizarMovimiento";
    this.mostrarMensajeAccion = true;
  }

  iniciarOrdenLanzarHechizo(idOrden: number,renderHeroe: any, indexHechizo: number){
    //Inicia visualización para orden de movimiento:
    this.ordenActual = idOrden;
    this.mensajeAccion = "Lanzando hechizo...";
    this.renderHeroe = renderHeroe;
    this.indexHechizo = indexHechizo;
    this.modoVisualizador = "lanzarHechizo";
    this.mostrarMensajeAccion = true;
  }

  iniciarOrdenAtaqueEnemigo(renderEnemigo: any, renderHeroe: any, valorAccion: number, hechizo_imagen_id: number){
    this.renderHeroe = renderHeroe;
    this.renderEnemigo = renderEnemigo;
    this.valorAccion = valorAccion;
    this.indexHechizo = hechizo_imagen_id;
    this.mensajeAccion = "El enemigo quiere atacar...";
    this.modoVisualizador = "ataqueEnemigo";
    this.mostrarMensajeAccion = true;
  }

  iniciarOrdenMovimientoEnemigo(renderEnemigo: any, renderHeroe: any, valorAccion: number){
    this.renderHeroe = renderHeroe;
    this.renderEnemigo = renderEnemigo;
    this.valorAccion = valorAccion;
    this.mensajeAccion = "El enemigo quiere moverse...";
    this.modoVisualizador = "movimientoEnemigo";
    this.mostrarMensajeAccion = true;

  }

  finalizarActivacionEnemigo(){
    this.modoVisualizador = null;
    this.mostrarMensajeAccion = false;
  }



}





