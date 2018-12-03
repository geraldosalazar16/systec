var app = angular.module('loginApp',['cgNotify']);

app.controller('login', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    //Oculta el mensaje de error de login
    $scope.mostrar_mensaje_login = false;
    $scope.resultado_login = '';

    $scope.login = function(){
        var usuario = {
            username: $scope.username,
            password: $scope.pwd
        };
        $http.post('/login',usuario).
        then(function(response) {
            if(response.data != 'error'){
                if(response.data.usuario.autenticado){
                    sessionStorage.autenticado = true;
                    sessionStorage.id = response.data.usuario['id'];
                    sessionStorage.nombre = response.data.usuario['username'];
                    sessionStorage.token = response.data.usuario['token'];

                    var permisos = response.data.usuario['permisos'];
                    var administrar_usuarios = permisos.find(function(element){
                        return element['ID_PERMISO'] == 1;
                    });
                    var agregar_wf = permisos.find(function(element){
                        return element['ID_PERMISO'] == 2;
                    });
                    var cargar_primavera = permisos.find(function(element){
                        return element['ID_PERMISO'] == 3;
                    });
                    var cargar_smartsheet = permisos.find(function(element){
                        return element['ID_PERMISO'] == 4;
                    });
                    var editar_wf = permisos.find(function(element){
                        return element['ID_PERMISO'] == 5;
                    });
                    var eliminar_wf = permisos.find(function(element){
                        return element['ID_PERMISO'] == 6;
                    });
                    var agregar_wfP = permisos.find(function(element){
                        return element['ID_PERMISO'] == 7;
                    });
                    var editar_wfP = permisos.find(function(element){
                        return element['ID_PERMISO'] == 8;
                    });
                    var eliminar_wfP = permisos.find(function(element){
                        return element['ID_PERMISO'] == 9;
                    });
                    var cargar_smartsheetP = permisos.find(function(element){
                        return element['ID_PERMISO'] == 10;
                    });
                    sessionStorage.administrar_usuarios = administrar_usuarios['VALOR'];
                    sessionStorage.agregar_wf = agregar_wf['VALOR'];
                    sessionStorage.cargar_primavera = cargar_primavera['VALOR'];
                    sessionStorage.cargar_smartsheet = cargar_smartsheet['VALOR'];
                    sessionStorage.editar_wf = editar_wf['VALOR'];
                    sessionStorage.eliminar_wf = eliminar_wf['VALOR'];

                    sessionStorage.agregar_wfP = agregar_wfP['VALOR'];
                    sessionStorage.cargar_smartsheetP = cargar_smartsheetP['VALOR'];
                    sessionStorage.editar_wfP = editar_wfP['VALOR'];
                    sessionStorage.eliminar_wfP = eliminar_wfP['VALOR'];

                    //Redireccionar a la carga de credenciales de primavera
                    $window.location.href = 'credPrimavera';

                    //$window.location.href = 'workflows';
                }
                else{
                    $scope.mostrar_mensaje_login = true;
                    $scope.resultado_login = 'Incorrect user or password';
                    //$window.location.href = 'login';
                }
            }
            else{
                $scope.mostrar_mensaje_login = true;
                $scope.resultado_login = 'Conection error, no database service detected';
                //$window.location.href = 'login';
            }
        });
    }
    $scope.loginSmartsheet = function(){
        $http.post('/loginSmartsheet').
        then(function(response) {
            if(response.data != 'error'){
                $window.location.href = response.data;
            }
            else{
                $scope.mostrar_mensaje_login = true;
                $scope.resultado_login = 'Something bad happened';
                //$window.location.href = 'login';
            }
        });
    }
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
          var pair = vars[i].split("=");
          if (pair[0] == variable) {
            return pair[1];
          }
        } 
        console.log('Query Variable ' + variable + ' not found');
        return null;
    }
    function entryPoint(){
        var msg = getQueryVariable('msg');
        if(msg){
            $scope.mostrar_mensaje_login = true;
            if(msg == 'user_not_found'){
                $scope.resultado_login = 'User not found. Contact your administrator to get credentials.';
                $.alert({
                    title: 'Error!',
                    content: 'User not found. Contact your administrator to get credentials!',
                });
            }
        }
    }
    entryPoint();
}]);

