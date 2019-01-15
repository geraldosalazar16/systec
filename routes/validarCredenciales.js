var express = require('express');
var router = express.Router();

var userModel = require('../models/users.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    var username = req.session.usuario.username
    var password = req.session.usuario.password;

    userModel.validarUsuarioSesion(username,password,function(error,data){
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