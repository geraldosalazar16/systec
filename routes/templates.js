var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session.autenticado){
        res.render('templates');
    }
    else{
        res.redirect('login');
    }
});

module.exports = router;