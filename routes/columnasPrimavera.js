var express = require('express');
var router = express.Router();
var soap = require('soap');
var userModel = require('../models/users.js');
var url = require('../models/url.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    var id_proyecto = req.query.id_proyecto;
    userModel.getColumnasP6(function(error,data){
        if(error){
            console.log(error)
            res.send('error');
        }
        else{            
            res.json(data);
        }
    });

});

module.exports = router;