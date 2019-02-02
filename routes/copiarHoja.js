var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    var id_hoja = req.body['id_hoja'];
    var nombre = req.body['nombre'];
 
    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });

    // Set destination information
    var body = {
        destinationType: "home",
        newName: nombre
    };
  
  // Set elements to copy
  var params = {
    include: "cellLinks,data,ruleRecipients,rules",
    includeAll: false
  };
  
  // Set options
  var options = {
    sheetId: id_hoja,
    body: body,
    queryParameters: params
  };
  
  // Copy sheet
  smartsheet.sheets.copySheet(options)
    .then(function(copiedSheet) {
        res.json(copiedSheet.result);
    })
    .catch(function(error) {
        res.send(error);
    });    
});

module.exports = router;