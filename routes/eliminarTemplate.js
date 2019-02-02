var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/', function(req, res, next) { 
    var id_template = req.query.id_template;  
    userModel.eliminarTemplate(id_template,function(error,result){
        if(error){
            res.send(error)
        }
        else{
            res.send(result);
        }
    });
});

module.exports = router;