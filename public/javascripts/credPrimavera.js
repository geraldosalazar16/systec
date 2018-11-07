
var app = angular.module('usersApp',['cgNotify']);

app.controller('credPrimavera', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
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
}]);