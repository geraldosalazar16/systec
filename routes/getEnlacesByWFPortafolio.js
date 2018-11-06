var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/',function(req,res){
    var info = {
        id_wf : req.query.id_wf,
        id_hoja_smartsheet : req.query.id_hoja_smartsheet
    };
    
    userModel.getEnlacesByWFPortafolio(info,function(error,result){
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