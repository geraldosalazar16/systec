var express = require('express');
var router = express.Router();

var userModel = require('../models/users.js');

const authorizationUrl = 'https://app.smartsheet.com/b/authorize?response_type=code&client_id=14g7rriwn93nerf1kud&scope=WRITE_SHEETS%20READ_SHEETS&state=ExampleString';

router.post('/',function(req, res, next) {
    console.log('Your authorization url: ', authorizationUrl);
    res.send(authorizationUrl);
});

router.get('/',function(req, res, next) {
    const authCode = req.query.code;
    const generated_hash = require('crypto')
       .createHash('sha256')
       .update('w7ay0sl6tj9ksfxvwcy' + "|" + authCode)
       .digest('hex');
    const options = {
       queryParameters: {
           client_id: '14g7rriwn93nerf1kud',
           code: authCode,
           hash: generated_hash
       }
   };
   var smartsheet = require('smartsheet');
   smartsheet.tokens.getAccessToken(options, processToken)
       .then((token) => {
           return res
               .status(200)
               .json(token);
       });
});
module.exports = router;