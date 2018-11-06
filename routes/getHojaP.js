var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/', function(req, res, next) {
    var id_hp = req.body['id_hp'];
    userModel.getHojaP6(id_hp,function(error,result){
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