var express = require('express');
var router = express.Router();

var userModel = require('../models/users.js');

const qs = require('querystring');

const authorizationUri = authorizeURL({
    response_type: 'code',
    client_id: '14g7rriwn93nerf1kud',
    redirect_uri: 'http://localhost:3000/loginSmartsheet',
    scope: 'CREATE_SHEETS WRITE_SHEETS',
});

function authorizeURL(params) {
    const authUrl = 'https://app.smartsheet.com/b/authorize';
    return `${authUrl}?${qs.stringify(params)}`;
}

var http = require('http');

var optionsRequest = {
  host: 'https://api.smartsheet.com/2.0/token',
  method: 'POST'
};

//const authorizationUrl = 'https://app.smartsheet.com/b/authorize?response_type=code&client_id=14g7rriwn93nerf1kud&scope=WRITE_SHEETS%20READ_SHEETS&state=ExampleString';

router.post('/',function(req, res, next) {
    console.log('Your authorization url: ', authorizationUri);
    res.send(authorizationUri);
});

router.get('/',function(req, res, next) {
    var code = req.query.code;

    var crypto = require('crypto');
    // Create hash
    var hash =
    crypto.createHash('sha256')
    .update('w7ay0sl6tj9ksfxvwcy' + '|' + code)
        // ('Your App Secret' + '|' + 'Received Authorization Code')
    .digest('hex');

    // Set options
    var options = {
        queryParameters: {
            client_id: '14g7rriwn93nerf1kud',   // Your App Client ID
            code: code,            // Received Authorization Code
            hash: hash
        },
        contentType: 'application/x-www-form-urlencoded'
    };
    /*
    var req = http.request(optionsRequest, callback);
    //This is the data we are posting, it needs to be a string or a buffer
    var data = 'grant_type=authorization_code&code='+code+'&client_id=1samp48lel5for68you&hash='+hash;
    req.write(data);
    req.end();
    */
    // Get access token
    
    ssclient = require('smartsheet');
    // instantiating the Smartsheet client
    const smartsheet = ssclient.createClient({
        // a blank token provides access to Smartsheet token endpoints
        accessToken: ''
    });

    // Get access token
    smartsheet.tokens.getAccessToken(options)
    .then(function(token) {
        console.log(token);

        
        var ss = ssclient.createClient({
            accessToken: token.access_token,
            logLevel: 'info'
        });
        ss.users.getCurrentUser()
        .then(function(userProfile) {
            console.log(userProfile);
            //Con los datos del usuario debo identificar si ya existe
            userModel.validarUsuarioOAuth(userProfile,function(error,data){
                if(error){
                    res.send('error');
                }
                else{
                    req.session.usuario = data;
                    req.session.autenticado = data.autenticado;
                    //Si el usuario no está autenticado es porque no tiene cuenta en SSP6
                    if(!data.autenticado){
                        res.redirect('/login?msg=user_not_found');
                    } else {
                        req.session.usuario = data;
                        req.session.autenticado = data.autenticado;
                        res.redirect('/credPrimavera?validar=true');
                    }
                }
            });
        })
        .catch(function(error) {
            console.log(error);
        });
        
    })
    .catch(function(error) {
    console.log(error);
    });
    
});


callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

module.exports = router;