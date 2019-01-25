var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var cookieParser = require('cookies');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');

var index = require('./routes/index');
var users = require('./routes/users');
var leer_hoja = require('./routes/leer_hoja');
var cargar_hoja = require('./routes/cargar_hoja');
var login = require('./routes/login');
var loginSmartsheet = require('./routes/loginSmartsheet');
var main = require('./routes/main');
var mainP = require('./routes/mainP');
var workflows = require('./routes/workflows');
var workflowsP = require('./routes/workflowsP');
var columnasPrimavera = require('./routes/columnasPrimavera');
var columnasPrimaveraP = require('./routes/columnasPrimaveraP');
var columnasSS = require('./routes/columnasSS');
var leerProyectosP6 = require('./routes/leerProyectosP6');
var guardarProyectoP6 = require('./routes/guardarProyectoP6');
var almacenarWorkFlow = require('./routes/almacenarWorkFlow');
var almacenarWorkFlowP = require('./routes/almacenarWorkFlowP');
var getWorkflows = require('./routes/getWorkflows');
var getWorkflowsP = require('./routes/getWorkflowsP');
var getRelaciones = require('./routes/getRelaciones');
var getRelacionesPortafolio = require('./routes/getRelacionesPortafolio');
var getHojaP = require('./routes/getHojaP');
var cargarDatos = require('./routes/cargarDatos');
var cargarDatosPortafolio = require('./routes/cargarDatosPortafolio');
var updateUltimaFechaWF = require('./routes/updateUltimaFechaWF');
var updateUltimaFechaWFP = require('./routes/updateUltimaFechaWFP');
var deleteWorkflow = require('./routes/deleteWorkflow');
var deleteWorkflowP = require('./routes/deleteWorkflowP');
var getWorkflowByID = require('./routes/getWorkflowByID');
var getWorkflowByIDP = require('./routes/getWorkflowByIDP');
var editarProyectoP6 = require('./routes/editarProyectoP6');
var getEnlacesByWF = require('./routes/getEnlacesByWF');
var getEnlacesByWFPortafolio = require('./routes/getEnlacesByWFPortafolio');
var getEnlaceById = require('./routes/getEnlaceById');
var getEnlaceByIdPortafolio = require('./routes/getEnlaceByIdPortafolio');
var almacenarEnlace = require('./routes/almacenarEnlace');
var almacenarEnlacePortafolio = require('./routes/almacenarEnlacePortafolio');
var deleteEnlaceById = require('./routes/deleteEnlaceById');
var deleteEnlaceByIdPortafolio = require('./routes/deleteEnlaceByIdPortafolio');
var getActivityCodeTypesByProjectId = require('./routes/getActivityCodeTypesByProjectId');
var getCalendario = require('./routes/getCalendario');
var getActividades = require('./routes/getActividades');
var getActivityCodes = require('./routes/getActivityCodes');
var getRelacionesActividadCodigo = require('./routes/getRelacionesActividadCodigo');
var cargarDatosPrimavera = require('./routes/cargarDatosPrimavera');
var getUsuarios = require('./routes/getUsuarios');
var guardarUsuario = require('./routes/guardarUsuario');
var getPerfiles = require('./routes/getPerfiles');
var editarUsuario = require('./routes/editarUsuario');
var deleteUsuario = require('./routes/deleteUsuario');
var getHojaSS = require('./routes/getHojaSS');
var getProyectoById = require('./routes/getProyectoById');
var getPortafolio = require('./routes/getPortafolio');
var getListaPosiblesValoresProjectCodes = require('./routes/getListaPosiblesValoresProjectCodes');
var getRelacionProyectosCodigos = require('./routes/getRelacionProyectosCodigos');
var getUDFsAllProjects = require('./routes/getUDFsAllProjects');
var getUDFs = require('./routes/getUDFs');
var credPrimavera = require('./routes/credPrimavera');
var validarCredenciales = require('./routes/validarCredenciales');
var setP6 = require('./routes/setP6');

var app = express();


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// view engine setup
/*
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');
*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'abcdefgh',
  resave: false,
  saveUninitialized: true
}));

//CORS
/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
*/
app.use(cors());

app.use('/', index);
app.use('/users', users);
app.use('/leer', leer_hoja);
app.use('/cargar', cargar_hoja);
app.use('/login', login);
app.use('/loginSmartsheet', loginSmartsheet);
app.use('/main', main);
app.use('/mainP', mainP);
app.use('/workflows', workflows);
app.use('/workflowsP', workflowsP);
app.use('/columnasPrimavera', columnasPrimavera);
app.use('/columnasPrimaveraP', columnasPrimaveraP);
app.use('/columnasSS', columnasSS);
app.use('/leerProyectosP6', leerProyectosP6);
app.use('/guardarProyectoP6', guardarProyectoP6);
app.use('/almacenarWorkFlow', almacenarWorkFlow);
app.use('/almacenarWorkFlowP', almacenarWorkFlowP);
app.use('/getWorkflows', getWorkflows);
app.use('/getWorkflowsP', getWorkflowsP);
app.use('/getRelaciones', getRelaciones);
app.use('/getRelacionesPortafolio', getRelacionesPortafolio);
app.use('/getHojaP', getHojaP);
app.use('/cargarDatos', cargarDatos);
app.use('/cargarDatosPortafolio', cargarDatosPortafolio);
app.use('/updateUltimaFechaWF', updateUltimaFechaWF);
app.use('/updateUltimaFechaWFP', updateUltimaFechaWFP);
app.use('/deleteWorkflow',deleteWorkflow);
app.use('/deleteWorkflowP',deleteWorkflowP);
app.use('/getWorkflowByID',getWorkflowByID);
app.use('/getWorkflowByIDP',getWorkflowByIDP);
app.use('/editarProyectoP6',editarProyectoP6);
app.use('/getEnlacesByWF',getEnlacesByWF);
app.use('/getEnlacesByWFPortafolio',getEnlacesByWFPortafolio);
app.use('/getEnlaceById',getEnlaceById);
app.use('/getEnlaceByIdPortafolio',getEnlaceByIdPortafolio);
app.use('/almacenarEnlace',almacenarEnlace);
app.use('/almacenarEnlacePortafolio',almacenarEnlacePortafolio);
app.use('/deleteEnlaceById',deleteEnlaceById);
app.use('/deleteEnlaceByIdPortafolio',deleteEnlaceByIdPortafolio);
app.use('/getActivityCodeTypesByProjectId',getActivityCodeTypesByProjectId);
app.use('/getCalendario',getCalendario);
app.use('/getActividades',getActividades);
app.use('/getActivityCodes',getActivityCodes);
app.use('/getRelacionesActividadCodigo',getRelacionesActividadCodigo);
app.use('/cargarDatosPrimavera',cargarDatosPrimavera);
app.use('/getUsuarios',getUsuarios);
app.use('/getPerfiles',getPerfiles);
app.use('/guardarUsuario',guardarUsuario);
app.use('/editarUsuario',editarUsuario);
app.use('/deleteUsuario',deleteUsuario);
app.use('/getHojaSS',getHojaSS);
app.use('/getProyectoById',getProyectoById);
app.use('/getPortafolio',getPortafolio);
app.use('/getListaPosiblesValoresProjectCodes',getListaPosiblesValoresProjectCodes);
app.use('/getRelacionProyectosCodigos',getRelacionProyectosCodigos);
app.use('/getUDFsAllProjects',getUDFsAllProjects);
app.use('/getUDFs',getUDFs);
app.use('/credPrimavera',credPrimavera);
app.use('/validarCredenciales',validarCredenciales);
app.use('/setP6',setP6);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});



module.exports = app;
