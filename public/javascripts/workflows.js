
var app = angular.module('workflowApp',['cgNotify']);

app.controller('workflow', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    var loading;
    //Socket IO
    $scope.progreso = 0;
    $scope.descripcion_progreso = '';
    var socket;
    socket = io.connect(url,{'forceNew' : true});
    socket.on('mensaje', function(data) {
        $scope.descripcion_progreso = data;
        $scope.$apply();
    });
    socket.on('progreso', function(data) {
        $scope.progreso = data;
        $('#bar').css('width', $scope.progreso + '%');
        $scope.$apply();
    });

    $scope.nombre_usuario = sessionStorage.nombre;
    $scope.permisos = {
        administrar_usuarios: sessionStorage.administrar_usuarios,
        agregar_wf: sessionStorage.agregar_wf,
        cargar_primavera: sessionStorage.cargar_primavera,
        cargar_smartsheet: sessionStorage.cargar_smartsheet,
        editar_wf: sessionStorage.editar_wf,
        eliminar_wf: sessionStorage.eliminar_wf
    }
    
    $scope.agregarWorkFlow = function(){
        sessionStorage.accion = 'insertar';
        sessionStorage.id_wf = 0;
        $window.location.href = 'main';
    }
    function cargarWorkFlows(){
        loading = $.alert({
            icon: 'fa fa-spinner fa-spin',
            title: 'Working!',
            content: 'Sit back, we are processing your request!',
            closeIcon: false
        });
        loading.open();
        //Para cargar todos los workflows almacenados en la base de datos
        $http.get('/getWorkflows')
        .then(function(response) {
            
            if(response){
                $scope.WorkFlows = response.data;
                $scope.WorkFlows = ordenar_alfabeticamente($scope.WorkFlows,'NOMBRE_WF');
            }
            loading.close();
        });
    }
    $scope.ejecutarWF = function(workflow){
        //Validacion de que exista el proyecto
        workflow.ID_PROYECTO_PRIMAVERA
        //Validación de que exista la hoja
        workflow.ID_HOJA_SMARTSHEET
        $.confirm({
            title: 'Confirm!',
            content: 'You are about to run the workflow, are you sure?',
            buttons: {
                confirm: function () {
                    /*
                    loading = $.dialog({
                        icon: 'fa fa-spinner fa-spin',
                        title: 'Working!',
                        content: 'Sit back, we are processing your request!',
                        closeIcon: false
                    });
                    */
                   $('#modalProgreso').modal('show');
                   $scope.progreso = 5;
                   $scope.descripcion_progreso = 'Reading binds...';
                   $('#bar').css('width', $scope.progreso + '%');

                    var id_wf = workflow.ID_WF;           

                    $http.get('/getRelaciones',{params: {id_wf:id_wf}}).
                    then(function(response){
                        //COLUMNA_PRIMAVERA
                        //COLUMNA_SMARTSHEET
                        $scope.progreso = 15;
                        $scope.descripcion_progreso = 'Binds loaded, connecting to server...';
                        $('#bar').css('width', $scope.progreso + '%');            
                        var enlaces  = Array();
                        response.data.forEach(element => {
                            //Contruir cada uno de los enlaces
                            var enlace = {
                                columna_primavera: element.COLUMNA_PRIMAVERA,
                                columna_smartsheet: element.COLUMNA_SMARTSHEET,
                                id_columna_primavera: element.ID_COLUMNA_PRIMAVERA,
                                tipo_columna_primavera: element.TIPO_COLUMNA_PRIMAVERA,
                                tipo_filtro: element.TIPO_FILTRO,
                                valor_filtro: element.VALOR1_FILTRO,
                                logica_filtro: element.LOGICA_FILTRO
                            };
                            enlaces.push(enlace);
                        });
                        
                        var factor_duracion = workflow.DURATION_FACTOR;
                                            
                        //Esta es la variable que lo contiene todo
                        var info = {
                            id_proyecto_primavera: workflow.ID_PROYECTO_PRIMAVERA,
                            nombre_proyecto_p6: workflow.NOMBRE_PROYECTO_PRIMAVERA,
                            id_hoja_ss: workflow.ID_HOJA_SMARTSHEET,
                            enlaces: enlaces,
                            factor_duracion: workflow.DURATION_FACTOR
                        };
                        //Ahora paso esta variable a la rutina que hace la insercion
                        $http.post('/cargarDatos',info).
                        then(function(response){
                            if(response.data['resultado'] == 'ok'){                                             
                                $scope.progreso = 75;
                                $scope.descripcion_progreso = 'Data loaded into Smartsheet!';
                                $('#bar').css('width', $scope.progreso + '%');
                                //Si la respuesta es positiva actualizar la ultima fecha de ejecucion
                                $http.get('/updateUltimaFechaWF',{params:{id_wf: id_wf}}).
                                then(function(response){
                                    $('#bar').css('width', 100 + '%');
                                    $('#modalProgreso').modal('hide');
                                    //loading.close();
                                    $.alert({
                                        title: 'Success!',
                                        content: 'Successfull run!',
                                        buttons: {
                                            OK: function () {
                                                cargarWorkFlows();
                                            }
                                        }
                                    });
                                });                                 
                            }
                            else{
                                var mensaje = '';
                                if(response.data['descripcion']) 
                                    mensaje = '<strong>Description:</strong> '+response.data['descripcion'];
                                if(response.data['message'])
                                    mensaje += ' <br><strong>Error:</strong> '+response.data['message'];
                                if(response.data['sugerencia'])
                                    mensaje += '<br><strong>Suggestion:</strong> '+response.data['sugerencia'];              
                                $.alert({
                                    title: 'Error!',
                                    content: 'Failed to run workflow!<br> '+mensaje,
                                });
                                $('#bar').css('width', 100 + '%');
                                $('#modalProgreso').modal('hide');
                                //loading.close();                                
                            }
                        }).catch(function(error){
                            var mensaje = '';
                                if(error['descripcion']) 
                                    mensaje = '<strong>Description:</strong> '+response.data['descripcion'];
                                if(error['message'])
                                    mensaje += ' <br><strong>Error:</strong> '+response.data['message'];
                                if(response['sugerencia'])
                                    mensaje += '<br><strong>Suggestion:</strong> '+response.data['sugerencia'];              
                                $.alert({
                                    title: 'Error!',
                                    content: 'Failed to run workflow!<br> '+mensaje,
                                });
                                $('#bar').css('width', 100 + '%');
                                $('#modalProgreso').modal('hide');
                                //loading.close();                         
                        });
                    });
                },
                cancel: function () {
                    
                }
            }
        });        
    }
    $scope.editarWF = function(workflow){
        sessionStorage.accion = 'editar';
        sessionStorage.id_wf = workflow.ID_WF;
        $window.location.href = 'main';
    }
    $scope.eliminarWF = function(workflow){
        $.confirm({
            title: 'Confirm!',
            content: 'Do you want to delete this workflow?',
            buttons: {
                confirm: function () {
                    $http.get('/deleteWorkflow',{params:{id_wf:workflow.ID_WF}}).
                    then(function(response){
                        if(response){
                            /*
                            var notificacion = {
                                classes: 'alert-success',                
                                messageTemplate: '<span><i class="fas fa-check-square"></i> Workflow deleted!</span>', 
                                duration: 2500,
                                position: 'right'
                            };
                            notify(notificacion);
                            */
                           $.alert({
                                title: 'Success!',
                                content: 'Workflow deleted!',
                            });
                            cargarWorkFlows();
                        }
                        else{
                            /*
                            var notificacion = {
                                classes: 'alert-warning',                
                                messageTemplate: '<span><i class="fas fa-exclamation-circle"></i> Error, no data deleted</span>', 
                                duration: 2500,
                                position: 'right'
                            };
                            notify(notificacion);
                            */
                           $.alert({
                                title: 'Error!',
                                content: 'Cannot delete workflow!',
                            });
                            cargarWorkFlows();
                        }
                    });
                            },
                cancel: function () {
                            
                }
            }
        });
    }
    $scope.cargarPrimavera = function(workflow){
        $.confirm({
            title: 'Confirm!',
            content: 'You are about to load the information back to primavera, are you sure?',
            buttons: {
                confirm: function () {
                    //Muestro el loader y deshabilito los controles
                    //$('.loading').show();
                    loading = $.dialog({
                        icon: 'fa fa-spinner fa-spin',
                        title: 'Working!',
                        content: 'Sit back, we are processing your request!',
                        closeIcon: false
                    });
                    //document.getElementById("loader").style.display = "inline";
                    //$("#container").children().prop('disabled',true);

                    //Necesito armar la variable con toda la informacion para hacer la carga
                    //Para eso uso la informacion de relacion en la tabla workflows_hojas_columnas

                    var id_wf = workflow.ID_WF;           

                    var factor_duracion = workflow.DURATION_FACTOR;
                                            
                    //Esta es la variable que lo contiene todo
                    var info = {
                        id_proyecto_primavera: workflow.ID_PROYECTO_PRIMAVERA,
                        id_hoja_ss: workflow.ID_HOJA_SMARTSHEET,
                        factor_duracion: workflow.DURATION_FACTOR
                    };
                    //Ahora paso esta variable a la rutina que hace la insercion
                    $http.post('/cargarDatosPrimavera',info).
                    then(function(response){
                        if(response.data['resultado'] == 'ok'){                                                   
                            $.alert({
                                title: 'Success!',
                                content: 'Successfull run!',
                            });                                
                            loading.close();                                 
                        }
                        else{                                                
                            var mensaje = '';
                            if(response.data['descripcion']) 
                                mensaje = '<strong>Description:</strong> '+response.data['descripcion'];
                            if(response.data['message'])
                                mensaje += ' <br><strong>Error:</strong> '+response.data['message'];
                            if(response.data['sugerencia'])
                                mensaje += '<br><strong>Suggestion:</strong> '+response.data['sugerencia'];              
                            $.alert({
                                title: 'Error!',
                                content: 'Failed to run workflow!<br> '+mensaje,
                            });
                            loading.close();                                 
                        }
                    }).catch(function(error){
                        var mensaje = '';
                        if(error['descripcion']) 
                            mensaje = '<strong>Description:</strong> '+response.data['descripcion'];
                        if(error['message'])
                            mensaje += ' <br><strong>Error:</strong> '+response.data['message'];
                        if(response['sugerencia'])
                            mensaje += '<br><strong>Suggestion:</strong> '+response.data['sugerencia'];              
                        $.alert({
                            title: 'Error!',
                            content: 'Failed to run workflow!<br> '+mensaje,
                        });
                        loading.close();                        
                    });
                },
                cancel: function () {
                    
                }
            }
        });
    }
    function cargarProyetos(){
        $http.get('/getPortafolio')
        .then(function(response) {            
            if(response){
                $scope.Portafolio = response.data;
            }
        });
    }  
    function ordenar_alfabeticamente(list,field){
        return list.sort(function (a, b) {
            if (a[field] > b[field]) {
              return 1;
            }
            if (a[field] < b[field]) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
    }  
    cargarWorkFlows();
}]);