const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

	//Gestion de Tokens:
    getToken: () => ipcRenderer.sendSync('getToken'),
    setToken: (token) => ipcRenderer.send('setToken',token),

	//Gestion de validación:
    getValidacion: () => ipcRenderer.sendSync('getValidacion'),
    setValidacion: (validacion) => ipcRenderer.sendSync('setValidacion',validacion),

	//Gestión de datos:
    getDatos: () => ipcRenderer.sendSync('getDatos'),
    setDatos: (datosJuego) => ipcRenderer.sendSync('setDatos',datosJuego),
    setModelosDatos: (modelo) => ipcRenderer.sendSync('setModelosDatos',modelo),
    actualizarEstadisticas: (documentos) => ipcRenderer.sendSync('actualizarEstadisticas',documentos),
    getDatosHeroeStat: () => ipcRenderer.sendSync('getDatosHeroeStat'),
    getDatosHeroeHech: () => ipcRenderer.sendSync('getDatosHeroeHech'),
    getDatosEnemigos: () => ipcRenderer.sendSync('getDatosEnemigos'),
    getDatosBuff: () => ipcRenderer.sendSync('getDatosBuff'),
    getDatosObjetos: () => ipcRenderer.sendSync('getDatosObjetos'),
    getDatosAnimaciones: () => ipcRenderer.sendSync('getDatosAnimaciones'),
    getDatosMazmorras: () => ipcRenderer.sendSync('getDatosMazmorras'),
    getDatosParametros: () => ipcRenderer.sendSync('getDatosParametros'),
    getDatosPersonajes: () => ipcRenderer.sendSync('getDatosPersonajes'),
    getDatosPerfil: () => ipcRenderer.sendSync('getDatosPerfil'),

	//Gestión Desarrollador:
    openDesarrollador: () => ipcRenderer.sendSync('desarrollador')

})



