var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {
    var info = req.body;
    userModel.guardarEnlace(info,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result)
        }
    });
    /*
    userModel.guardarEnlace(element.id,element.id_workflow,element.NOMBRE_P6,element.id_ss,element.id_p6,element.tipo_columna_p6,element.tipo_filtro,element.valor_filtro,element.logica_filtro,element.NOMBRE_SS,element.descripcion,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result)
        }
    });
    */
});

module.exports = router;