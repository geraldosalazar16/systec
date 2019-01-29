var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js');
var moment = require('moment');

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
    var id_usuario = req.session.usuario;

    
    var id_proyecto_primavera = req.body['id_proyecto_primavera'];
    var enlaces = req.body['enlaces'];
    var factor_duracion = req.body['factor_duracion'];

    var actividades = Array(); 
    //var activity_code_types;
    //var activity_codes;
    var codigos = Array(); //Aca va la relación entre actividad y codigo
    var wbs = Array();

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
        for(var i = 0;i<actividades.length;i++){
            var id_actividad = actividades[i].ObjectId;
            //var id_proyecto = actividades[i].ProjectId;
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
                var id_activity_code_type = 0;
                var nombre_columna_p6 = '';
                var valor_columna_p6 = 0;
                if(enlaces[j]['tipo_columna_primavera'] == 'activity_code_type'){
                    
                    //Aca capturo el ID del activity_code_type
                    id_activity_code_type = enlaces[j]['id_columna_primavera'];
                    var codigo_obtenido = codigos.find(function(element,index,array){
                        return (element.ActivityObjectId == id_actividad && element.ActivityCodeTypeObjectId == id_activity_code_type)
                    });
                   if(codigo_obtenido){
                        nombre_columna = codigo_obtenido.ActivityCodeTypeName;
                        if(typeof(codigo_obtenido.ActivityCodeValue) == 'object'){
                            valor_columna_p6 = '0';
                        }
                        else{
                            valor_columna_p6 = codigo_obtenido.ActivityCodeValue;
                        }
                    }
                    else
                        valor_columna_p6 = 'Not assigned';
                } else if(enlaces[j]['tipo_columna_primavera'] == 'FIJA') {
                    nombre_columna_p6 = enlaces[j]['columna_primavera'];
                    //Debo verificar que el valor de la actividad sea un primitivo
                    //Esto no se cumple para las fechas ya que vienen como objeto
                    if(typeof(actividades[i][nombre_columna_p6]) == 'object'){
                        if(nombre_columna_p6.includes('Date') || nombre_columna_p6.includes('date')){
                            var fecha = moment(actividades[i][nombre_columna_p6]);
                            valor_columna_p6 = fecha.format('YYYY-MM-DDTHH:MM:SS');
                        }
                        else{
                            valor_columna_p6 = '0';
                        }
                    }
                    else{
                        //Validar que si es WBS que se guarde el nombre y no el ID
                        if(nombre_columna_p6 == 'WBSObjectId'){
                            var wbsObjectId = actividades[i][nombre_columna_p6];
                            //Buscar el nombre asociado a este wbsObjectId
                            wbs.forEach(element => {
                                if(element['ObjectId'] == wbsObjectId){
                                    valor_columna_p6 = element['Name'];
                                }
                            });
                        }
                        else if(nombre_columna_p6.includes('Duration') || nombre_columna_p6.includes('duration')){
                            valor_columna_p6 = actividades[i][nombre_columna_p6]/factor_duracion;
                        }
                        else{
                            valor_columna_p6 = actividades[i][nombre_columna_p6];
                        }
                    }
                } else if(enlaces[j]['tipo_columna_primavera'] == 'udf'){
                    id_udf_type = enlaces[j]['id_columna_primavera'];
                    var tipo_dato = enlaces[j]['tipo_dato'];
                    var udf_obtenido = udfs.find(function(element,index,array){
                        return (element.ProjectObjectId == id_proyecto_primavera && element.UDFTypeObjectId == id_udf_type && element.ForeignObjectId == id_actividad)
                    });
                   if(udf_obtenido){
                        nombre_columna = udf_obtenido.UDFTypeTitle;
                        if(udf_obtenido.UDFTypeDataType == "Cost"){
                            if(typeof(udf_obtenido.Cost) == 'object'){
                                valor_columna_p6 = '0';
                            }
                            else{
                                valor_columna_p6 = udf_obtenido.Cost;
                            }
                        } else if(udf_obtenido.UDFTypeDataType == "Double"){
                            if(typeof(udf_obtenido.Double) == 'object'){
                                valor_columna_p6 = '0';
                            }
                            else{
                                valor_columna_p6 = udf_obtenido.Double;
                            }
                        } else if(udf_obtenido.UDFTypeDataType == "Indicator"){
                            if(typeof(udf_obtenido.Indicator) == 'object'){
                                valor_columna_p6 = '0';
                            }
                            else{
                                valor_columna_p6 = udf_obtenido.Indicator;
                            }
                        } else if(udf_obtenido.UDFTypeDataType == "Integer"){
                            if(typeof(udf_obtenido.Integer) == 'object'){
                                valor_columna_p6 = '0';
                            }
                            else{
                                valor_columna_p6 = udf_obtenido.Integer;
                            }
                        } else if(udf_obtenido.UDFTypeDataType == "Finish Date"){
                            var fecha = moment(udf_obtenido.FinishDate);
                            valor_columna_p6 = fecha.format('YYYY-MM-DDTHH:MM:SS');
                        } else if(udf_obtenido.UDFTypeDataType == "Start Date"){
                           var fecha = moment(udf_obtenido.StartDate);
                           valor_columna_p6 = fecha.format('YYYY-MM-DDTHH:MM:SS');
                        } else if(udf_obtenido.UDFTypeDataType == "Text"){
                            if(typeof(udf_obtenido.Text) == 'object'){
                                valor_columna_p6 = '';
                            }
                            else{
                                valor_columna_p6 = udf_obtenido.Text;
                            }
                        }                     
                    } else {
                        if(tipo_dato.includes('Date')){
                            valor_columna_p6 = '0';
                        } else if(tipo_dato == 'Text' || tipo_dato == 'Indicator'){
                            valor_columna_p6 = '';
                        } else {
                            valor_columna_p6 = '0';
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
                        } else if(enlace.tipo_filtro == 'Bigger than'){
                            var valor_filtro = enlace.valor_filtro;
                            var valor_celda = cell['value'];
                            if(parseFloat(valor_filtro) < parseFloat(valor_celda)){
                                resultado = 1;
                            } else {
                                resultado = 0;
                            }
                        } else if(enlace.tipo_filtro == 'Smaller than'){
                            var valor_filtro = enlace.valor_filtro;
                            var valor_celda = cell['value'];
                            if(parseFloat(valor_filtro) > parseFloat(valor_celda)){
                                resultado = 1;
                            } else {
                                resultado = 0;
                            }
                        } else if(enlace.tipo_filtro == 'Equal to'){
                            var valor_filtro = enlace.valor_filtro;
                            var valor_celda = cell['value'];
                            if(enlace.tipo_dato == 'Cost' || enlace.tipo_dato == 'Number' || enlace.tipo_dato == 'Double' || enlace.tipo_dato == 'Integer'){
                                valor_filtro = parseFloat(valor_filtro);
                                valor_celda = parseFloat(valor_celda);
                            }                            
                            if(valor_filtro == valor_celda){
                                resultado = 1;
                            } else {
                                resultado = 0;
                            }
                        } else if(enlace.tipo_filtro == 'Different from'){
                            var valor_filtro = enlace.valor_filtro;
                            var valor_celda = cell['value'];
                            if(enlace.tipo_dato == 'Cost' || enlace.tipo_dato == 'Number' || enlace.tipo_dato == 'Double' || enlace.tipo_dato == 'Integer'){
                                valor_filtro = parseFloat(valor_filtro);
                                valor_celda = parseFloat(valor_celda);
                            }
                            if(valor_filtro != valor_celda){
                                resultado = 1;
                            } else {
                                resultado = 0;
                            }
                        } else if(enlace.tipo_filtro == 'Between'){                            
                            var valor_filtro = enlace.valor_filtro;
                            var valor_filtro2 = enlace.valor_filtro2;
                            var valor_celda = cell['value'];
                            if(enlace.tipo_dato == 'Cost' || enlace.tipo_dato == 'Number' || enlace.tipo_dato == 'Double' || enlace.tipo_dato == 'Integer'){
                                valor_filtro = parseFloat(valor_filtro);
                                valor_filtro2 = parseFloat(valor_filtro2);
                                valor_celda = parseFloat(valor_celda);
                            }
                            if(valor_filtro < valor_celda && valor_celda < valor_filtro2){
                                resultado = 1;
                            } else {
                                resultado = 0;
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
    async function asyncCall() {
    try{  
        io.emit('progreso',35);
        io.emit('mensaje','Reading WBS from Primavera...');
        wbs = await getWBS(id_proyecto_primavera,id_usuario);
        if(wbs)
            wbs = wbs.WBS;
        else{
            var err = {
                message: 'No WBS found for this project.'
            }
            lugar_error = 'getWBS';
            throw err;
        } 
        io.emit('progreso',45);
        io.emit('mensaje','Reading activities from Primavera...');
        actividades = await getActividades(id_proyecto_primavera,id_usuario);
        if(actividades)
            actividades = actividades.Activity;
        
        io.emit('progreso',55);
        io.emit('mensaje','Reading Codes from Primavera...');
        codigos = await getRelacionesActividadCodigo(id_proyecto_primavera,id_usuario);
        if(codigos.ActivityCodeAssignment)
            codigos = codigos.ActivityCodeAssignment;
        udfs = await primavera.asyncgetUDFsActivities(req.session.usuario);
        if(udfs.UDFValue)
            udfs = udfs.UDFValue;
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
            case 'getWBS': 
                descriptivo_error='There was an error with the WBS for the project selected in this workflow.';
                if(err.message == 'No WBS found for this project.'){
                    sugerencia = 'Check if the project exists';
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
    async function asyncForEach(array, callback) {
        try{
            for (let index = 0; index < array.length; index++) {
                await callback(array[index])
            }
        }
        catch(error){
            console.log(error);
        }
    }
    asyncCall();
});
module.exports = router;