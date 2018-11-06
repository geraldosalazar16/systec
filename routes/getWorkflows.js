var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/', function(req, res, next) {
    var id_usuario = req.session.usuario['id'];
    userModel.getWorkflows(id_usuario,function(error,result){
        if(error){
            console.log(error);
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;