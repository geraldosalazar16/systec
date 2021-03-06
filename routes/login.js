var express = require('express');
var router = express.Router();

var userModel = require('../models/users.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    userModel.validarUsuario(username,password,function(error,data){
        if(error){
            res.send('error');
        }
        else{
            req.session.usuario = data;
            req.session.autenticado = data.autenticado;
            res.json(req.session);
        }
    });

});
router.get('/',function(req, res, next) {
    res.render('login');
});

module.exports = router;