var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js')

router.get('/', function(req, res, next) {
    primavera.getUDFsAllProjects(req.session.usuario,function(err,result){
        if(err){
            res.send(err);
        }
        else{
            res.json(result);
        }
    });
});

module.exports = router;