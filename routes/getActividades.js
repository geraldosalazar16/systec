var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js');

router.get('/', function(req, res, next) {
    var id_proyecto = req.query.id_proyecto;
    primavera.getActividades(id_proyecto,req.session.usuario,function(err,result){
        if(err){
            res.send(err);
        }
        else{
            res.json(result);
        }
    })
});

module.exports = router;