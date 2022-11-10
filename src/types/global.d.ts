export interface IElectronAPI {
  //Gestion de Tokens:
  getToken: () => Promise<string>,
  setToken: (token:string) => Promise<void>,

  //Gestion de validacion:
  getValidacion: () => Promise<any>,
  setValidacion: (any) => Promise<void>,

  //Gestion de datos:
  getDatos: () => Promise<any>,
  setDatos: (datos:any) => Promise<void>,
  setModelosDatos: (modelo:any) => Promise<void>,
  actualizarEstadisticas: (datos:any) => Promise<boolean>,
  getDatosHeroeStat: () => Promise<any>,
  getDatosHeroeHech: () => Promise<any>,
  getDatosEnemigos: () => Promise<any>,
  getDatosBuff: () => Promise<any>,
  getDatosObjetos: () => Promise<any>,
  getDatosAnimaciones: () => Promise<any>,
  getDatosParametros: () => Promise<any>,
  getDatosPersonajes: () => Promise<any>,
  getDatosPerfil: () => Promise<any>,

  //Gestion de desarrollador:
  openDesarrollador: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
