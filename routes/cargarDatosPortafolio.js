var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js');
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {
    var io = req.app.io;
    io.emit('progreso',25);
    io.emit('mensaje','Server connected, creating Smartsheet client...');
    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });

    //vgariables que vienen en el request
    var id_hoja = req.body['id_hoja_ss'];
    var enlaces = req.body['enlaces'];
    var id_usuario = req.session.usuario;
    var id_wf = req.body['id_wf'];


    var projects = Array(); 

    //Control de errores
    var lugar_error;

    var primera_fila;

    async function manejar_enlaces(){
    try{
        io.emit('progreso',70);
        io.emit('mensaje','Applying filters...');
        //Recorro todas las filas
        var rows = Array();
        var respuesta = Array();
        //Antes que nada debo insertar las filas que corresponden a los niveles de wbs
        //Esto se pospone se ve muuuuy complicado, es mejor que me expliquen bien como funciona en smartsheet
        /*
        wbs.forEach(element => {
            var row = {
                toTop: true,
                cells: cells
            };
            rows.push(row);
        });
        */
        for(var i = 0;i<projects.length;i++){
            var id_proyecto = projects[i].ObjectId;
            var id_calendario = projects[i].ActivityDefaultCalendarObjectId;
            var factor_duracion = await primavera.asyncgetCalendario(id_calendario,req.session.usuario);
            factor_duracion = factor_duracion.Calendar[0].HoursPerDay;
            //Recorro todas las columnas, en este caso los enlaces
            var cells = Array();
            if(enlaces.length == 0){
                respuesta = {
                    resultado: 'error',
                    descripcion: 'No binds created for this workflow.',
                    message: 'No data loaded into Smartsheet.',
                    sugerencia: 'Create at least one bind for this workflow.'
                };
                res.send(respuesta);
                return 0;
            }
            for(var j = 0;j<enlaces.length;j++){
                var id_columna_ss = enlaces[j]['columna_smartsheet'];
                //Verificar que tipo de columna es
                var id_project_code_type = 0;
                var nombre_columna_p6 = '';
                var valor_columna_p6 = 0;
                if(enlaces[j]['tipo_columna_primavera'] == 'project_code_type'){
                    
                    //Aca capturo el ID del activity_code_type
                    id_project_code_type = enlaces[j]['id_columna_primavera'];
                    var codigo_obtenido = codigos.find(function(element,index,array){
                        return (element.ProjectObjectId == id_proyecto && element.ProjectCodeTypeObjectId == id_project_code_type)
                    });
                   if(codigo_obtenido){
                        nombre_columna = codigo_obtenido.ProjectCodeTypeName;
                        if(typeof(codigo_obtenido.ProjectCodeValue) == 'object'){
                            valor_columna_p6 = '0';
                        }
                        else{
                            valor_columna_p6 = codigo_obtenido.ProjectCodeValue;
                        }
                    }
                    else
                        valor_columna_p6 = 'Not assigned';
                }
                else{
                    nombre_columna_p6 = enlaces[j]['columna_primavera'];
                    //Debo verificar que el valor de la actividad sea un primitivo
                    //Esto no se cumple para las fechas ya que vienen como objeto
                    if(typeof(projects[i][nombre_columna_p6]) == 'object'){
                        if(nombre_columna_p6.includes('Date') || nombre_columna_p6.includes('date')){
                            var fecha = projects[i][nombre_columna_p6]
                            valor_columna_p6 = fecha.toISOString();
                        }
                        else{
                            valor_columna_p6 = '0';
                        }
                    }
                    else{
                        if(nombre_columna_p6.includes('Duration') || nombre_columna_p6.includes('duration')){
                            var valor_en_horas = projects[i][nombre_columna_p6];
                            valor_columna_p6 = valor_en_horas/factor_duracion;
                        }
                        else if(nombre_columna_p6.includes('Cost') || nombre_columna_p6.includes('cost')){
                            var valor = projects[i][nombre_columna_p6];
                            valor_columna_p6 = Number(Math.round(valor+'e'+2)+'e-'+2);
                            //valor_columna_p6 = (Math.round(projects[i][nombre_columna_p6] + "e+2")  + "e-2");
                        }
                        else if(nombre_columna_p6 == 'SummarySchedulePercentComplete'){
                            var valor = projects[i][nombre_columna_p6];
                            valor_columna_p6 = Number(Math.round(valor+'e'+2)+'e-'+2);
                            //valor_columna_p6 = (Math.round(projects[i][nombre_columna_p6] + "e+2")  + "e-2");
                        }
                        else{
                            valor_columna_p6 = projects[i][nombre_columna_p6];
                        }
                    }
                }
                var cell = {
                    columnId: id_columna_ss,
                    value: valor_columna_p6
                };
                if(cell.value == undefined){
                    cell.value = null;
                }
                cells.push(cell);
            }
            //Es necesario validar si la fila cumple con los filtros para ser incluida
            var row = {
                toBottom: true,
                cells: cells
            };
            var and = 1;
            var or = 1;
            row['cells'].forEach(cell => {
                //Buscar el filtro usando el id de columna de ss
                var columna_ss = cell['columnId'];
                var columna_p6;
                
                enlaces.forEach(enlace => {
                    if(enlace.columna_smartsheet == columna_ss){
                        var resultado = 0;
                        if(enlace.tipo_filtro == 'Any'){
                            //Cualquier valor, se incluye la fila
                            resultado = 1;
                        }
                        else if(enlace.tipo_filtro == 'Before'){
                            //Debo convertir los valores a fechas
                            var fecha_celda = new Date(cell['value']);
                            var dia_celda = fecha_celda.getDate();
                            var mes_celda = fecha_celda.getMonth()+1;
                            var anio_celda = fecha_celda.getFullYear();
                            var fecha_celda_aux = mes_celda+'/'+dia_celda+'/'+anio_celda;
                            fecha_celda_aux = Date.parse(fecha_celda_aux);
                            var fecha_filtro = Date.parse(enlace.valor_filtro);
                            if(fecha_celda_aux < fecha_filtro){
                                resultado = 1;
                            }
                        }
                        else if(enlace.tipo_filtro == 'After'){
                            //Debo convertir los valores a fechas
                            var fecha_celda = new Date(cell['value']);
                            var dia_celda = fecha_celda.getDate();
                            var mes_celda = fecha_celda.getMonth()+1;
                            var anio_celda = fecha_celda.getFullYear();
                            var fecha_celda_aux = mes_celda+'/'+dia_celda+'/'+anio_celda;
                            fecha_celda_aux = Date.parse(fecha_celda_aux);
                            var fecha_filtro = Date.parse(enlace.valor_filtro);
                            if(fecha_celda_aux > fecha_filtro){
                                resultado = 1;
                            }
                        }
                        else if(enlace.tipo_filtro == 'Equal'){
                            if(enlace.valor_filtro == 'All'){
                                resultado = 1;
                            }
                            else{
                                //Para el caso de fechas
                                //Debo convertir los valores a fechas
                                var fecha_celda = new Date(cell['value']);
                                var dia_celda = fecha_celda.getDate();
                                var mes_celda = fecha_celda.getMonth()+1;
                                var anio_celda = fecha_celda.getFullYear();
                                var fecha_celda_aux = mes_celda+'/'+dia_celda+'/'+anio_celda;
                                fecha_celda_aux = Date.parse(fecha_celda_aux);
                                var fecha_filtro = Date.parse(enlace.valor_filtro);
                                if(fecha_celda_aux == fecha_filtro){
                                    resultado = 1;
                                }
                                //Para el caso de ActivityCodes
                                if(cell['value'] == enlace.valor_filtro){
                                    resultado = 1;
                                }
                            }
                        }
                        else if(enlace.tipo_filtro == 'Range'){
                            var valor_filtro = enlace.valor_filtro.split(' ');
                            var fecha1_filtro = valor_filtro[0];
                            fecha1_filtro = Date.parse(fecha1_filtro);
                            var fecha2_filtro = valor_filtro[2];
                            fecha2_filtro = Date.parse(fecha2_filtro);

                            var fecha_celda = new Date(cell['value']);
                            var dia_celda = fecha_celda.getDate();
                            var mes_celda = fecha_celda.getMonth()+1;
                            var anio_celda = fecha_celda.getFullYear();
                            var fecha_celda_aux = mes_celda+'/'+dia_celda+'/'+anio_celda;
                            fecha_celda_aux = Date.parse(fecha_celda_aux);

                            if(fecha_celda_aux >= fecha1_filtro && fecha_celda_aux <= fecha2_filtro){
                                resultado = 1;
                            }
                        }
                        else{
                            resultado = 1;
                        }

                        if(enlace.logica_filtro == 'Inclusive'){
                            and = and&&resultado;
                        }
                        else{
                            or = or||resultado;
                        }
                    }
                });
            });
            if(and&&or){
                rows.push(row);     
            } 
        }
        io.emit('progreso',80);
        io.emit('mensaje',rows.length+' rows to insert into Smartsheet, loading...');
        var options_row = {
            sheetId: id_hoja,
            body: rows
        };
        var newRows = await agregarFilas(options_row);
        io.emit('progreso',95);
        io.emit('mensaje','Data loaded into Smartsheet! Finishing...');
        if(primera_fila){
            var options = {
                sheetId: id_hoja,
                rowId: primera_fila
            };
            await eliminarFila(options);
        }
        respuesta = {
            resultado: 'ok',
            message: newRows.result.length
        };
        res.send(respuesta);
    }
    catch(err){
        var descriptivo_error;
        var sugerencia;
        switch(lugar_error){
            case 'agregarFilas': 
                descriptivo_error='There was an error while loading the information into Smartsheet.';
                sugerencia = 'Possibly missing column in Smartsheet.';
            break;
        }
        var error = {
            resultado: 'error',
            descripcion: descriptivo_error,
            message: err.message,
            sugerencia: sugerencia
        }
        res.send(error);
    }
    }
    function agregarFilas(options){
        return new Promise((resolve,reject) => {
            smartsheet.sheets.addRows(options)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'agregarFilas';
                reject(error)
            })
        });
    }
    function eliminarFila(options){
        return new Promise((resolve,reject) => {
            smartsheet.sheets.deleteRow(options)
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }
    function leerHoja(id_hoja) {
        var options = {
            id: id_hoja
        };
        return new Promise((resolve,reject) => {
            smartsheet.sheets.getSheet(options)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'getSheet';
                reject(error)
            })
        });
    }

    function eliminar(id_hoja,rowIds) {
        var options = {
            sheetId: id_hoja,
            rowId: rowIds
        };
        return new Promise((resolve,reject) => {
            smartsheet.sheets.deleteRow(options)
            .then((result) => resolve(result))
            .catch((error) => reject(error));
        });
    }
    function getWBS(id_proyecto_primavera,id_usuario){
        return new Promise((resolve,reject) => {
            primavera.asyncgetWBS(id_proyecto_primavera,id_usuario)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'getWBS';
                reject(error)
            })
        });
    }
    function getActividades(id_proyecto_primavera,id_usuario){
        return new Promise((resolve,reject) => {
            primavera.asyncgetActividades(id_proyecto_primavera,id_usuario)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'getActividades';
                reject(error)
            })
        });
    }
    function getProjects(id_usuario){
        return new Promise((resolve,reject) => {
            primavera.asyncgetProyectos(id_usuario)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'getProjects';
                reject(error)
            })
        });
    }
    function getRelacionesActividadCodigo(id_proyecto_primavera,id_usuario){
        return new Promise((resolve,reject) => {
            primavera.asyncgetRelacionesActividadCodigo(id_proyecto_primavera,id_usuario)
            .then((result) => resolve(result))
            .catch((error) => {
                lugar_error = 'getRelacionesActividadCodigo';
                reject(error)
            })
        });
    }
    function actualizarWF(id_wf){
        return new Promise((resolve,reject) => {
            userModel.getWorkflowByIDP(id_wf,function(error,result){
                if(error){
                    console.log(error);
                    reject(error)
                }
                else{
                    //res.send(result);
                    //Buscar el nombre actualizado de la hoja
                    // Set options
                    var id_hoja = result[0].ID_HOJA_SMARTSHEET;
                    var options = {
                        id: id_hoja // Id of Sheet
                    };
                    // Get sheet            
                    smartsheet.sheets.getSheet(options)
                    .then(function(sheetInfo) {
                        var sheet_name = sheetInfo.name;
                        
                        var info = {
                            sheet_name: sheet_name,
                            id_wf: id_wf
                        };
                        userModel.updateWorkFlowP(info,function(error,result2){
                            if(error){
                                reject(error)
                            }
                            else{
                                //Se envía el resultado de la lectura incial
                                resolve(result);
                            }
                        });
                    })
                    .catch(function(error) {
                        reject(error);
                    });
                }
            });
        });
    }
    async function asyncCall() {
    try{  
        await actualizarWF(id_wf);
        io.emit('progreso',35);
        io.emit('mensaje','Reading Projects from primavera...');
        projects = await primavera.asyncgetProyectos(id_usuario);
        if(projects)
            projects = projects.Project;
        else{
            var err = {
                message: 'No projects found for this Primavera environment.'
            }
            lugar_error = 'getProjects';
            throw err;
        } 
        io.emit('progreso',55);
        io.emit('mensaje','Reading Codes form Primavera...');
        codigos = await primavera.asyncgetRelacionProyectosCodigos(id_usuario);
        if(codigos.ProjectCodeAssignment)
            codigos = codigos.ProjectCodeAssignment;

        io.emit('progreso',60);
        io.emit('mensaje','Loading sheet...');
        var sheetInfo = await leerHoja(id_hoja);
        //Recorro toda la hoja
        var filas = sheetInfo.rows.length;
        //Almacenar Id de la primera fila para us posterior borrado
        var rowIds;
        if(filas > 0){
            primera_fila = sheetInfo.rows[0].id;
        }
        //Eliminar todas las filas existentes
        if(filas > 1){
            io.emit('mensaje','Clearing your sheet, deleting '+filas+' rows...');
            //Empezar en 1 para conservar la primera fila ya que esta tiene las fórmulas
            var paquetes = Array();
            var posicion_paquete = 0;
            var reinicio = 1;
            var cont = 1;
            for(var a = 1;a<filas;a++){
                if(reinicio == 1){
                    rowIds = sheetInfo.rows[a].id;
                    reinicio = 0;
                }
                else{
                    rowIds += ','+sheetInfo.rows[a].id;
                }
                cont++;
                if(cont == 200){
                    paquetes[posicion_paquete] = rowIds;
                    posicion_paquete++;
                    reinicio = 1;
                    cont = 0;
                }
            }
            var residuo_filas = filas%200;
            if(residuo_filas != 0){
                paquetes[posicion_paquete] = rowIds;
            }
            for (let index = 0; index < paquetes.length; index++) {
                io.emit('mensaje',(index+1)*200+' rows deleted');
                var result = await eliminar(id_hoja,paquetes[index]);
                //console.log(res);
            }
            //asyncForEach(paquetes,eliminar);
        }
        manejar_enlaces();
    }
    catch(err){
        var descriptivo_error;
        var sugerencia;
        switch(lugar_error){
            case 'getSheet': 
                descriptivo_error='There was an error with the selected sheet for this workflow.';
                if(err.message == 'Not Found'){
                    sugerencia = 'Create a new workflow with an existing sheet';
                }
                break;
            case 'getProjects': 
                descriptivo_error='There was an error while reading the projects of this workflow.';
                if(err.message == 'No projects found for this primavera environment.'){
                    sugerencia = 'Check if the projects exists';
                }
                break;
            case 'agregarFilas': 
                descriptivo_error='There was an error while loading the information into Smartsheet.';
                sugerencia = 'Possibly missing column in Smartsheet.';
                break;
        }
        var error = {
            descripcion: descriptivo_error,
            message: err.message,
            sugerencia: sugerencia
        }
        res.send(error);
    }
    }
    asyncCall();
});
module.exports = router;