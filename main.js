
const DEBUG = true;
const MOVIL = false;

//Static Server
const electron = require('electron');
const ipc = require('electron').ipcMain;

const url = require('url');
const path = require('path');

//Inicialización del sistema de almacenamiento local:
var Datastore = require('nedb');
//var db = new Datastore({ filename: 'path/to/datafile', autoload: true });

//Inicialización del sistema de almacenamiento remoto:
var mongoose = require('mongoose');
mongoose.connect('mongodb://deliriumClient:delirium96@ds141633.mlab.com:41633/heroku_27lq85ms',{ useNewUrlParser: true, useUnifiedTopology: true });
var Schema = mongoose.Schema;

//Schema y modelo de HeroeStats:
var heroeStatsModel = mongoose.Model;
var heroeStatsSchema= mongoose.Schema;

heroeStatsSchema = new Schema({
  nombreId: String,
  guerrero: [],
  cruzado: [],
  ingeniero: [],
  cazador: [],
  chronomante: [],
  hechiceroip: [],
  iluminado: [],
  mago_de_sangre: []
});

//Schema y modelo de HeroeHech:
var heroeHechModel = mongoose.Model;
var heroeHechSchema= mongoose.Schema;

heroeHechSchema = new Schema({
  nombreId: String,
  angel_caido: [],
  caballero: [],
  cazador: [] ,
  chronomante: [],
  clerigo: [], 
  cruzado: [],
  enano: [], 
  gladiador: [], 
  hechicero: [],
  ingeniero: [], 
  lich: [], 
  minotauro: [], 
  segador_de_almas: []
});

//Schema y modelo de Enemigos:
var enemigosModel = mongoose.Model;
var enemigosSchema= mongoose.Schema;

enemigosSchema = new Schema({
  nombreId: String,
  enemigos_stats: [],
  enemigos_hechizos: [],
  enemigos_buffos: []
});

//Schema y modelo de HeroeHech:
var buffModel = mongoose.Model;
var buffSchema= mongoose.Schema;

buffSchema = new Schema({
  nombreId: String,
  buff: []
});

//Schema y modelo de Objetos:
var objetosModel = mongoose.Model;
var objetosSchema = mongoose.Schema;

objetosSchema = new Schema({
  nombreId: String,
  equipo: [],
  consumible: []
});

//Schema y modelo animaciones:
var animacionesModel = mongoose.Model;
var animacionesSchema = mongoose.Schema;

animacionesSchema = new Schema({
  nombreId: String,
  animaciones: []
});

//Schema y modelo de Mazmorra Snack:
var mazmorraSnackModel = mongoose.Model;
var mazmorraSnackSchema = mongoose.Schema;

mazmorraSnackSchema = new Schema({
  nombreId: String,
  mazmorraGeneral: [],
  mazmorraSalas: [],
  mazmorraEnemigos: [],
  mazmorraEventos: [],
  mazmorraDialogos: []
});

//Schema y modelo de Guardado Snack:
var guardadoSnackModel = mongoose.Model;
var guardadoSnackSchema = mongoose.Schema;

guardadoSnackSchema = new Schema({
  nombreId: String,
  guardadoGeneral: [],
  guardadoHeroes: [],
  guardadoObjetos: [],
  guardadoObjetosGlobales: [],
  guardadoMisiones: [],
  guardadoInmap: []
});

//Schema y modelo de Mazmorra Dummy:
var mazmorraDummyModel = mongoose.Model;
var mazmorraDummySchema = mongoose.Schema;

mazmorraDummySchema = new Schema({
  nombreId: String,
  mazmorraDummyGeneral: [],
  mazmorraDummySalas: [],
  mazmorraDummyEnemigos: [],
  mazmorraDummyEventos: [],
  mazmorraDummyDialogos: []
});

//Schema y modelo de Guardado Dummy:
var guardadoDummyModel = mongoose.Model;
var guardadoDummySchema = mongoose.Schema;

guardadoDummySchema = new Schema({
  nombreId: String,
  guardadoDummyGeneral: [],
  guardadoDummyHeroes: [],
  guardadoDummyObjetos: [],
  guardadoDummyObjetosGlobales: [],
  guardadoDummyMisiones: [],
  guardadoDummyInmap: []
});

//Schema y modelo de Parametros:
var parametrosModel = mongoose.Model;
var parametrosSchema = mongoose.Schema;

parametrosSchema = new Schema({
  nombreId: String,
  personajes: [],
  atributos: [],
  escalado: []
});

//Schema y modelo de Perfil:
var perfilModel = mongoose.Model;
var perfilSchema = mongoose.Schema;

perfilSchema = new Schema({
  nombreId: String,
  configuracion: [],
  logros: [],
  heroes: [],
  objetos: [],
  objetos_globales: [],
  misiones: [],
  inmap: []
});

//Schema y modelo de Perfil:
var personajesModel = mongoose.Model;
var personajesSchema = mongoose.Schema;

personajesSchema = new Schema({
  nombreId: String,
  personajes: []
});

console.log("INICIANDO")
//Schema y modelo de verificacion de clave
var verificarClaveSchema = new Schema({
  clave: {type: Number,required: true},
  nombre: String,
  apellido: String,
  privilegios: String
}, {collection: 'Claves'});

var verificarClave = mongoose.model('Claves', verificarClaveSchema);

//Schema y modelo de verificacion de actualizacion
var verificarActualizacionSchema = new Schema({
  nombre: String,
  descripcion: String,
  version: Number,
  versionName: String,
  autor: String
}, {collection: 'Delirium'});

var versionDeliriumServidor = mongoose.model('Delirium', verificarActualizacionSchema);

var clave;
var validacion = false;
var version="0.0.1";
var versionDeliriumServidor;
var datosJuego=null;

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
        webSecurity: false,
        nodeIntegration: true}  
    })
  }else{
     mainWindow = new BrowserWindow({
      fullscreen: false,
      width: 1080,
      height: 720,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true}
    })
  }

  //mainWindow.setMenu(null);
  
  // and load the index.html of the app.
  
  if(DEBUG){
    mainWindow.loadURL("http://localhost:4200/cargarPartida");
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
  desarrolladorWindow = new BrowserWindow({width: 1080, height: 700})
  
  if(DEBUG){
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

ipc.on('setModelosDatos', function (event, arg) {
     
  // Definir Schemas de datos si es desarrollador:
  if(validacion.privilegios=="Desarrollador"|| validacion.privilegios=="Creador"){
       
    //Definicion de modelo segun usuario
            
    //Modelo heroeStat
    heroeStatsModel = mongoose.model("heroeStatsModel", heroeStatsSchema,validacion.nombre);
  
    //Modelo heroeHech
    heroeHechModel = mongoose.model("heroeHechModel", heroeHechSchema,validacion.nombre);
  
    //Modelo EnemigosStats
     enemigosModel = mongoose.model("enemigosModel", enemigosSchema,validacion.nombre);
  
    //Modelo Buff
    buffModel = mongoose.model("buffModel", buffSchema,validacion.nombre);
  
    //Modelo Objetos
    objetosModel = mongoose.model("objetosModel", objetosSchema,validacion.nombre);
  
    //Modelo Mazmorra Snack
    mazmorraSnackModel = mongoose.model("mazmorraSnackModel", mazmorraSnackSchema,validacion.nombre);
  
    //Modelo Guardado Snack
    guardadoSnackModel = mongoose.model("guardadoSnackModel", guardadoSnackSchema,validacion.nombre);
  
    //Modelo Mazmorra Dummy
    mazmorraDummyModel = mongoose.model("mazmorraDummyModel", mazmorraDummySchema,validacion.nombre);
  
    //Modelo Guardado Dummy
    guardadoDummyModel = mongoose.model("guardadoDummyModel", guardadoDummySchema,validacion.nombre);
  
    //Modelo Guardado Dummy
    animacionesModel = mongoose.model("animacionesModel", animacionesSchema,validacion.nombre);
            
    //Modelo Parametros
    parametrosModel = mongoose.model("parametrosModel", parametrosSchema,validacion.nombre);
  
    //Modelo Perfil
    perfilModel = mongoose.model("perfilModel", perfilSchema,validacion.nombre);

    //Modelo Personajes
    personajesModel = mongoose.model("personajesModel", personajesSchema,validacion.nombre);

  } //Fin de definicion de modelos segun usuario
        
  event.returnValue = true;
});

ipc.on('comprobarLogin', function (event) {
  event.returnValue = validacion;
});

ipc.on('getValidacion', function (event) {
  event.returnValue = validacion;
});

ipc.on('setValidacion', function (event, arg) {
  validacion = arg; 
  console.log("Validacion: ");
  console.log(validacion);
   
  event.returnValue = validacion;
});

ipc.on('setDatos', function (event, arg) {
  datosJuego = arg; 
  console.log("Datos de Juego: ");
  console.log(datosJuego);
   
  event.returnValue = true;
});

ipc.on('getDatos', function (event, activarDatosOficial) {
    event.returnValue = datosJuego;
});

          //Fin de definicion de modelos segun usuario
        
//*********************************************
//        Gestion de Base de datos
//*********************************************

ipc.on('getDatosHeroeHech', function (event, arg) {
  heroeHechModel.find({nombreId: 'Heroes_Hech'})
      .then(function(doc) {
        console.log("Enviando Estadisticas de Hechizos...");
        event.returnValue = doc[0]._doc;
      });
      
});

ipc.on('getDatosHeroeStat', function (event, arg) {
  heroeStatsModel.find({nombreId: 'Heroes_Stats'})
      .then(function(doc) {
        console.log("Enviando Estadisticas de Stats...");
        console.log(doc[0]._doc);
        event.returnValue = doc[0]._doc;
      });
});

ipc.on('getDatosEnemigos', function (event, arg) {
  enemigosModel.find({nombreId: 'Enemigos'})
      .then(function(doc) {
        console.log("Enviando Estadisticas de Enemigos...");
        event.returnValue = doc[0]._doc;
      });
});

ipc.on('getDatosBuff', function (event, arg) {
  buffModel.find({nombreId: 'Buff'})
      .then(function(doc) {
        console.log("Enviando Estadisticas de Buffos...");
        event.returnValue = doc[0]._doc;
      });
});

ipc.on('getDatosObjetos', function (event, arg) {
  objetosModel.find({nombreId: 'Objetos'})
      .then(function(doc) {
        console.log("Enviando Estadisticas de Objetos...");
        event.returnValue = doc[0]._doc;
      });
});

ipc.on('getDatosAnimaciones', function (event, arg) {
  animacionesModel.find({nombreId: 'Animaciones'})
      .then(function(doc) {
        console.log("Enviando Animaciones...");
        event.returnValue = doc[0]._doc;
      });   
});

ipc.on('getDatosMazmorraSnack', function (event, arg) {
  console.log("Entrando en objetos");
  mazmorraSnackModel.find({nombreId: 'MazmorraSnack'})
      .then(function(doc) {
        console.log("Enviando Mazmorra Snack...");
        event.returnValue = doc[0]._doc;
      });
});

ipc.on('getDatosGuardadoSnack', function (event, arg) {
  guardadoSnackModel.find({nombreId: 'GuardadoSnack'})
      .then(function(doc) {
        console.log("Enviando Guardado Snack...");
        event.returnValue = doc[0]._doc;
      });   
});

ipc.on('getDatosParametros', function (event, arg) {
  parametrosModel.find({nombreId: 'Parametros'})
      .then(function(doc) {
        console.log("Enviando Parametros...");
        event.returnValue = doc[0]._doc;
      });   
});

ipc.on('getDatosPersonajes', function (event, arg) {
  personajesModel.find({nombreId: 'Personajes'})
      .then(function(doc) {
        console.log("Enviando Parametros...");
        event.returnValue = doc[0]._doc;
      });   
});


//*********************************************
//        Panel de desarrollador
//*********************************************

ipc.on("desarrollador", (event, clave) => {
    desarrollador();
    event.returnValue = true;
});


ipc.on("actualizarEstadisticas",function(event,datos){
  if(validacion.privilegios!="Desarrollador"&& validacion.privilegios!="Creador"){
    console.log("PERMISO DENEGADO: No dispone de permisos para subir archivos")
    event.returnValue = false;
  }
  console.log("Actualizando Estadisticas...");
  var actualizarHeroeStats = true;
  var actualizarHeroeHech = true;
  var actualizarEnemigos = true;
  var actualizarBuff = true;
  var actualizarObjetos = true;
  var actualizarMazmorraSnack = true;
  var actualizarGuardadoSnack = true;
  var actualizarMazmorraDummy = true;
  var actualizarGuardadoDummy = true;
  var actualizarAnimaciones = true;
  var actualizarParametros = true;
  var actualizarPerfil = true;
  var actualizarPersonajes = true;

  var documentos = new Array(12);

  datos.forEach(function(element,index){
    switch(element.nombreId){
      case "Heroes_Stats":
      actualizarHeroeStats = false;
      documentos[0]= element;
      break;
      case "Heroes_Hech":
      actualizarHeroeHech = false;
      documentos[1]=element;
      break;
      case "Enemigos":
      actualizarEnemigos = false;
      documentos[2]=element;
      break;
      case "Buff":
      actualizarBuff = false;
      documentos[3]=element;
      break;
      case "Objetos":
      actualizarObjetos = false;
      documentos[4]=element;
      break;
      case "MazmorraSnack":
      actualizarMazmorraSnack = false;
      documentos[5]=element;
      break;
      case "GuardadoSnack":
      actualizarGuardadoSnack = false;
      documentos[6]=element;
      break;
      case "MazmorraDummy":
      actualizarMazmorraDummy = false;
      documentos[7]=element;
      break;
      case "GuardadoDummy":
      actualizarGuardadoDummy = false;
      documentos[8]=element;
      break;
      case "Animaciones":
      actualizarAnimaciones = false;
      documentos[9]=element;
      break;
      case "Parametros":
      actualizarParametros = false;
      documentos[10]=element;
      break;
      case "Perfil":
      actualizarPerfil = false;
      documentos[11]=element;
      break;
      case "Personajes":
      actualizarPersonajes = false;
      documentos[12]=element;
      break;
    }
  });
  
  //*************************
  //  Actualiza Heroes_Stats
  //*************************
  
  if(typeof documentos[0]!="undefined"){

  var dataHeroeStatsModel = new heroeStatsModel(documentos[0]);
  
  heroeStatsModel.deleteOne({nombreId: 'Heroes_Stats'})
    .then(function(producto){
      dataHeroeStatsModel.save().then(function(){
        console.log("Actualizacion de estadisticas Heroe_Stats completo");
        actualizarHeroeStats = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil) && actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });

    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion heroes_stats


  //*************************
  //  Actualiza Heroes_Hech
  //*************************
  if(typeof documentos[1]!="undefined"){
  var dataHeroeHechModel = new heroeHechModel(documentos[1]);
  
  heroeHechModel.deleteOne({nombreId: 'Heroes_Hech'})
    .then(function(producto){
      dataHeroeHechModel.save().then(function(){
        console.log("Actualizacion de estadisticas Heroe_Hech completo");
        actualizarHeroeHech = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });

  } //Fin de actualizacion heroes_hech

  //*************************
  //  Actualiza Enemigos
  //*************************
  if(typeof documentos[2]!="undefined"){
  var dataEnemigosModel = new enemigosModel(documentos[2]);

  enemigosModel.deleteOne({nombreId: 'Enemigos'})
    .then(function(producto){
      dataEnemigosModel.save().then(function(){
        console.log("Actualizacion de estadisticas Enemigos completo");
        actualizarEnemigos = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion Enemigos

  //*************************
  //  Actualiza Buff
  //*************************
  if(typeof documentos[3]!= "undefined"){
  var dataBuff = new buffModel(documentos[3]);

  buffModel.deleteOne({nombreId: 'Buff'})
    .then(function(producto){
      dataBuff.save().then(function(){
        console.log("Actualizacion de estadisticas Buff completo");
        actualizarBuff = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion buff

  //*************************
  //  Actualiza Objetos
  //*************************
  if(typeof documentos[4]!= "undefined"){
  var dataObjetos = new objetosModel(documentos[4]);

  objetosModel.deleteOne({nombreId: 'Objetos'})
    .then(function(producto){
      dataObjetos.save().then(function(){
        console.log("Actualizacion de estadisticas Objetos completo");
        actualizarObjetos = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion objetos

  //*************************
  //  Actualiza MazmorraSnack
  //*************************
  if(typeof documentos[5]!= "undefined"){
  var dataMazmorraSnack = new mazmorraSnackModel(documentos[5]);
  console.log(dataMazmorraSnack);

  mazmorraSnackModel.deleteOne({nombreId: 'MazmorraSnack'})
    .then(function(producto){
      dataMazmorraSnack.save().then(function(){
        console.log("Actualizacion de estadisticas Mazmorra Snack completo");
        actualizarMazmorraSnack = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion MazmorraSnack

  //*************************
  //  Actualiza GuardadoSnack
  //*************************
  if(typeof documentos[6]!= "undefined"){
  var dataGuardadoSnack = new guardadoSnackModel(documentos[6]);

  guardadoSnackModel.deleteOne({nombreId: 'GuardadoSnack'})
    .then(function(producto){
      dataGuardadoSnack.save().then(function(){
        console.log("Actualizacion de estadisticas Guardado Snack completo");
        actualizarGuardadoSnack = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion GuardadoSnack

  //*************************
  //  Actualiza MazmorraDummy
  //*************************
  if(typeof documentos[7]!= "undefined"){
  var dataMazmorraDummy = new mazmorraDummyModel(documentos[7]);

  mazmorraDummyModel.deleteOne({nombreId: 'MazmorraDummy'})
    .then(function(producto){
      dataMazmorraDummy.save().then(function(){
        console.log("Actualizacion de estadisticas Mazmorra Dummy completo");
        actualizarMazmorraDummy = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion MazmorraDummy

  //*************************
  //  Actualiza GuardadoDummy
  //*************************
  if(typeof documentos[8]!= "undefined"){

  var dataGuardadoDummy = new guardadoDummyModel(documentos[8]);

  guardadoDummyModel.deleteOne({nombreId: 'GuardadoDummy'})
    .then(function(producto){
      dataGuardadoDummy.save().then(function(){
        console.log("Actualizacion de estadisticas Guardado Dummy completo");
        actualizarGuardadoDummy = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion GuardadoDummy

  //*************************
  //  Actualiza Animaciones
  //*************************
  if(typeof documentos[9]!= "undefined"){

  var dataAnimaciones = new animacionesModel(documentos[9]);

  animacionesModel.deleteOne({nombreId: 'Animaciones'})
    .then(function(producto){
      dataAnimaciones.save().then(function(){
        console.log("Actualizacion de estadisticas Animaciones completo");
        actualizarAnimaciones = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones)&& (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion Animaciones

  //*************************
  //  Actualiza Parametros
  //*************************
  if(typeof documentos[10]!= "undefined"){

  var dataParametros = new parametrosModel(documentos[10]);

  parametrosModel.deleteOne({nombreId: 'Parametros'})
    .then(function(producto){
      dataParametros.save().then(function(){
        console.log("Actualizacion de Parametros completo");
        actualizarParametros = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones) && (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion Parametros

  //*************************
  //  Actualiza Perfil
  //*************************
  if(typeof documentos[11]!= "undefined"){

  var dataPerfil = new perfilModel(documentos[11]);

  perfilModel.deleteOne({nombreId: 'Perfil'})
    .then(function(producto){
      dataPerfil.save().then(function(){
        console.log("Actualizacion de Perfil completo");
        actualizarPerfil = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones) && (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion Perfil

  //*************************
  //  Actualiza Perfil
  //*************************
  if(typeof documentos[12]!= "undefined"){

  var dataPersonajes = new personajesModel(documentos[12]);

  personajesModel.deleteOne({nombreId: 'Personajes'})
    .then(function(producto){
      dataPersonajes.save().then(function(){
        console.log("Actualizacion de Personajes completo");
        actualizarPersonajes = true;
        if((actualizarBuff && actualizarEnemigos) && (actualizarHeroeHech && actualizarHeroeStats) && (actualizarMazmorraDummy && actualizarMazmorraSnack) && (actualizarGuardadoDummy && actualizarGuardadoSnack) && (actualizarObjetos&&actualizarAnimaciones) && (actualizarParametros&&actualizarPerfil)&& actualizarPersonajes){
          desarrolladorWindow.webContents.send("cambioEstadisticasCompleto");
          event.returnValue = true;
        }
      });
    }).catch(function(error){
      console.log(error);
      event.returnValue = false;
    });
  } //Fin de actualizacion Personajes
});







