var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/',function(req,res){
    userModel.crearEnlacesDesdeTemplate(req.body,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;