var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/',function(req,res){
    var id_enlace = req.query.id_enlace;
    userModel.deleteEnlaceByIdPortafolio(id_enlace,function(error,result){
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