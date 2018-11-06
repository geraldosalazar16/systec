
var app = angular.module('usersApp',['cgNotify']);

app.controller('users', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    var loading;
    $scope.Usuarios = Array();
    $scope.formData = Array();
    $scope.nombre_usuario = sessionStorage.nombre;
    $scope.permisos = {
        administrar_usuarios: sessionStorage.administrar_usuarios,
        agregar_wf: sessionStorage.agregar_wf,
        cargar_primavera: sessionStorage.cargar_primavera,
        cargar_smartsheet: sessionStorage.cargar_smartsheet,
        editar_wf: sessionStorage.editar_wf,
        eliminar_wf: sessionStorage.eliminar_wf
    }

    function cargarUsuarios(){
        $http.get('/getUsuarios')
        .then(function(response) {
            if(response){
                $scope.Usuarios = response.data;                
            }
            else{
                $.alert({
                    title: 'Error!',
                    content: 'Failed to load users!',
                });
            }
        });
    }
    function cargarPerfiles(){
        $http.get('/getPerfiles')
        .then(function(response) {
            if(response){
                $scope.Perfiles = response.data;                
            }
            else{
                $.alert({
                    title: 'Error!',
                    content: 'Failed to load profiles!',
                });
            }
        });
    }
    function limpiar_modal_usuario(){
        $scope.formData.nombre_usuario = '';
        $scope.formData.correo = '';
        $scope.formData.pwd = '';
        $scope.formData.token_ss = '',
        $scope.formData.usuario_primavera = '';
        $scope.formData.pwd_primavera = '';
        $scope.formData.url_primavera = '';
        $scope.formData.id_perfil = $scope.Perfiles[0].ID;
    }
    $scope.agregarUsuario = function(){
        $scope.modal_titulo = 'Insert new user';
        limpiar_modal_usuario();
        $scope.accion = 'insertar';
        $("#modalInsertarActualizar").modal("show");
    }
    $scope.editarUsuario = function(id_usuario){
        var found = $scope.Usuarios.find(function(usuario) {
            return usuario.ID == id_usuario;
        });
        if(found){
            $scope.formData.nombre_usuario = found.NOMBRE;
            $scope.formData.correo = found.CORREO;
            $scope.formData.pwd = found.CONTRASENA;
            $scope.formData.token_ss = found.TOKEN,
            $scope.formData.usuario_primavera = found.USUARIO_PRIMAVERA;
            $scope.formData.pwd_primavera = found.PWD_PRIMAVERA;
            $scope.formData.url_primavera = found.URL_PRIMAVERA;
            $scope.formData.id_perfil = found.ID_PERFIL;
            $scope.formData.id = id_usuario;
            $scope.modal_titulo = 'Edit user';
            $scope.accion = 'editar';
            $("#modalInsertarActualizar").modal("show");
        }
        else{
            $.alert({
                title: 'Error!',
                content: 'User not found!',
            });
        }
    }
    $scope.eliminarUsuario = function(id_usuario){
        $.confirm({
            title: 'Confirm!',
            content: 'You are about to delete this user, are you sure?',
            buttons: {
                confirm: function () {
                    $http.get('/deleteUsuario',{params:{id_usuario: id_usuario}}).
                    then(function(response){
                        cargarUsuarios();
                    });
                },
                cancel: function () {
                    
                }
            }
        });
    }
    $scope.submitForm = function (formData) {
        //alert('Form submitted with' + JSON.stringify(formData));
        if($scope.accion == 'insertar'){
            var datos = {
                nombre_usuario: formData.nombre_usuario,
                correo: formData.correo,
                pwd: $scope.formData.pwd,
                token_ss: $scope.formData.token_ss,
                usuario_primavera: $scope.formData.usuario_primavera,
                pwd_primavera: $scope.formData.pwd_primavera,
                url_primavera: $scope.formData.url_primavera,
                id_perfil: $scope.formData.id_perfil
            };
            $http.post('/guardarUsuario',datos).
            then(function(response){
                if(response){
                    cargarUsuarios();
                }
                else{
                    $.alert({
                        title: 'Error!',
                        content: 'Failed to load users!',
                    });
                }
                $("#modalInsertarActualizar").modal("hide");
            });
        }
        else if($scope.accion == 'editar'){
            var datos = {
                id: formData.id,
                nombre_usuario: formData.nombre_usuario,
                correo: formData.correo,
                pwd: $scope.formData.pwd,
                token_ss: $scope.formData.token_ss,
                usuario_primavera: $scope.formData.usuario_primavera,
                pwd_primavera: $scope.formData.pwd_primavera,
                url_primavera: $scope.formData.url_primavera,
                id_perfil: $scope.formData.id_perfil
            };
            $http.post('/editarUsuario',datos).
            then(function(response){
                if(response){
                    cargarUsuarios();
                }
                else{
                    $.alert({
                        title: 'Error!',
                        content: 'Failed to edit users!',
                    });
                }
                $("#modalInsertarActualizar").modal("hide");
            });
        }
    };
    cargarUsuarios();
    cargarPerfiles();
}]);