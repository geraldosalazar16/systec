var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/',function(req,res){
    var id_usuario = req.query.id_usuario;
    userModel.deleteUsuario(id_usuario,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;