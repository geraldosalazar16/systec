var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    var id_hoja = req.body['id'];
    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });

    // Set options
    var options = {
    id: id_hoja // Id of Sheet
    };

    // Get sheet
    smartsheet.sheets.getSheet(options)
    .then(function(sheetInfo) {
        var columnas = sheetInfo.columns;
        res.json(columnas);
    })
    .catch(function(error) {
        res.send(error);
    });
    
});

module.exports = router;