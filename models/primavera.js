//var url = require('./url');

var soap = require('soap');

var primavera = {};

primavera.getActividades = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token = {
        'UsernameToken':{
            'Username': usuario.usuario_primavera,
            'Password Type="PasswordText"': usuario.pwd_primavera
        }
    };
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                            '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                            '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Field:[
                    'Id',
                    'Status',
                    'WBSObjectId',
                    'Name',
                    'StartDate',
                    'FinishDate',
                    'PlannedDuration',
                    'ActualStartDate',
                    'ActualFinishDate',
                    'PercentComplete',
                    'RemainingDuration',
                    'BaselineStartDate',
                    'BaselineFinishDate',
                    'WBSCode',
                    'WBSName',
                    'WBSPath'
                ],
                Filter: 'ProjectObjectId='+id_proyecto
            }; 
            client.ReadActivities(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
}
primavera.asyncgetActividades = function(id_proyecto,usuario){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token = {
        'UsernameToken':{
            'Username': usuario.usuario_primavera,
            'Password Type="PasswordText"': usuario.pwd_primavera
        }
    };
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                            '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                            '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  
    return new Promise((resolve,reject) => {
        soap.createClient(url_ws,function(err, client) {
            if(err){
                reject(err);
            }
            else{
                client.addSoapHeader(token_xml);
                var args = {
                    Field:[
                        'Id',
                        'Status',
                        'WBSObjectId',
                        'Name',
                        'StartDate',
                        'FinishDate',
                        'PlannedDuration',
                        'ActualStartDate',
                        'ActualFinishDate',
                        'PercentComplete',
                        'RemainingDuration',
                        'BaselineStartDate',
                        'BaselineFinishDate',
                        'WBSCode',
                        'WBSName',
                        'WBSPath'
                    ],
                    Filter: 'ProjectObjectId='+id_proyecto
                }; 
                client.ReadActivities(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                });
            }
        });
    }) 
}
primavera.getActivityCodes = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityCodeService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
   var token = {
        'UsernameToken':{
            'Username': usuario.usuario_primavera,
            'Password Type="PasswordText"': usuario.pwd_primavera
        }
    };
    token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Field:['CodeTypeName','CodeTypeObjectId','CodeValue','ProjectObjectId']
            }; 
            client.ReadActivityCodes(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
}
primavera.getActivityCodeTypesByProjectId = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityCodeTypeService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
   var token = {
        'UsernameToken':{
            'Username': usuario.usuario_primavera,
            'Password Type="PasswordText"': usuario.pwd_primavera
        }
    };
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Field:['Name','ProjectObjectId'],
                Filter: ["ProjectObjectId="+id_proyecto,"ProjectObjectId is null"]
            }; 
            client.ReadActivityCodeTypes(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
}
primavera.getCalendario = function(id_calendario,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'CalendarService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

  soap.createClient(url_ws,function(err, client) {
      if(err){
        throw err;
      }
      else{
        client.addSoapHeader(token_xml);
        var args = {
            Field:'HoursPerDay',
            Filter: 'ObjectId = '+id_calendario
        }; 
        client.ReadCalendars(args,function(err, result,rawResponse, soapHeader, rawRequest) {
            if(err){
                callback(err,null);
            }
            else{
                callback(null,result);
            }
        });
      }
  });        
}
primavera.asyncgetCalendario = function(id_calendario,usuario){
    var url = usuario.url_primavera;
    var url_ws = url+'CalendarService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  
  return new Promise((resolve,reject) => {
    soap.createClient(url_ws,function(err, client) {
        if(err){
          reject(err);
        }
        else{
          client.addSoapHeader(token_xml);
          var args = {
              Field:'HoursPerDay',
              Filter: 'ObjectId = '+id_calendario
          }; 
          client.ReadCalendars(args,function(err, result,rawResponse, soapHeader, rawRequest) {
              if(err){
                  reject(err);
              }
              else{
                  resolve(result);
              }
          });
        }
    }); 
  })
         
}
primavera.getRelacionesActividadCodigo = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityCodeAssignmentService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Field:[
                    'ActivityCodeObjectId',
                    'ActivityCodeTypeObjectId',
                    'ActivityCodeValue',
                    'ActivityObjectId',
                    'ActivityCodeTypeName'
                ],
                Filter:'ProjectObjectId='+id_proyecto
            }; 
            client.ReadActivityCodeAssignments(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
    
}
primavera.asyncgetRelacionesActividadCodigo = function(id_proyecto,usuario){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityCodeAssignmentService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  
    return new Promise((resolve,reject) => {
        soap.createClient(url_ws,function(err, client) {
            if(err){
                reject(err);
            }
            else{
                client.addSoapHeader(token_xml);
                var args = {
                    Field:[
                        'ActivityCodeObjectId',
                        'ActivityCodeTypeObjectId',
                        'ActivityCodeValue',
                        'ActivityObjectId',
                        'ActivityCodeTypeName'
                    ],
                    Filter:'ProjectObjectId='+id_proyecto
                }; 
                client.ReadActivityCodeAssignments(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                });
            }
        });
    })    
}
primavera.getWBS = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'WBSService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Field:[
                    'Code',
                    'Name',
                    'ProjectId'
                ],
                Filter:'ProjectObjectId='+id_proyecto
            }; 
            client.ReadWBS(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
    
}
primavera.asyncgetWBS = function(id_proyecto,usuario){
    var url = usuario.url_primavera;
    var url_ws = url+'WBSService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                '</wsse:UsernameToken>'+
            '</wsse:Security>';
  
    return new Promise((resolve,reject) => {
        soap.createClient(url_ws,function(err, client) {
            if(err){
                reject(err);
            }
            else{
                client.addSoapHeader(token_xml);
                var args = {
                    Field:[
                        'Code',
                        'Name',
                        'ProjectId'
                    ],
                    Filter:'ProjectObjectId='+id_proyecto
                }; 
                client.ReadWBS(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                        if(err){
                            reject(err);
                        }
                        else{
                            resolve(result);
                        }
                });
            }
        });
    })    
}
primavera.updateActivities = function(actividades,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ActivityService?wsdl';
    /*
    var token = {
        'UsernameToken':{
            'Username': 'admin',
            'Password Type="PasswordText"': 'admin'
        }
    };
    */
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                            '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                            '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

    soap.createClient(url_ws,function(err, client) {
        if(err){
            throw err;
        }
        else{
            client.addSoapHeader(token_xml);
            var args = {
                Activity:actividades
            }; 
            client.UpdateActivities(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                if(err){
                    callback(err,null);
                }
                else{
                    callback(null,result);
                }
            });
        }
    });
}
primavera.getProyectoByID = function(id_proyecto,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectService?wsdl';
    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
    '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
    '</wsse:UsernameToken>'+
'</wsse:Security>';
  

        soap.createClient(url_ws,function(err, client) {
            if(err){
              throw err;
            }
            else{
              client.addSoapHeader(token_xml);
              var args = {
                  Field:['Name','ActivityDefaultCalendarObjectId'],
                  Filter:'ObjectId='+id_proyecto
              }; 
              client.ReadProjects(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                    if(err){
                        callback(err,null);
                    }
                    else{
                        callback(null,result);
                    }
              });
            }
        });    
}
primavera.getProyectos = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectService?wsdl';

    var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
    '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
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
            if(err){
                callback(err,null);
            }
            else{
                callback(null,result);
            }
        });
      }
  });
}
primavera.getPortafolio = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

  soap.createClient(url_ws,function(err, client) {
      if(err){
        throw err;
      }
      else{
        client.addSoapHeader(token_xml);
        var args = {
            Field:[
                'Id',
                'Name',
                'StartDate',
                'FinishDate',
                'SummaryBaselineStartDate',
                'SummaryBaselineFinishDate',
                'SummaryBudgetAtCompletionByCost',
                'SummaryActualTotalCost',
                'SummaryEstimateToCompleteByCost',
                'SummaryPerformancePercentCompleteByCost',
                'SummarySchedulePercentComplete',
                'OBSName',
                'SummaryBaselineDuration',
                'SummaryActualDuration',
                'SummaryRemainingDuration',
                'SummaryAtCompletionTotalCostVariance',
                'SummaryRemainingTotalCost',
                'SummaryDurationVariance',
                'SummaryTotalCostVariance',
                'ActivityDefaultCalendarObjectId',
                'SummaryAtCompletionTotalCost',
                              
            ]
        }; 
        client.ReadProjects(args,function(err, result,rawResponse, soapHeader, rawRequest) {
            if(err){
                callback(err,null);
            }
            else{
                callback(null,result);
            }
        });
      }
  });        
}
primavera.asyncgetProyectos = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectService?wsdl';

  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  
    return new Promise((resolve,reject) => {
        soap.createClient(url_ws,function(err, client) {
            if(err){
              reject(err);
            }
            else{
              client.addSoapHeader(token_xml);
              var args = {
                  Field:[
                      'Id',
                      'Name',
                      'StartDate',
                      'FinishDate',
                      'SummaryBaselineStartDate',
                      'SummaryBaselineFinishDate',
                      'SummaryBudgetAtCompletionByCost',
                      'SummaryActualTotalCost',
                      'SummaryEstimateToCompleteByCost',
                      'SummaryPerformancePercentCompleteByCost',
                      'SummarySchedulePercentComplete',
                      'OBSName',
                      'SummaryBaselineDuration',
                      'SummaryActualDuration',
                      'SummaryRemainingDuration',
                      'SummaryAtCompletionTotalCostVariance',
                      'SummaryRemainingTotalCost',
                      'SummaryDurationVariance',
                      'SummaryAtCompletionTotalCost', 
                      'ActivityDefaultCalendarObjectId',
                      'SummaryRemainingTotalCost', 
                      'SummaryAtCompletionTotalCost',
                      'SummaryTotalCostVariance',                
                  ]
              }; 
              client.ReadProjects(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                  if(err){
                      reject(err);
                  }
                  else{
                      resolve(result);
                  }
              });
            }
        }); 
    });       
}

primavera.getListaPosiblesValoresProjectCodes = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectCodeService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

  soap.createClient(url_ws,function(err, client) {
      if(err){
        throw err;
      }
      else{
        client.addSoapHeader(token_xml);
        var args = {
            Field:[
                'CodeTypeName',
                'CodeTypeObjectId',
                'CodeValue',
                'Description'                
            ]
        }; 
        client.ReadProjectCodes(args,function(err, result,rawResponse, soapHeader, rawRequest) {
            if(err){
                callback(err,null);
            }
            else{
                callback(null,result);
            }
        });
      }
  });        
}
primavera.getRelacionProyectosCodigos = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectCodeAssignmentService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  

  soap.createClient(url_ws,function(err, client) {
      if(err){
        throw err;
      }
      else{
        client.addSoapHeader(token_xml);
        var args = {
            Field:[
                'ProjectCodeDescription',
                'ProjectCodeObjectId',
                'ProjectCodeTypeName',
                'ProjectCodeTypeObjectId',
                'ProjectCodeValue',
                'ProjectId',
                'ProjectName',
                'ProjectObjectId'                
            ]
        }; 
        client.ReadProjectCodeAssignments(args,function(err, result,rawResponse, soapHeader, rawRequest) {
            if(err){
                callback(err,null);
            }
            else{
                callback(null,result);
            }
        });
      }
  });        
}
primavera.asyncgetRelacionProyectosCodigos = function(usuario){
    var url = usuario.url_primavera;
    var url_ws = url+'ProjectCodeAssignmentService?wsdl';
    /*
    var token = {
      'UsernameToken':{
          'Username': 'admin',
          'Password Type="PasswordText"': 'admin'
      }
  };
  */
  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  return new Promise((resolve,reject) => {
    soap.createClient(url_ws,function(err, client) {
        if(err){
          reject(err);
        }
        else{
          client.addSoapHeader(token_xml);
          var args = {
              Field:[
                  'ProjectCodeDescription',
                  'ProjectCodeObjectId',
                  'ProjectCodeTypeName',
                  'ProjectCodeTypeObjectId',
                  'ProjectCodeValue',
                  'ProjectId',
                  'ProjectName',
                  'ProjectObjectId'                
              ]
          }; 
          client.ReadProjectCodeAssignments(args,function(err, result,rawResponse, soapHeader, rawRequest) {
              if(err){
                  reject(err);
              }
              else{
                  resolve(result);
              }
          });
        }
    }); 
  });         
}

primavera.getUDFs = function(area,usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'UDFTypeService?wsdl';

  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  
                    soap.createClient(url_ws,function(err, client) {
                        if(err){
                          throw err;
                        }
                        else{
                          client.addSoapHeader(token_xml);
                          var args = {
                            Field:[
                                'DataType',
                                'IsCalculated',
                                'IsConditional',
                                'IsSecureCode',
                                'ObjectId',
                                'SubjectArea',
                                'Title',              
                            ],
                            Filter: "SubjectArea='"+area+"'"
                          }; 
                          client.ReadUDFTypes(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                              if(err){
                                  callback(err,null);
                              }
                              else{
                                  callback(null,result);
                              }
                          });
                        }
                    }); 
           
}

primavera.getUDFsAllProjects = function(usuario,callback){
    var url = usuario.url_primavera;
    var url_ws = url+'UDFValueService?wsdl';

  var token_xml =   '<wsse:Security  xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
                        '<wsse:UsernameToken wsu:Id="UsernameToken-8A9E7449615BCD7075152458094990582">'+
                        '<wsse:Username>'+usuario.usuario_primavera+'</wsse:Username>'+
                        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'+usuario.pwd_primavera+'</wsse:Password>'+
                        '</wsse:UsernameToken>'+
                    '</wsse:Security>';
  
                    soap.createClient(url_ws,function(err, client) {
                        if(err){
                          throw err;
                        }
                        else{
                          client.addSoapHeader(token_xml);
                          var args = {
                            Field:[
                                'CodeValue',
                                'ConditionalIndicator',
                                'Cost',
                                'CreateDate',
                                'CreateUser',
                                'Description',
                                'Double',
                                'FinishDate',
                                'ForeignObjectId',
                                'Indicator',
                                'Integer',
                                'IsBaseline',
                                'IsTemplate',
                                'IsUDFTypeCalculated',
                                'IsUDFTypeConditional',
                                'LastUpdateDate',
                                'LastUpdateUser',
                                'ProjectObjectId',
                                'StartDate', 
                                'Text',
                                'UDFCodeObjectId', 
                                'UDFTypeDataType',
                                'UDFTypeObjectId',  
                                'UDFTypeSubjectArea', 
                                'UDFTypeTitle',               
                            ]
                          }; 
                          client.ReadUDFValues(args,function(err, result,rawResponse, soapHeader, rawRequest) {
                              if(err){
                                  callback(err,null);
                              }
                              else{
                                  callback(null,result);
                              }
                          });
                        }
                    }); 
           
}

module.exports = primavera;