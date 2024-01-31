
//DETERMINA SI ES DESARROLLO O PRODUCCION:
//
//        MODOS POSIBLES:
//
// remoteDev: Modo desarrollo con servidor remoto
// localDev: Modo desarrollo con servidor local
// production: Modo produccion

const DEBUG = process.env.NODE_ENV
console.log("MODO EJECUCION: "+DEBUG);

const MOVIL = false;
if(MOVIL){
  console.log("DISPLAY MODE: MOVIL")
}else{
  console.log("DISPLAY MODE: DESKTOP")
}

//Static Server
const electron = require('electron');
const ipc = require('electron').ipcMain;

//electron.commandLine.appendSwitch('ignore-certificate-errors');

const url = require('url');
const path = require('path');

//Inicialización del sistema de almacenamiento local:
console.log("INICIANDO")

//------------------
// DATOS DE JUEGO:
//------------------
var cuenta = null;
var sesion = null;
var cuentaID = null;
var token= null;
var perfil = null;
var mazmorra = null;
var datosJuego=null;

var heroeStat = null; //Pendiente Decomision
var personajes = null; //Pendiente Decomision
var parametros = null; //Pendiente Decomision

var clases = null;
var objetos = null;
var perks = null;
var hechizos = null;
var buff = null;
var animaciones = null;
var enemigos = null;
var eventos = null;
var misiones = null;
var mazmorra = null;
var parametros = null;

var version="0.0.1";
var versionDeliriumServidor;

// Module to control application life.
const app = electron.app
//app.disableHardwareAcceleration();
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

//Eliminar restriccion de autoplay en navegador:
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');

function createWindow () {

  // Create the browser window.
  if(MOVIL){
    mainWindow = new BrowserWindow({
      width: 812,
      height: 375,
      fullscreen: false,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        sandbox: false
        }
    })
  }else{
     mainWindow = new BrowserWindow({
      fullscreen: false,
      width: 1080,
      height: 720,
      webPreferences: {
        webSecurity: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        sandbox: false
        }
    })
  }

  //mainWindow.setMenu(null);

  // and load the index.html of the app.

  if(DEBUG!=="production"){
    mainWindow.loadURL("http://localhost:4200/index.html");
  }else{
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'delirium/index.html'),
      protocol: 'file:',
      slashes: true
    }));
    //mainWindow.webContents.openDevTools();
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function desarrollador() {

  // Create the browser window.
  desarrolladorWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false}
    })

  if(DEBUG!=="production"){
    desarrolladorWindow.loadURL("http://localhost:4200/desarrollador");
  }else{
    desarrolladorWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'delirium/desarrollador.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

    desarrolladorWindow.on('closed', function () {
      desarrolladorWindow= null;
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

//SETTER GETTER (CUENTA)
ipc.on('getCuenta', function (event) {
  event.returnValue = cuenta;
});

ipc.on('setCuenta', function (event, arg) {
  cuenta = arg;
  console.log(cuenta);
  if(arg){
    cuentaID = String(arg._id);
  }else{
    cuentaID = null
  }
  //actualizarModelos();
  console.log("Guardando Cuenta... Done ");
  event.returnValue = cuenta;
});

//SETTER GETTER (SESION)
ipc.on('getSesion', function (event) {
  event.returnValue = sesion;
});

ipc.on('setSesion', function (event, arg) {
  sesion = arg;
  console.log(sesion);
  //actualizarModelos();
  console.log("Guardando Sesion... Done ");
  event.returnValue = sesion;
});

//SETTER GETTER (TOKEN)
ipc.on('getToken', function (event) {
  event.returnValue = token;
});

ipc.on('setToken', function (event, arg) {
  token = arg;
  console.log("Token: ");
  console.log(token);
  event.returnValue = true;
});

//SETTER GETTER (PERFIL)
ipc.on('getPerfil', function (event) {
  event.returnValue = perfil;
});

ipc.on('setPerfil', function (event, arg) {
  perfil = arg;
  console.log("Cargando Perfil");
  console.log(perfil);

  event.returnValue = true;
});

//SETTER GETTER (MAZMORRA)
ipc.on('getMazmorra', function (event) {
  event.returnValue = mazmorra;
});

ipc.on('setMazmorra', function (event, arg) {
  mazmorra = arg;
  console.log("Cargando Mazmorra");
  console.log(mazmorra);

  event.returnValue = true;
});

//SETTER GETTER (DATOS JUEGO)
ipc.on('setDatosJuego', function (event, arg) {
  datosJuego = arg;

  console.log("Datos de Juego: ");
  console.log(datosJuego);

    //Desglose de Datos de Juego:
  for(var i=0; i <datosJuego.length; i++){
    switch(datosJuego[i].nombreId){

      case "Clases":
        clases = datosJuego[i];
      break;
      case "Objetos":
        objetos = datosJuego[i];
      break;
      case "Perks":
        perks = datosJuego[i];
      break;
      case "Hechizos":
        hechizos = datosJuego[i];
      break;
      case "Buff":
        buff = datosJuego[i];
      break;
      case "Animaciones":
        animaciones = datosJuego[i];
      break;
      case "Enemigos":
       enemigos = datosJuego[i];
      break;
      case "Eventos":
       eventos = datosJuego[i];
      break;
      case "Misiones":
       misiones = datosJuego[i];
      break;
      case "Parametros":
        parametros = datosJuego[i];
      break;
    }
  }

  event.returnValue = true;
});

ipc.on('setEventos', function (event, arg) {
    eventos = arg;
    event.returnValue = true;
});

ipc.on('getDatosJuego', function (event, activarDatosOficial) {
    event.returnValue = datosJuego;
});

          //Fin de definicion de modelos segun usuario

//*********************************************
//        Gestion de Base de datos
//*********************************************

ipc.on('getDatosHeroeStat', function (event, arg) {
    event.returnValue = heroeStat;
});

ipc.on('getDatosPersonajes', function (event, arg) {
    event.returnValue = personajes;
});

ipc.on('getDatosParametros', function (event, arg) {
    event.returnValue = parametros;
});

ipc.on('getDatosClases', function (event, arg) {
    event.returnValue = clases;
});

ipc.on('getDatosObjetos', function (event, arg) {
    event.returnValue = objetos;
});

ipc.on('getDatosPerks', function (event, arg) {
    event.returnValue = perks;
});

ipc.on('getDatosHechizos', function (event, arg) {
    event.returnValue = hechizos;
});

ipc.on('getDatosBuff', function (event, arg) {
    event.returnValue = buff;
});

ipc.on('getDatosAnimaciones', function (event, arg) {
    event.returnValue = animaciones;
});

ipc.on('getDatosEnemigos', function (event, arg) {
    event.returnValue = enemigos;
});

ipc.on('getDatosEventos', function (event, arg) {
    event.returnValue = eventos;
});

ipc.on('getDatosMisiones', function (event, arg) {
    event.returnValue = misiones;
});

ipc.on('getDatosParametros', function (event, arg) {
    event.returnValue = parametros;
});

ipc.on('getMazmorra', function (event, arg) {
    event.returnValue = mazmorra;
});

//*********************************************
//        Panel de desarrollador
//*********************************************

ipc.on("desarrollador", (event, clave) => {
    desarrollador();
    event.returnValue = true;
});








