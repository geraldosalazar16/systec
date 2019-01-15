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
    
    userModel.getWorkflowById(id_wf,function(error,result){
        if(error){
            console.log(error);
            res.send(error)
        }
        else{
            //res.send(result);
            //Buscar el nombre actualizado de la hoja
            // Set options
            var id_hoja = result.ID_HOJA_SMARTSHEET;
            var options = {
                id: id_hoja // Id of Sheet
            };
            // Get sheet
            var sheet_name;
            smartsheet.sheets.getSheet(options)
            .then(function(sheetInfo) {
                sheet_name = sheetInfo.name;
            })
            .catch(function(error) {
                res.send(error);
            });
            var id_proyecto = result.ID_PROYECTO_PRIMAVERA;
            var project_name;
            //Buscar el nombre del proyecto de primavera
            primavera.getProyectoByID(id_proyecto,req.session.usuario,function(err,result){
                if(err){
                    res.send(err);
                }
                else{
                    //res.json(result);
                    project_name = result.Name;
                }
            });
            var info = {
                sheet_name: sheet_name,
                project_name: project_name,
                id_wf: id_wf
            };
            userModel.updateWorkFlow(info,function(error,result){
                if(error){
                    res.send(error)
                }
                else{
                    res.send(result);
                }
            });
        }
    });
});

module.exports = router;