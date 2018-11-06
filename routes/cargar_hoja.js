var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {

    // Initialize the client cq9nwc3b2z5tlsutxqslb3sl5p
    var client = require('smartsheet');
    var smartsheet = client.createClient({
        accessToken: req.session.usuario.token,
        logLevel: 'info'
    });
    
    var datos = JSON.parse(req.body.datos);
    var columnas = JSON.parse(req.body.columnas);
    // Set options
    var options_sheet = {
        id: req.body.id // Id of Sheet
    };
  
    // Get sheet
    smartsheet.sheets.getSheet(options_sheet)
    .then(function(sheetInfo) {
        //Recorro toda la hoja
        var filas = sheetInfo.rows.length;
        console.log('Filas a eliminar: '+sheetInfo.rows.length);
        //Eliminar todas las filas existentes
        if(filas > 0){
            var rowIds = sheetInfo.rows[0].id;
            for(var a = 1;a<filas;a++){
                rowIds += ','+sheetInfo.rows[a].id;
            }
            // Set options
            var options = {
                sheetId: req.body.id,
                rowId: rowIds
            };
        
            // Delete row
            smartsheet.sheets.deleteRow(options)
                .then(function(results) {
                    console.log(results);
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
        var rows = Array();
        for(var i = 0;i <datos.length;i++){
            var cells = Array();
            for(var j = 0; j < columnas.length;j++){
                var cell = {
                    columnId: sheetInfo.columns[j].id,
                    value: datos[i][columnas[j]['col'+j]]
                };
                cells.push(cell);
            }
            var row = {
                toTop: true,
                cells: cells
            };
            rows.push(row);
        }
        var options_row = {
            sheetId: options_sheet.id,
            body: rows
        };
        // Add rows to sheet
        smartsheet.sheets.addRows(options_row)
        .then(function(newRows) {
            console.log(newRows);
        })
        .catch(function(error) {
            console.log(error);
        });
    })
    .catch(function(error) {
        console.log(error);
    });
    /*
    // Specify updated sheet properties
    var sheet = {
        "name": req.body.nombre,
        "userSettings": {
            "criticalPathEnabled": true,
        }
    };
    
    // Set options
    var options = {
        id: req.body.id, // Id of Sheet
        body: sheet
    };
    console.log('Hoja :'+req.body.nombre);
    console.log('ID :'+req.body.id);
    // Update sheet
    smartsheet.sheets.updateSheet(options)
        .then(function(updatedSheet) {
            res.send('ok');
        })
        .catch(function(error) {
            res.send(error);
        });
        */
});

module.exports = router;