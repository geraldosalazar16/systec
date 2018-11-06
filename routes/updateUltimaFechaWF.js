var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.get('/', function(req, res, next) {
    var id_wf = req.query.id_wf;
    userModel.updateUltimaFechaWF(id_wf,function(error,result){
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