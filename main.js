
const DEBUG = false;
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

//Schema y modelo de HeroeHech:
var heroeHechModel = mongoose.Model;
var heroeHechSchema= mongoose.Schema;

//Schema y modelo de Enemigos:
var enemigosModel = mongoose.Model;
var enemigosSchema= mongoose.Schema;

//Schema y modelo de HeroeHech:
var buffModel = mongoose.Model;
var buffSchema= mongoose.Schema;

//Schema y modelo de Objetos:
var objetosModel = mongoose.Model;
var objetosSchema = mongoose.Schema;

//Schema y modelo animaciones:
var animacionesModel = mongoose.Model;
var animacionesSchema = mongoose.Schema;

//Schema y modelo de Mazmorra Snack:
var mazmorraSnackModel = mongoose.Model;
var mazmorraSnackSchema = mongoose.Schema;

//Schema y modelo de Guardado Snack:
var guardadoSnackModel = mongoose.Model;
var guardadoSnackSchema = mongoose.Schema;

//Schema y modelo de Mazmorra Dummy:
var mazmorraDummyModel = mongoose.Model;
var mazmorraDummySchema = mongoose.Schema;

//Schema y modelo de Guardado Dummy:
var guardadoDummyModel = mongoose.Model;
var guardadoDummySchema = mongoose.Schema;

//Schema y modelo de Parametros:
var parametrosModel = mongoose.Model;
var parametrosSchema = mongoose.Schema;

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

//*********************************************
//        Verificar Clave de usuario
//*********************************************
//Definicion de modelo segun usuario
    
    /* 
          //Modelo heroeHech
          heroeStatsSchema = new Schema({
            nombreId: String,
            guerrero: [],
            caballero: [],
            ingeniero: [],
            cazador: [],
            chronomante: [],
            arcanista: [],
            iluminado: [],
            mago_de_sangre: []
          }, {collection: 'Oficial'});

          heroeStatsModel = mongoose.model("heroeStatsModel", heroeStatsSchema,"Oficial");

          //Modelo heroeHech
          heroeHechSchema = new Schema({
            nombreId: String,
            guerrero: [],
            caballero: [],
            ingeniero: [],
            cazador: [],
            chronomante: [],
            arcanista: [],
            iluminado: [],
            mago_de_sangre: []
          }, {collection: 'Oficial'});

          heroeHechModel = mongoose.model("heroeHechModel", heroeHechSchema,"Oficial");

          //Modelo EnemigosStats
          enemigosSchema = new Schema({
            nombreId: String,
            enemigos_stats: [],
            enemigos_hechizos: []
          }, {collection: 'Oficial'});

          enemigosModel = mongoose.model("enemigosModel", enemigosSchema,"Oficial");

          //Modelo Buff
          buffSchema = new Schema({
            nombreId: String,
            buff: []
          }, {collection: 'Oficial'});

          buffModel = mongoose.model("buffModel", buffSchema,"Oficial");

          //Modelo Objetos
          objetosSchema = new Schema({
            nombreId: String,
            equipo: [],
            consumible: []
          }, {collection: 'Oficial'});

          objetosModel = mongoose.model("objetosModel", objetosSchema,'Oficial');

          //Modelo Animaciones
          animacionesSchema = new Schema({
            nombreId: String,
            animaciones: []
          }, {collection: 'Oficial'});

          animacionesModel = mongoose.model("animacionesModel", animacionesSchema,'Oficial');

          //Modelo Mazmorra Snack
          mazmorraSnackSchema = new Schema({
            nombreId: String,
            mazmorraSnackGeneral: [],
            mazmorraSnackSalas: [],
            mazmorraSnackEnemigos: [],
            mazmorraSnackEventos: [],
            mazmorraSnackDialogos: []
          }, {collection: 'Oficial'});

          mazmorraSnackModel = mongoose.model("mazmorraSnackModel", mazmorraSnackSchema,'Oficial');

          //Modelo Guardado Snack
          guardadoSnackSchema = new Schema({
            nombreId: String,
            guardadoSnackGuardadoSnackGeneral: [],
            guardadoSnackHeroes: [],
            guardadoSnackObjetos: [],
            guardadoSnackObjetosGlobales: [],
            guardadoSnackMisiones: [],
            guardadoSnackInmap: []
          }, {collection: 'Oficial'});

          guardadoSnackModel = mongoose.model("guardadoSnackModel", guardadoSnackSchema,'Oficial');

          //Modelo Mazmorra Dummy
          mazmorraDummySchema = new Schema({
            nombreId: String,
            mazmorraDummyGeneral: [],
            mazmorraDummySalas: [],
            mazmorraDummyEnemigos: [],
            mazmorraDummyEventos: [],
            mazmorraDummyDialogos: []
          }, {collection: 'Oficial'});

          mazmorraDummyModel = mongoose.model("mazmorraDummyModel", mazmorraDummySchema,'Oficial');

          //Modelo Guardado Dummy
          guardadoDummySchema = new Schema({
            nombreId: String,
            guardadoDummyGeneral: [],
            guardadoDummyHeroes: [],
            guardadoDummyObjetos: [],
            guardadoDummyObjetosGlobales: [],
            guardadoDummyMisiones: [],
            guardadoDummyInmap: []
          }, {collection: 'Oficial'});

          guardadoDummyModel = mongoose.model("guardadoDummyModel", guardadoDummySchema,'Oficial');

          //Modelo Guardado Dummy
          parametrosSchema = new Schema({
            nombreId: String,
            parametrosGuerrero: [],
            parametrosCruzado: [],
            parametrosIngeniero: [],
            parametrosCazador: [],
            parametrosChronomante: [],
            parametrosHechicero: [],
            parametrosIluminado: [],
            parametrosMagoDeSangre: [],
            parametrosAtributos: [],
            parametrosEscalado: []
          }, {collection: 'Oficial'});

          parametrosModel = mongoose.model("parametrosModel", parametrosSchema,'Oficial');

          */

ipc.on('verificarClave', function (event, arg) {

  console.log("Validando Clave: "+arg);
  
  verificarClave.find({clave: arg})
      .then(function(doc) {
        if(doc.length==0){
          console.log("Clave incorrecta.");
          event.returnValue = false;
        }

        console.log(doc[0]._doc);
        validacion= doc[0]._doc;
        
        // Definir Schemas de datos si es desarrollador:
        if(validacion.privilegios=="Desarrollador"|| validacion.privilegios=="Creador"){
          //Definicion de modelo segun usuario
          
          //Modelo heroeStat
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
          }, {collection: validacion.nombre});

          heroeStatsModel = mongoose.model("heroeStatsModel", heroeStatsSchema,validacion.nombre);

          //Modelo heroeHech
          heroeHechSchema = new Schema({
            nombreId: String,
            guerrero: [],
            cruzado: [],
            ingeniero: [],
            cazador: [],
            chronomante: [],
            hechicero: [],
            iluminado: [],
            mago_de_sangre: []
          }, {collection: validacion.nombre});

          heroeHechModel = mongoose.model("heroeHechModel", heroeHechSchema,validacion.nombre);

          //Modelo EnemigosStats
          enemigosSchema = new Schema({
            nombreId: String,
            enemigos_stats: [],
            enemigos_hechizos: []
          }, {collection: validacion.nombre});

          enemigosModel = mongoose.model("enemigosModel", enemigosSchema,validacion.nombre);

          //Modelo Buff
          buffSchema = new Schema({
            nombreId: String,
            buff: []
          }, {collection: validacion.nombre});

          buffModel = mongoose.model("buffModel", buffSchema,validacion.nombre);

          //Modelo Objetos
          objetosSchema = new Schema({
            nombreId: String,
            equipo: [],
            consumible: []
          }, {collection: validacion.nombre});

          objetosModel = mongoose.model("objetosModel", objetosSchema,validacion.nombre);

          //Modelo Mazmorra Snack
          mazmorraSnackSchema = new Schema({
            nombreId: String,
            mazmorraGeneral: [],
            mazmorraSalas: [],
            mazmorraEnemigos: [],
            mazmorraEventos: [],
            mazmorraDialogos: []
          }, {collection: validacion.nombre});

          mazmorraSnackModel = mongoose.model("mazmorraSnackModel", mazmorraSnackSchema,validacion.nombre);

          //Modelo Guardado Snack
          guardadoSnackSchema = new Schema({
            nombreId: String,
            guardadoGuardadoSnackGeneral: [],
            guardadoHeroes: [],
            guardadoObjetos: [],
            guardadoObjetosGlobales: [],
            guardadoMisiones: [],
            guardadoInmap: []
          }, {collection: validacion.nombre});

          guardadoSnackModel = mongoose.model("guardadoSnackModel", guardadoSnackSchema,validacion.nombre);

          //Modelo Mazmorra Dummy
          mazmorraDummySchema = new Schema({
            nombreId: String,
            mazmorraDummyGeneral: [],
            mazmorraDummySalas: [],
            mazmorraDummyEnemigos: [],
            mazmorraDummyEventos: [],
            mazmorraDummyDialogos: []
          }, {collection: validacion.nombre});

          mazmorraDummyModel = mongoose.model("mazmorraDummyModel", mazmorraDummySchema,validacion.nombre);

          //Modelo Guardado Dummy
          guardadoDummySchema = new Schema({
            nombreId: String,
            guardadoDummyGeneral: [],
            guardadoDummyHeroes: [],
            guardadoDummyObjetos: [],
            guardadoDummyObjetosGlobales: [],
            guardadoDummyMisiones: [],
            guardadoDummyInmap: []
          }, {collection: validacion.nombre});

          guardadoDummyModel = mongoose.model("guardadoDummyModel", guardadoDummySchema,validacion.nombre);

          //Modelo Guardado Dummy
          animacionesSchema = new Schema({
            nombreId: String,
            animaciones: [],
          }, {collection: validacion.nombre});

          animacionesModel = mongoose.model("animacionesModel", animacionesSchema,validacion.nombre);
          
          //Modelo Parametros
          parametrosSchema = new Schema({
            nombreId: String,
            parametrosGuerrero: [],
            parametrosCruzado: [],
            parametrosIngeniero: [],
            parametrosCazador: [],
            parametrosChronomante: [],
            parametrosHechicero: [],
            parametrosIluminado: [],
            parametrosMagoDeSangre: [],
            parametrosAtributos: [],
            parametrosEscalado: []
          }, {collection: validacion.nombre});

          parametrosModel = mongoose.model("parametrosModel", parametrosSchema,validacion.nombre);

        } //Fin de definicion de modelos segun usuario
        
        event.returnValue = validacion;

      }); 
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

ipc.on('getDatos', function (event) {
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







