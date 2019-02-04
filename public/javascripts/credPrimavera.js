
var app = angular.module('usersApp',['cgNotify']);

app.controller('credPrimavera', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    $scope.nombre_usuario = sessionStorage.nombre;
    $scope.submitForm = function(formData) {
        //Envir credenciales al servidor
        sessionStorage.pwd_primavera = $scope.formData.pwd_primavera;
        sessionStorage.url_primavera = $scope.formData.url_primavera;
        sessionStorage.usuario_primavera = $scope.formData.usuario_primavera;

        var datos = {
            usuario_primavera: $scope.formData.usuario_primavera,
            pwd_primavera: $scope.formData.pwd_primavera,
            url_primavera: $scope.formData.url_primavera
        };
        $http.post('/setP6',datos).
        then(function(response){
            if(response){
                $window.location.href = 'workflows';
            }
            else{
                $.alert({
                    title: 'Error!',
                    content: 'Failed to load the information!',
                });
            }
        });
    }
    $scope.justificacion = function(){
        
        $.alert({
            title: '',
            content: 'For security reasons, we don´t store this information.<br> ',
            buttons: {
                OK: {
                    text: 'OK, I GOT IT!',
                    btnClass: 'btn-success',
                    action: function(){}
                }
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
        var validar = getQueryVariable('validar');
        if(validar == 'true'){
            //Si viene con el parámetro validar 
            //debo checar contra el servidor que las credenciales existan y traerlas
            $http.post('/validarCredenciales','').
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
                        var agregar_template = permisos.find(function(element){
                            return element['ID_PERMISO'] == 11;
                        });
                        var editar_template = permisos.find(function(element){
                            return element['ID_PERMISO'] == 12;
                        });
                        var eliminar_template = permisos.find(function(element){
                            return element['ID_PERMISO'] == 13;
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

                        sessionStorage.agregar_template = agregar_template['VALOR'];
                        sessionStorage.editar_template = editar_template['VALOR'];
                        sessionStorage.eliminar_template = eliminar_template['VALOR'];

                        //$window.location.href = 'credPrimavera';
                    }
                    else{
                        $window.location.href = 'login?msg=bad_credentials';
                    }
                }
                else{
                    $window.location.href = 'login?msg=bad_credentials';
                }
            });
        }
    }
    entryPoint();
}]);