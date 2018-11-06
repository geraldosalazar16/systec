/*
var express = require('express');
var router = express.Router();

//var userModel = require('../models/users.js');
var url = require('../models/url.js');
var soap = require('soap');

router.get('/', function(req, res, next) {
    var id_usuario = req.session.usuario['id'];
    var url_ws = url+'ProjectService?wsdl';
  var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                            '<wsse:Username>admin</wsse:Username>'+
                            '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">admin</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

  soap.createClient(url_ws,function(err, client) {
      if(err){
        throw err;
      }
      else{
        client.addSoapHeader(token_xml);
        var args = {
            Field:['Name','ActivityDefaultCalendarObjectId']
        }; 
        client.ReadProjects(args,function(err, result,rawResponse, soapHeader, rawRequest) {
            res.json(result);
        });
      }
  });
});
*/

var express = require('express');
var router = express.Router();
var primavera = require('../models/primavera.js');

router.get('/', function(req, res, next) {
    primavera.getProyectos(req.session.usuario,function(err,result){
        if(err){
            res.send(err);
        }
        else{
            res.json(result);
        }
    })
});

module.exports = router;