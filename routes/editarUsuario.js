var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {
    //var nombre_proyecto = req.body.nombre;    
    userModel.editarUsuario(req.body,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;