//Conexion a la base de datos
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "systec"
});

var crypto = require('crypto');

function obtener_fecha_actual (){
    //Obtener la fecha de guardado
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) {
        dd = '0'+dd
    } 
    if(mm<10) {
        mm = '0'+mm
    } 
    today = mm + '/' + dd + '/' + yyyy;
    return today;
}
var userModel = {};

userModel.validarUsuario = function(username,pwd,callback){
    if(con){
        // Create hash
        var hash =
        crypto.createHash('sha256')
        .update(pwd)
        .digest('hex');

        var sql = "SELECT * FROM usuarios WHERE CONTRASENA = "+con.escape(hash)+ " AND NOMBRE = " + con.escape(username);
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                var usuario;
                if(result[0]){
                    if(result[0]['NOMBRE'] == username){
                        var res = result[0];
                        //Informacion de permisos
                        var sql = "SELECT p.NOMBRE,pp.ID_PERFIL,pp.ID_PERMISO,pp.VALOR "+
                        "FROM perfil_permisos pp INNER JOIN perfiles p ON pp.ID_PERFIl = p.ID "+
                        "WHERE pp.ID_PERFIL = "+result[0]['ID_PERFIL'];
                        con.query(sql, function (err, result) {
                            if (err) 
                                callback(err,null);
                            else{
                                usuario = {
                                    id: res['ID'],
                                    username: res['NOMBRE'],
                                    token: res['TOKEN'],
                                    usuario_primavera: res['USUARIO_PRIMAVERA'],
                                    pwd_primavera: res['PWD_PRIMAVERA'],
                                    url_primavera: res['URL_PRIMAVERA'],
                                    perfil: result[0]['NOMBRE'],
                                    autenticado: true,
                                    permisos: result
                                };
                                callback(null,usuario);
                            }
                        });
                    }
                    else{
                        usuario = {
                            id: 0,
                            username: '',
                            token: '',
                            autenticado: false
                        };
                        callback(null,usuario);
                    }
                }
                else{
                    usuario = {
                        id: 0,
                        username: '',
                        token: '',
                        autenticado: false
                    };
                    callback(null,usuario);
                }
            }   
        });
    }
}
userModel.validarUsuarioSesion = function(username,pwd,callback){
    if(con){
        //Se valida sin hash ya que esta recibiendo la contraseña de la sesion

        var sql = "SELECT * FROM usuarios WHERE CONTRASENA = "+con.escape(pwd)+ " AND NOMBRE = " + con.escape(username);
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                var usuario;
                if(result[0]){
                    if(result[0]['NOMBRE'] == username){
                        var res = result[0];
                        //Informacion de permisos
                        var sql = "SELECT p.NOMBRE,pp.ID_PERFIL,pp.ID_PERMISO,pp.VALOR "+
                        "FROM perfil_permisos pp INNER JOIN perfiles p ON pp.ID_PERFIl = p.ID "+
                        "WHERE pp.ID_PERFIL = "+result[0]['ID_PERFIL'];
                        con.query(sql, function (err, result) {
                            if (err) 
                                callback(err,null);
                            else{
                                usuario = {
                                    id: res['ID'],
                                    username: res['NOMBRE'],
                                    token: res['TOKEN'],
                                    usuario_primavera: res['USUARIO_PRIMAVERA'],
                                    pwd_primavera: res['PWD_PRIMAVERA'],
                                    url_primavera: res['URL_PRIMAVERA'],
                                    perfil: result[0]['NOMBRE'],
                                    autenticado: true,
                                    permisos: result
                                };
                                callback(null,usuario);
                            }
                        });
                    }
                    else{
                        usuario = {
                            id: 0,
                            username: '',
                            token: '',
                            autenticado: false
                        };
                        callback(null,usuario);
                    }
                }
                else{
                    usuario = {
                        id: 0,
                        username: '',
                        token: '',
                        autenticado: false
                    };
                    callback(null,usuario);
                }
            }   
        });
    }
}
userModel.validarUsuarioOAuth = function(userProfile,callback){
    if(con){
        //Primero busco al usuario por el id de smartsheet, para saber si ya ha entrado con el OAuth
        var sql = "SELECT * FROM usuarios WHERE ID_SMARTSHEET = "+con.escape(userProfile.id);
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                //Verificar que haya encontrado algo
                var usuario;
                if(result[0]){
                    //Si el usuario existe devuelvo su información
                    var res = result[0];
                     //Informacion de permisos
                    var sql = "SELECT p.NOMBRE,pp.ID_PERFIL,pp.ID_PERMISO,pp.VALOR "+
                    "FROM perfil_permisos pp INNER JOIN perfiles p ON pp.ID_PERFIl = p.ID "+
                     "WHERE pp.ID_PERFIL = "+result[0]['ID_PERFIL'];
                    con.query(sql, function (err, result) {
                        if (err) 
                            callback(err,null);
                        else{
                            usuario = {
                                id: res['ID'],
                                username: res['NOMBRE'],
                                token: res['TOKEN'],
                                usuario_primavera: res['USUARIO_PRIMAVERA'],
                                pwd_primavera: res['PWD_PRIMAVERA'],
                                url_primavera: res['URL_PRIMAVERA'],
                                perfil: result[0]['NOMBRE'],
                                autenticado: true,
                                password: res['CONTRASENA'],
                                permisos: result
                            };
                            callback(null,usuario);
                        }
                    });
                } else { //No se encuentra el usuario pro el id de smartsheet
                    //Es posible que el usuario esté ya creado solo que nunca ha usado OAuth
                    var sql = "SELECT * FROM usuarios WHERE NOMBRE LIKE "+con.escape(userProfile.firstName)+" AND CORREO = "+con.escape(userProfile.email);
                    con.query(sql, function (err, result) {
                        if (err) 
                            callback(err,null); 
                        else{
                            var usuario;
                            if(result[0]){                                
                                var res = result[0];
                                //Debo insertar el id de smartsheet
                                var sql = "UPDATE usuarios SET ID_SMARTSHEET = "+userProfile.id+"  WHERE ID = "+result[0]["ID"];
                                con.query(sql, function (err, result) {
                                    if (err) 
                                        callback(err,null);
                                    else{
                                        //Informacion de permisos
                                        sql = "SELECT p.NOMBRE,pp.ID_PERFIL,pp.ID_PERMISO,pp.VALOR "+
                                        "FROM perfil_permisos pp INNER JOIN perfiles p ON pp.ID_PERFIl = p.ID "+
                                        "WHERE pp.ID_PERFIL = "+res['ID_PERFIL'];
                                        con.query(sql, function (err, result) {
                                            if (err) 
                                                callback(err,null);
                                            else{
                                                usuario = {
                                                    id: res['ID'],
                                                    username: res['NOMBRE'],
                                                    token: res['TOKEN'],
                                                    usuario_primavera: res['USUARIO_PRIMAVERA'],
                                                    pwd_primavera: res['PWD_PRIMAVERA'],
                                                    url_primavera: res['URL_PRIMAVERA'],
                                                    perfil: result[0]['NOMBRE'],
                                                    autenticado: true,
                                                    password: res['CONTRASENA'],
                                                    permisos: result
                                                };
                                                callback(null,usuario);
                                            }
                                        });
                                    }
                                });                                
                            } else {
                                usuario = {
                                    id: 0,
                                    username: '',
                                    token: '',
                                    autenticado: false
                                };
                                callback(null,usuario);
                            }
                        }   
                    });
                }
            }   
        });
    }
}
userModel.getColumnasP6 = function(callback){
    if(con){
        var sql = "SELECT * FROM columnas_P6 where TIPO_WORKFLOW = 'PROYECTO'";
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getColumnasP6P = function(callback){
    if(con){
        var sql = "SELECT * FROM columnas_P6 where TIPO_WORKFLOW = 'PORTAFOLIO'";
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                callback(null,result);
            }
        });
    }
}
userModel.almacenarWorkFlow = function(info,callback){
    var id_wf = info['id_wf'];
    var id_usuario = info['id_usuario'];
    var nombre_workflow = info['nombre_workflow'];
    var id_proyecto_primavera = info['id_proyecto_primavera'];
    var nombre_proyecto_primavera = info['nombre_proyecto_primavera'];
    var id_hoja_smartsheet = info['id_hoja_smartsheet'];
    var nombre_hoja_ss = info['nombre_hoja_ss'];
    var comentarios = info['comentarios'];
    var factor_duracion = info['factor_duracion'];

    if(con){
        //Inserción
        if(id_wf == 0){
            var today = obtener_fecha_actual();
            var insert = "INSERT INTO workflows ";
            var values = "(ID_USUARIO,NOMBRE,ID_PROYECTO_PRIMAVERA,ID_HOJA_SMARTSHEET,NOMBRE_HOJA_SS,COMENTARIOS,FACTOR_DURACION,FECHA_CREACION,NOMBRE_PROYECTO_PRIMAVERA) VALUES (";
            var data= 
            id_usuario
            +",'"+nombre_workflow+"',"
            +id_proyecto_primavera+","
            +id_hoja_smartsheet+",'"
            +nombre_hoja_ss+"','"
            +comentarios+"',"
            +factor_duracion+",'"
            +today+"','"
            +nombre_proyecto_primavera+"')";
            var sql = insert+values+data;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    //Devuelvo el id insertado
                    sql = "SELECT MAX(ID) AS ID FROM workflows";
                    con.query(sql,function(err,result){
                        if(err)
                            callback(err,null); 
                        else{
                            callback(null,result);
                        }
                    });
                }
            });
        }
        else{//Modificacion
            var sql = "UPDATE workflows SET NOMBRE = '"+nombre_workflow+
            "',COMENTARIOS = '"+comentarios+
            "',FACTOR_DURACION = "+factor_duracion+
            " WHERE ID = "+id_wf;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,[{ID:id_wf}]); 
                }
            });
        }
    }
}
userModel.updateWorkFlow = function(info,callback){
    var nombre_proyecto_primavera = info.project_name;
    var nombre_hoja_ss = info.sheet_name;
    var id_wf = info.id_wf;

    if(con){
            var sql = "UPDATE workflows SET NOMBRE_PROYECTO_PRIMAVERA = "+con.escape(nombre_proyecto_primavera)+
            ",NOMBRE_HOJA_SS = "+con.escape(nombre_hoja_ss)+
            " WHERE ID = "+id_wf;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,[{ID:id_wf}]); 
                }
            });        
    }
}
userModel.updateWorkFlowP = function(info,callback){
    var nombre_hoja_ss = info.sheet_name;
    var id_wf = info.id_wf;

    if(con){
            var sql = "UPDATE workflowsp SET NOMBRE_HOJA_SS = "+con.escape(nombre_hoja_ss)+
            " WHERE ID = "+id_wf;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,[{ID:id_wf}]); 
                }
            });        
    }
}
userModel.almacenarWorkFlowP = function(info,callback){
    var id_wf = info['id_wf'];
    var id_usuario = info['id_usuario'];
    var nombre_workflow = info['nombre_workflow'];
    var id_hoja_smartsheet = info['id_hoja_smartsheet'];
    var nombre_hoja_ss = info['nombre_hoja_ss'];
    var comentarios = info['comentarios'];

    if(con){
        //Inserción
        if(id_wf == 0){
            var today = obtener_fecha_actual();
            var insert = "INSERT INTO workflowsp ";
            var values = "(ID_USUARIO,NOMBRE,ID_HOJA_SMARTSHEET,NOMBRE_HOJA_SS,COMENTARIOS,FECHA_CREACION) VALUES (";
            var data= 
            id_usuario
            +",'"+nombre_workflow+"',"
            +id_hoja_smartsheet+",'"
            +nombre_hoja_ss+"','"
            +comentarios+"','"
            +today+"')";
            var sql = insert+values+data;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    //Devuelvo el id insertado
                    sql = "SELECT MAX(ID) AS ID FROM workflowsp";
                    con.query(sql,function(err,result){
                        if(err)
                            callback(err,null); 
                        else{
                            callback(null,result);
                        }
                    });
                }
            });
        }
        else{//Modificacion
            var sql = "UPDATE workflowsp SET NOMBRE = '"+nombre_workflow+
            "',COMENTARIOS = '"+comentarios+
            "' WHERE ID = "+id_wf;
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,[{ID:id_wf}]); 
                }
            });
        }
    }
}
userModel.guardarEnlace = function(info,callback){
    //id,id_workflow,nombre_p6,id_ss,id_p6,tipo_columna_p6,tipo_filtro,valor_filtro,logica_filtro,NOMBRE_SS,descripcion,
    if(con){
        if(info['id'] == 0){
            var sql = "INSERT INTO workflows_hojas_columnas"+
            "(ID_WORKFLOW,"+
            "COLUMNA_PRIMAVERA,"+
            "COLUMNA_SMARTSHEET,"+
            "ID_COLUMNA_PRIMAVERA,"+
            "TIPO_COLUMNA_PRIMAVERA,"+
            "TIPO_FILTRO,"+
            "VALOR1_FILTRO,"+
            "LOGICA_FILTRO,"+
            "NOMBRE_COLUMNA_SMARTSHEET,"+
            "DESCRIPCION,"+
            "ID_PROYECTO_PRIMAVERA,"+
            "ID_HOJA_SMARTSHEET"+
            ") VALUES ("+
            +info['id_workflow']+",'"
            +info['NOMBRE_P6']+"',"
            +info['id_ss']+","
            +info['id_p6']+",'"
            +info['tipo_columna_p6']+"','"
            +info['tipo_filtro']+"','"
            +info['valor_filtro']+"','"
            +info['logica_filtro']+"','"
            +info['NOMBRE_SS']+"','"
            +info['descripcion']+"',"
            +info['id_proyecto_primavera']+",'"
            +info['id_hoja_smartsheet']
            +"');";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,result); 
                }
            });
        }
        else{
            var sql = "UPDATE workflows_hojas_columnas SET ID_WORKFLOW = "+info['id_workflow']+
            ", COLUMNA_PRIMAVERA = '"+info['NOMBRE_P6']+
            "',COLUMNA_SMARTSHEET='"+info['id_ss']+
            "',ID_COLUMNA_PRIMAVERA="+info['id_p6']+
            ",TIPO_COLUMNA_PRIMAVERA='"+info['tipo_columna_p6']+
            "',TIPO_FILTRO='"+info['tipo_filtro']+
            "',VALOR1_FILTRO='"+info['valor_filtro']+
            "',LOGICA_FILTRO='"+info['logica_filtro']+
            "',NOMBRE_COLUMNA_SMARTSHEET='"+info['NOMBRE_SS']+
            "',DESCRIPCION='"+info['descripcion']+
            "',ID_PROYECTO_PRIMAVERA="+info['id_proyecto_primavera']+
            ",ID_HOJA_SMARTSHEET='"+info['id_hoja_smartsheet']+
            "' WHERE ID = "+info['id'];
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,result); 
                }
            }); 
        }
    }
}
userModel.guardarEnlacePortafolio = function(info,callback){
    //id,id_workflow,nombre_p6,id_ss,id_p6,tipo_columna_p6,tipo_filtro,valor_filtro,logica_filtro,NOMBRE_SS,descripcion,
    if(con){
        //Parámetros opcionales
        var tipo_dato;
        if(!info['tipo_dato']){
            tipo_dato = "";
        } else {
            tipo_dato = info['tipo_dato'];
        }
        var valor_filtro2;
        if(!info['valor_filtro2']){
            valor_filtro2 = "";
        } else {
            valor_filtro2 = info['valor_filtro2'];
        }
        if(info['id'] == 0){            
            var sql = "INSERT INTO workflows_hojas_columnasp"+
            "(ID_WORKFLOW,"+
            "COLUMNA_PRIMAVERA,"+
            "COLUMNA_SMARTSHEET,"+
            "ID_COLUMNA_PRIMAVERA,"+
            "TIPO_COLUMNA_PRIMAVERA,"+
            "TIPO_FILTRO,"+
            "VALOR1_FILTRO,"+
            "VALOR2_FILTRO,"+
            "LOGICA_FILTRO,"+
            "NOMBRE_COLUMNA_SMARTSHEET,"+
            "TIPO_DATO,"+
            "DESCRIPCION,"+
            "ID_HOJA_SMARTSHEET"+
            ") VALUES ("+
            +info['id_workflow']+",'"
            +info['NOMBRE_P6']+"',"
            +info['id_ss']+","
            +info['id_p6']+",'"
            +info['tipo_columna_p6']+"','"
            +info['tipo_filtro']+"','"
            +info['valor_filtro']+"','"
            +valor_filtro2+"','"
            +info['logica_filtro']+"','"
            +info['NOMBRE_SS']+"','"
            +tipo_dato+"','"
            +info['descripcion']+"','"
            +info['id_hoja_smartsheet']
            +"');";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,result); 
                }
            });
        }
        else{
            var sql = "UPDATE workflows_hojas_columnasp SET ID_WORKFLOW = "+info['id_workflow']+
            ", COLUMNA_PRIMAVERA = '"+info['NOMBRE_P6']+
            "',COLUMNA_SMARTSHEET='"+info['id_ss']+
            "',ID_COLUMNA_PRIMAVERA="+info['id_p6']+
            ",TIPO_COLUMNA_PRIMAVERA='"+info['tipo_columna_p6']+
            "',TIPO_FILTRO='"+info['tipo_filtro']+
            "',VALOR1_FILTRO='"+info['valor_filtro']+
            "',VALOR2_FILTRO='"+valor_filtro2+
            "',LOGICA_FILTRO='"+info['logica_filtro']+
            "',NOMBRE_COLUMNA_SMARTSHEET='"+info['NOMBRE_SS']+
            "',TIPO_DATO='"+tipo_dato+
            "',DESCRIPCION='"+info['descripcion']+
            "',ID_HOJA_SMARTSHEET='"+info['id_hoja_smartsheet']+
            "' WHERE ID = "+info['id'];
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    callback(err,null); 
                }
                else{
                    callback(null,result); 
                }
            }); 
        }
    }
}
userModel.guardarProyectoP6 = function(info,callback){
    if(con){
        var id_usuario = info['id_usuario'];
        var contenido = JSON.stringify(info['contenido']);
        var activity_codes = JSON.stringify(info['activity_codes']);
        var activity_code_types = JSON.stringify(info['activity_code_types']);
        var nombre = info['nombre_proyecto'];
        var factor_duracion = info['factor_duracion'];
        var wbs = JSON.stringify(info['wbs']);

        var sql = "INSERT INTO hoja_primavera (ID_USUARIO,CONTENIDO,ACTIVITY_CODES,ACTIVITY_CODE_TYPES,NOMBRE,FACTOR_DURACION,WBS) VALUES("+id_usuario+",'"
        +contenido+"','"+activity_codes+"','"+activity_code_types+"','"+nombre+"',"+factor_duracion+",'"+wbs+"')";
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                //Si la insercion fue exitosa retornar el objeto que se inserto
                //Primero obtener el id
                sql = "SELECT MAX(ID) AS ID FROM hoja_primavera";
                con.query(sql, function (err, result) {
                    if (err) 
                        callback(err,null); 
                    else{
                        //Una vez que tengo el ID buscar ese proyecto
                        sql = "SELECT * FROM hoja_primavera WHERE ID = "+result[0]['ID'];
                        con.query(sql, function (err, result) {
                            if (err) 
                                callback(err,null); 
                            else{
                                callback(null,result);
                            }
                        });
                    }
                });
            }
        });
    }
}
userModel.editarProyectoP6 = function(info,callback){
    if(con){
        var id_usuario = info['id_usuario'];
        var id = info['id'];
        var contenido = JSON.stringify(info['contenido']);
        var activity_codes = JSON.stringify(info['activity_codes']);
        var activity_code_types = JSON.stringify(info['activity_code_types']);
        var nombre = info['nombre_proyecto'];
        var factor_duracion = info['factor_duracion'];
        var wbs = JSON.stringify(info['wbs']);

        var sql = "UPDATE hoja_primavera SET ID_USUARIO = "+id_usuario+", NOMBRE = '"+nombre+
        "', CONTENIDO = '"+contenido+"', ACTIVITY_CODES = '"+activity_codes+"', ACTIVITY_CODE_TYPES = '"+activity_code_types+
        "', FACTOR_DURACION = "+factor_duracion+",WBS='"+wbs+"' WHERE ID = "+id;
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                //Si la insercion fue exitosa retornar el objeto que se modifico
                //Una vez que tengo el ID buscar ese proyecto
                sql = "SELECT * FROM hoja_primavera WHERE ID = "+id;
                con.query(sql, function (err, result) {
                    if (err) 
                        callback(err,null); 
                    else{
                        callback(null,result);
                    }
                });                
            }
        });
    }
}
userModel.leerProyectosP6 = function(id_usuario,callback){
    if(con){
        var sql = "SELECT * FROM hoja_primavera WHERE ID_USUARIO="+id_usuario;
        con.query(sql, function (err, result) {
            if (err) 
                callback(err,null); 
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getWorkflows = function(id_usuario,callback){
    if(con){
        var sql = "SELECT w.NOMBRE AS NOMBRE_WF,"+
        "w.ID AS ID_WF,"+
        "w.FECHA_CREACION,"+
        "w.ID_HOJA_SMARTSHEET,"+
        "w.NOMBRE_HOJA_SS AS SS_SHEET,"+
        "w.ID_PROYECTO_PRIMAVERA,"+
        "w.NOMBRE_PROYECTO_PRIMAVERA,"+
        "w.FACTOR_DURACION AS DURATION_FACTOR,"+
        "w.ULTIMA_FECHA AS DATE_LAST_RUN,"+
        "w.ID AS WF_ID "+
        "FROM workflows w "+
        "WHERE w.ID_USUARIO="+id_usuario;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getWorkflowsP = function(id_usuario,callback){
    if(con){
        var sql = "SELECT w.NOMBRE AS NOMBRE_WF,"+
        "w.ID AS ID_WF,"+
        "w.FECHA_CREACION,"+
        "w.ID_HOJA_SMARTSHEET,"+
        "w.NOMBRE_HOJA_SS AS SS_SHEET,"+
        "w.ULTIMA_FECHA AS DATE_LAST_RUN,"+
        "w.ID AS WF_ID "+
        "FROM workflowsP w "+
        "WHERE w.ID_USUARIO="+id_usuario;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getRelaciones = function(id_wf,callback){
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnas WHERE ID_WORKFLOW = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getRelacionesPortafolio = function(id_wf,callback){
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnasp WHERE ID_WORKFLOW = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getHojaP6 = function(id_hp,callback){
    if(con){
        var sql = "SELECT CONTENIDO,ACTIVITY_CODES,ACTIVITY_CODE_TYPES,WBS,FACTOR_DURACION FROM hoja_primavera WHERE ID = "+id_hp;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.updateUltimaFechaWF = function(id_wf,callback){
    var today = obtener_fecha_actual();
    if(con){
        var sql = "UPDATE workflows SET ULTIMA_FECHA = '"+today+"' WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.updateUltimaFechaWFP = function(id_wf,callback){
    var today = obtener_fecha_actual();
    if(con){
        var sql = "UPDATE workflowsp SET ULTIMA_FECHA = '"+today+"' WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.deleteWorkflow = function(id_wf,callback){
    if(con){
        var sql = "DELETE FROM workflows WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                //Ahora elimino todos los enlaces
                sql = "DELETE FROM workflows_hojas_columnas WHERE ID_WORKFLOW = "+id_wf;
                con.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        callback(err,null); 
                    }
                    else{
                        callback(null,result);
                    }
                });
            }
        });
        //Ahora elimino todos los enlaces
        sql = "DELETE FROM workflows_hojas_columnas WHERE ID_WORKFLOW = "+id_wf;
    }
}
userModel.deleteWorkflowP = function(id_wf,callback){
    if(con){
        var sql = "DELETE FROM workflowsp WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                //Ahora elimino todos los enlaces
                sql = "DELETE FROM workflows_hojas_columnasp WHERE ID_WORKFLOW = "+id_wf;
                con.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        callback(err,null); 
                    }
                    else{
                        callback(null,result);
                    }
                });
            }
        });
    }
}
userModel.getWorkflowByID = function(id_wf,callback){
    if(con){
        var sql = "SELECT * FROM workflows WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getWorkflowByIDP = function(id_wf,callback){
    if(con){
        var sql = "SELECT * FROM workflowsp WHERE ID = "+id_wf;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getEnlacesByWF = function(info,callback){
    var id_wf = info['id_wf'];
    var id_proyecto_primavera = info['id_proyecto_primavera'];
    var id_hoja_smartsheet = info['id_hoja_smartsheet'];
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnas WHERE ID_WORKFLOW = "+id_wf+
        " AND ID_PROYECTO_PRIMAVERA = "+id_proyecto_primavera+
        " AND ID_HOJA_SMARTSHEET = '"+id_hoja_smartsheet+"'";
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getEnlacesByWFPortafolio = function(info,callback){
    var id_wf = info['id_wf'];
    var id_hoja_smartsheet = info['id_hoja_smartsheet'];
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnasp WHERE ID_WORKFLOW = "+id_wf+
        " AND ID_HOJA_SMARTSHEET = '"+id_hoja_smartsheet+"'";
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getEnlaceById = function(id_enlace,callback){
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnas WHERE ID = "+id_enlace;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getEnlaceByIdPortafolio = function(id_enlace,callback){
    if(con){
        var sql = "SELECT * FROM workflows_hojas_columnasp WHERE ID = "+id_enlace;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.deleteEnlaceById = function(id_enlace,callback){
    if(con){
        var sql = "DELETE FROM workflows_hojas_columnas WHERE ID = "+id_enlace;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.deleteEnlaceByIdPortafolio = function(id_enlace,callback){
    if(con){
        var sql = "DELETE FROM workflows_hojas_columnasp WHERE ID = "+id_enlace;
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getUsuarios = function(callback){
    if(con){
        var sql = "SELECT u.ID,u.NOMBRE,p.NOMBRE as PERFIL,p.ID as ID_PERFIL,u.CORREO,u.CONTRASENA,"+
        "u.TOKEN,u.USUARIO_PRIMAVERA,u.PWD_PRIMAVERA,u.URL_PRIMAVERA "+
        "FROM usuarios u INNER JOIN perfiles p ON u.ID_PERFIL = p.ID";
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.guardarUsuario = function(info,callback){
    if(con){
        
        // Create hash
        var hash =
        crypto.createHash('sha256')
        .update(info.pwd)
        .digest('hex');

        var sql = "INSERT INTO usuarios (NOMBRE,CORREO,CONTRASENA,TOKEN,USUARIO_PRIMAVERA,PWD_PRIMAVERA,URL_PRIMAVERA, ID_PERFIL) VALUES ("+
        con.escape(info.nombre_usuario)+","+con.escape(info.correo)+","+con.escape(hash)+","+con.escape(info.token_ss)+","+
        con.escape(info.usuario_primavera)+","+con.escape(info.pwd_primavera)+","+con.escape(info.url_primavera)+","+con.escape(info.id_perfil)+");";
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.editarUsuario = function(info,callback){
    if(con){
        // Create hash
        var hash =
        crypto.createHash('sha256')
        .update(info.pwd)
        .digest('hex');

        var sql = "UPDATE usuarios SET NOMBRE="+con.escape(info.nombre_usuario)+
        ",CORREO="+con.escape(info.correo)+
        ",CONTRASENA="+con.escape(hash)+
        ",TOKEN="+con.escape(info.token_ss)+
        ",USUARIO_PRIMAVERA="+con.escape(info.usuario_primavera)+
        ",PWD_PRIMAVERA="+con.escape(info.pwd_primavera)+
        ",URL_PRIMAVERA="+con.escape(info.url_primavera)+
        ",ID_PERFIL="+con.escape(info.id_perfil)+
        " WHERE ID = "+con.escape(info.id);
        con.query(sql, function (err, result) {
            if (err) {
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.deleteUsuario = function(id_usuario,callback){
    if(con){
        var sql = "DELETE FROM usuarios WHERE ID = "+id_usuario;
        con.query(sql, function (err, result) {
            if (err) {
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
userModel.getPerfiles = function(callback){
    if(con){
        var sql = "SELECT * FROM perfiles";
        con.query(sql, function (err, result) {
            if (err) {
                callback(err,null); 
            }
            else{
                callback(null,result);
            }
        });
    }
}
module.exports = userModel;