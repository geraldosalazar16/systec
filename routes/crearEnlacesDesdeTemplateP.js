var express = require('express');
var router = express.Router();
var userModel = require('../models/users.js');

router.post('/',function(req,res){
    userModel.crearEnlacesDesdeTemplateP(req.body)
    .then(result => res.send(result))
    .catch(err => res.send(error));
});

module.exports = router;