var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {

    var info = {
        id_wf : req.body.id_wf,
        id_usuario: req.session.usuario['id'],
        nombre_workflow : req.body.nombre,
        id_hoja_smartsheet : req.body.id_hoja_smartsheet,
        nombre_hoja_ss : req.body.nombre_hoja_ss,
        comentarios : req.body.comentarios
    };
    userModel.almacenarWorkFlowP(info,function(error,result){
        if(error){
            console.log(error);
            res.send(error)
        }
        else{
            //Devuelvo el id del workflow insertado
            res.send(result);
        }
    });
});

module.exports = router;