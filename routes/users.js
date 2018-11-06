var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.autenticado){
    res.render('users');
  }
  else{
      res.redirect('login');
  }
});

module.exports = router;
