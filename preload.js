const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

	//Gestion de Tokens:
    getToken: () => ipcRenderer.sendSync('getToken'),
    setToken: (token) => ipcRenderer.send('setToken',token),

	//Gestion de Cuenta:
    getCuenta: () => ipcRenderer.sendSync('getCuenta'),
    setCuenta: (cuenta) => ipcRenderer.sendSync('setCuenta',cuenta),

	//Gestión de datos:
    getPerfil: () => ipcRenderer.sendSync('getPerfil'),
    setPerfil: (perfil) => ipcRenderer.sendSync('setPerfil',perfil),
    getDatosJuego: () => ipcRenderer.sendSync('getDatosJuego'),
    setDatosJuego: (datosJuego) => ipcRenderer.sendSync('setDatosJuego',datosJuego),
    setEventos: (eventos) => ipcRenderer.sendSync('setEventos',eventos),
    getMazmorra: () => ipcRenderer.sendSync('getMazmorra'),
    setMazmorra: (nombreIdMazmorra) => ipcRenderer.sendSync('setMazmorra',nombreIdMazmorra),

    getDatosClases: () => ipcRenderer.sendSync('getDatosClases'),
    getDatosObjetos: () => ipcRenderer.sendSync('getDatosObjetos'),
    getDatosPerks: () => ipcRenderer.sendSync('getDatosPerks'),
    getDatosHechizos: () => ipcRenderer.sendSync('getDatosHechizos'),
    getDatosBuff: () => ipcRenderer.sendSync('getDatosBuff'),
    getDatosAnimaciones: () => ipcRenderer.sendSync('getDatosAnimaciones'),
    getDatosEnemigos: () => ipcRenderer.sendSync('getDatosEnemigos'),
    getDatosEventos: () => ipcRenderer.sendSync('getDatosEventos'),
    getDatosMisiones: () => ipcRenderer.sendSync('getDatosMisiones'),
    getDatosParametros: () => ipcRenderer.sendSync('getDatosParametros'),

	//Gestión Desarrollador:
    openDesarrollador: () => ipcRenderer.sendSync('desarrollador')

})



