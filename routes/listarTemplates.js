var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/', function(req, res, next) {   
    var tipo = req.query.tipo;
    if(tipo == 'project'){
        userModel.listarTemplatesProject(req.session.usuario,function(error,result){
            if(error){
                res.send(error)
            }
            else{
                res.send(result);
            }
        });
    } else if (tipo == 'portafolio'){
        userModel.listarTemplatesPortafolio(req.session.usuario,function(error,result){
            if(error){
                res.send(error)
            }
            else{
                res.send(result);
            }
        });
    } else {
        userModel.listarTemplates(req.session.usuario,function(error,result){
            if(error){
                res.send(error)
            }
            else{
                res.send(result);
            }
        });
    }
});

module.exports = router;