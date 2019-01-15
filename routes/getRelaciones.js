var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');
var primavera = require('../models/primavera.js');

router.get('/', function(req, res, next) {
    var id_wf = req.query.id_wf;

    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });

    userModel.getRelaciones(id_wf,function(error,result){
        if(error){
            console.log(error);
            res.send(error)
        }
        else{
            userModel.getWorkflowByID(id_wf,function(error,r1){
                //res.send(result);
                //Buscar el nombre actualizado de la hoja
                // Set options
                var id_hoja = r1[0].ID_HOJA_SMARTSHEET;
                var options = {
                    id: id_hoja // Id of Sheet
                };
                // Get sheet            
                smartsheet.sheets.getSheet(options)
                .then(function(sheetInfo) {
                    var sheet_name = sheetInfo.name;
                    var id_proyecto = r1[0].ID_PROYECTO_PRIMAVERA;
                    
                    //Buscar el nombre del proyecto de primavera
                    primavera.getProyectoByID(id_proyecto,req.session.usuario,function(err,result1){
                        if(err){
                            res.send(err);
                        }
                        else{
                            //res.json(result);
                            var project_name = result1.Project[0].Name;
                            var info = {
                                sheet_name: sheet_name,
                                project_name: project_name,
                                id_wf: id_wf
                            };
                            userModel.updateWorkFlow(info,function(error,result2){
                                if(error){
                                    res.send(error)
                                }
                                else{
                                    //Se envía el resultado de la lectura incial
                                    res.send(result);
                                }
                            });
                        }
                    });
                });
            });
        }
    });
});

module.exports = router;