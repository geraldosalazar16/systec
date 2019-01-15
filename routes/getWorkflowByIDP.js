var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/',function(req,res){
    var id_wf = req.query.id_wf;

    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });
    
    userModel.getWorkflowByIDP(id_wf,function(error,result){
        if(error){
            console.log(error);
            res.send(error)
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
                        res.send(error)
                    }
                    else{
                        //Se envía el resultado de la lectura incial
                        res.send(result);
                    }
                });
            })
            .catch(function(error) {
                res.send(error);
            });
        }
    });
});

module.exports = router;