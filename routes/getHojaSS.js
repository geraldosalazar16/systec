var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });
    
    var id_hoja = req.query.id_hoja;
    // Set options
    var options = {
        id: id_hoja// Id of Sheet
    };
  
    // Get sheet
    smartsheet.sheets.getSheet(options)
    .then(function(sheetInfo) {
        var hoja = {
            id: sheetInfo.id,
            nombre: sheetInfo.name,
            accessLevel: sheetInfo.accessLevel
        };
        res.send(hoja);
    });
});

module.exports = router;