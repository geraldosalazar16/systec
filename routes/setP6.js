var express = require('express');
var router = express.Router();

var userModel = require('../models/users.js');

/* GET home page. */
router.post('/', function(req, res, next) {
    var usuario_primavera = req.body.usuario_primavera;
    var pwd_primavera = req.body.pwd_primavera;
    var url_primavera = req.body.url_primavera;

    req.session.usuario.usuario_primavera = usuario_primavera;
    req.session.usuario.pwd_primavera = pwd_primavera;
    req.session.usuario.url_primavera = url_primavera;

    res.send('ok');
});

module.exports = router;