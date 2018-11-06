var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {
    var nombre_proyecto = req.body.nombre;
    var id = req.body.id;
    var contenido = req.body.contenido;
    var activity_codes = req.body.activity_codes;
    var activity_code_types = req.body.activity_code_types;
    var factor_duracion = req.body.factor_duracion;
    var wbs = req.body.wbs;    

    var id_usuario = req.session.usuario['id'];

    var info = {
        id_usuario: id_usuario,
        id: id,
        nombre_proyecto: nombre_proyecto,
        contenido: contenido,
        activity_codes: activity_codes,
        activity_code_types: activity_code_types,
        factor_duracion: factor_duracion,
        wbs: wbs
    };
    userModel.editarProyectoP6(info,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;