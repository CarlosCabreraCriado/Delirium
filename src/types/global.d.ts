export interface IElectronAPI {
  //Gestion de Tokens:
  getToken: () => Promise<string>,
  setToken: (token:string) => Promise<void>,

  //Gestion de Cuenta:
  getCuenta: () => Promise<any>,
  setCuenta: (any) => Promise<void>,

  //Gestion de Perfil:
  getPerfil: () => Promise<any>,
  setPerfil: (any) => Promise<void>,

  //Gestion de datos:
  getDatosJuego: () => Promise<any>,
  setDatosJuego: (datos:any) => Promise<void>,
  setEventos: (datos:any) => Promise<void>,

  getDatosClases: () => Promise<any>,
  getDatosObjetos: () => Promise<any>,
  getDatosPerks: () => Promise<any>,
  getDatosHechizos: () => Promise<any>,
  getDatosBuff: () => Promise<any>,
  getDatosAnimaciones: () => Promise<any>,
  getDatosEnemigos: () => Promise<any>,
  getDatosEventos: () => Promise<any>,
  getDatosMisiones: () => Promise<any>,
  getDatosParametros: () => Promise<any>,

  //Gestion de desarrollador:
  openDesarrollador: () => Promise<void>
}


//Tipos Objetos:
export type TipoEquipo = "Pesada"|"Media"|"Ligera"|"Arma una mano"|"Arma dos manos"|"Escudo";
export type TipoPieza = "Casco"|"Pechera"|"Pantalón"|"Botas"|"Báculo"|"Arco"|"Daga"|"Espada"|"Hacha"|"Maza"|"Lanza"|"Miscelaneo";
export type TipoRareza = "Común"|"Poco Común"|"Raro"|"Épico"|"Legendario";
export type TipoConsumible = "Poción"|"Comida"|"Otro";

//Tipos Hechizos:
export type TipoDaño = "Físico"|"Mágico";
export type TipoTarget = "EU"|"AU"|"AL"|"EM"|"AM";

//Tipos Buff:
export type TipoBuff = "Ventaja"|"Desventaja";

//Tipos Mision:
export type TipoMision = "Principal"|"Secundaria";
export type TipoObjetivo = "Cuenta"|"Booleano";

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
