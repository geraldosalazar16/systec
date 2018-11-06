var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });
    // Set queryParameters for `include` and pagination
    var options = {
    queryParameters: {
        include: "attachments",
        includeAll: true
        }
    };
    // List all sheets
    var sheets = Array();
    smartsheet.sheets.listSheets(options)
    .then(function (result) {
        result.data.forEach(sheet => {
            var hoja = {
                id: sheet.id,
                nombre: sheet.name,
                accessLevel: sheet.accessLevel
            };
            //Solo guardo las hojas en las que es owner
            if(hoja.accessLevel == 'OWNER')
            {
                sheets.push(hoja);
            }
        });
        res.json(sheets);
    });
});

module.exports = router;