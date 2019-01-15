var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js');

router.post('/', function(req, res, next) {
    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });
    
    //vgariables que vienen en el request
    var id_hoja = req.body['id_hoja_ss'];
    // Set options
    var options_sheet = {
        id: id_hoja // Id of Sheet
    };
    // Set options
    var options = {
        id: id_hoja // Id of Sheet
    };
    
    var id_proyecto_primavera = req.body['id_proyecto_primavera'];    

    var actividades_primavera = Array(); 
    var activity_code_types = Array();
    var activity_codes = Array();
    var wbs = Array();

    //Control de errores
    var lugar_error;

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
    
    run_main = async function(){
        try{
            actividades_primavera = await getActividades(id_proyecto_primavera,req.session.usuario);
            if(actividades_primavera)
                actividades_primavera = actividades_primavera.Activity;
            else{
                var err = {
                    message: 'No activities found for this project.'
                }
                lugar_error = 'getActividadesP6';
                throw err;
            }

            smartsheet.sheets.getSheet(options)
            .then(function(sheetInfo) {
                //Primero debo determinar el id en smartsheet de las columnas que quiero
                //Status,Actual Start,Actual Finish,Percentage Complete
                
                //var id_status = buscar_id_por_nombre_ss(sheetInfo.columns,'Status');

                var id_actual_start = buscar_id_por_nombre_ss(sheetInfo.columns,'Actual Start');

                var id_actual_finish = buscar_id_por_nombre_ss(sheetInfo.columns,'Actual Finish');
                var id_complete = buscar_id_por_nombre_ss(sheetInfo.columns,'Percent Complete');
                var id_activity_id = buscar_id_por_nombre_ss(sheetInfo.columns,'Activity Id');
                //Recorro todas las actividades de Primavera para obtener el Activity ID
                var actividades_enviar = Array();
                actividades_primavera.forEach(act_primavera => {
                    //Ahora recorro las actividades de Smartsheet para obtener los valores
                    var act_insertar;
                    sheetInfo.rows.forEach(row => {
                        var activity_id = buscar_valor_celda(row.cells,id_activity_id);
                        if(activity_id != 'not found'){
                            if(activity_id == act_primavera.Id){
                                //Una vez que encuentro la actividad en primavera actualizo sus datos
                                //var status = buscar_valor_celda(row.cells,id_status);
                                var actual_start = buscar_valor_celda(row.cells,id_actual_start);
                                var actual_finish = buscar_valor_celda(row.cells,id_actual_finish);
                                var complete = buscar_valor_celda(row.cells,id_complete);
                                if(actual_finish){
                                    act_insertar = {
                                        ObjectId:act_primavera.ObjectId,
                                        //Status: status,
                                        ActualStartDate: actual_start,
                                        ActualFinishDate: actual_finish,
                                        //PercentComplete: complete,
                                    };
                                }
                                else{
                                    act_insertar = {
                                        ObjectId:act_primavera.ObjectId,
                                        //Status: status,
                                        ActualStartDate: actual_start,
                                        ActualFinishDate: actual_finish,
                                        PercentComplete: complete,
                                    };
                                }
                                actividades_enviar.push(act_insertar);
                            }
                        }
                        else{
                            lugar_error = 'readingActivities';
                            var error = {
                                message: 'Column Activity Id not found in Smartsheet'
                            }
                            throw error;
                        }
                    });
                });
                //Ahora paso las actividades a la rutina que hace la insercion en primavera
                primavera.updateActivities(actividades_enviar,req.session.usuario,function(err,result){
                    if(err){
                        lugar_error = 'updatingActivities';
                        var error = {
                            message: err.message
                        }
                    }
                    else{
                        var result = {
                            resultado: 'ok'
                        } 
                        res.send(result);
                    }
                });
            })
            .catch(function(err) {
                var descriptivo_error;
                var sugerencia;
                switch(lugar_error){
                    case 'readingActivities': 
                        descriptivo_error='There was an error while reading activities from Smartsheet.';
                        break;
                    case 'updatingActivities': 
                        descriptivo_error='There was an error while loading activities into Primavera.';
                        break;
                }
                var error = {
                    resultado: 'error',
                    descripcion: descriptivo_error,
                    message: err.message,
                    sugerencia: sugerencia
                }
                res.send(error);
            })
        } 
        catch(err){
            var descriptivo_error;
            var sugerencia;
            switch(lugar_error){
                case 'getActividadesP6': 
                    descriptivo_error='There was an error while loading project information from Primavera.';
                    sugerencia = 'Check if the project exists.';
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

        /*
        try{
            primavera.getActividades(id_proyecto_primavera,req.session.usuario,function(err,result){
                if(err){
                    lugar_error = 'getActividades';
                        var error = {
                            message: err.message
                        }
                        throw error;
                }
                else{
                    if(result && result.Activity)
                        actividades_primavera = result.Activity;
                    else{
                        var error = {
                            message: 'No activities found for the project selected.'
                        }
                        lugar_error = 'getActividades';
                        throw error;
                    } 
                    
                    //Traer las actividades de Smartsheet
                    // Get sheet
                    smartsheet.sheets.getSheet(options)
                    .then(function(sheetInfo) {
                        //Primero debo determinar el id en smartsheet de las columnas que quiero
                        //Status,Actual Start,Actual Finish,Percentage Complete
                        
                        //var id_status = buscar_id_por_nombre_ss(sheetInfo.columns,'Status');
    
                        var id_actual_start = buscar_id_por_nombre_ss(sheetInfo.columns,'Actual Start');
    
                        var id_actual_finish = buscar_id_por_nombre_ss(sheetInfo.columns,'Actual Finish');
                        var id_complete = buscar_id_por_nombre_ss(sheetInfo.columns,'Percent Complete');
                        var id_activity_id = buscar_id_por_nombre_ss(sheetInfo.columns,'Activity Id');
                        //Recorro todas las actividades de Primavera para obtener el Activity ID
                        var actividades_enviar = Array();
                        actividades_primavera.forEach(act_primavera => {
                            //Ahora recorro las actividades de Smartsheet para obtener los valores
                            var act_insertar;
                            sheetInfo.rows.forEach(row => {
                                var activity_id = buscar_valor_celda(row.cells,id_activity_id);
                                if(activity_id != 'not found'){
                                    if(activity_id == act_primavera.Id){
                                        //Una vez que encuentro la actividad en primavera actualizo sus datos
                                        //var status = buscar_valor_celda(row.cells,id_status);
                                        var actual_start = buscar_valor_celda(row.cells,id_actual_start);
                                        var actual_finish = buscar_valor_celda(row.cells,id_actual_finish);
                                        var complete = buscar_valor_celda(row.cells,id_complete);
                                        act_insertar = {
                                            ObjectId:act_primavera.ObjectId,
                                            //Status: status,
                                            ActualStartDate: actual_start,
                                            ActualFinishDate: actual_finish,
                                            PercentComplete: complete,
                                        };
                                        actividades_enviar.push(act_insertar);
                                    }
                                }
                                else{
                                    lugar_error = 'readingActivities';
                                    var error = {
                                        message: 'Column Activity Id not found in Smartsheet'
                                    }
                                    throw error;
                                }
                            });
                        });
                        //Ahora paso las actividades a la rutina que hace la insercion en primavera
                        primavera.updateActivities(actividades_enviar,req.session.usuario,function(err,result){
                            if(err){
                                lugar_error = 'updatingActivities';
                                var error = {
                                    message: err.message
                                }
                            }
                            else{
                                res.send(result);
                            }
                        });
                    })
                    .catch(function(err) {
                        var descriptivo_error;
                        var sugerencia;
                        switch(lugar_error){
                            case 'getActivities': 
                                descriptivo_error='There was an error while loading project information from Primavera.';
                            case 'readingActivities': 
                                descriptivo_error='There was an error while reading activities from Smartsheet.';
                            case 'updatingActivities': 
                                descriptivo_error='There was an error while loading activities into Primavera.';
                        }
                        var error = {
                            resultado: 'error',
                            descripcion: descriptivo_error,
                            message: err.message,
                            sugerencia: sugerencia
                        }
                        res.send(error);
                    })
                }
            });
        }
        catch(err){
            var descriptivo_error;
            var sugerencia;
            switch(lugar_error){
                case 'getActivities': 
                    descriptivo_error='There was an error while loading project information from Primavera.';
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
        */
}
    function buscar_id_por_nombre_ss(columnas,nombre){
        var id = 'not found'
        columnas.some(function(columna,index){
            if(columna.title == nombre){
                id = columna.id;
                return true;
            }
        });
        return id;
    }
    function buscar_valor_celda(celdas,id_columna){
        var valor = 'not found';
        celdas.some(function(celda,index){
            if(celda.columnId == id_columna){
                valor = celda.value;
                return true;
            }
        });
        return valor;
    } 
    run_main();
});
module.exports = router;