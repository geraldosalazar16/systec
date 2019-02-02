var app = angular.module('MyApp',['cgNotify']);

app.controller('templates', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    //Control de sesion
    $scope.nombre_usuario = sessionStorage.nombre;
    $scope.permisos = {
        administrar_usuarios: sessionStorage.administrar_usuarios,
        agregar_wf: sessionStorage.agregar_wf,
        cargar_primavera: sessionStorage.cargar_primavera,
        cargar_smartsheet: sessionStorage.cargar_smartsheet,
        editar_wf: sessionStorage.editar_wf,
        eliminar_wf: sessionStorage.eliminar_wf,
        agregar_template: sessionStorage.agregar_template,
        editar_template: sessionStorage.editar_template,
        eliminar_template: sessionStorage.eliminar_template
    }
    //Variables de uso general
    $scope.loading; //para almacenar el modal de jquery de ocupado
    $scope.formData = Array();

    /****** Modal Edición inserción de templates */
    $scope.mostrarModalAgregarTemplate = async function(){
        $scope.accion = 'insertar';
        $scope.modal_titulo = "Insert Template";
        clear_modal_insertar_actualizar_template();
        $("#modalInsertarActualizar").modal("show");
    }
    function clear_modal_insertar_actualizar_template(){
        $scope.formData.tipo_template = "";
        $scope.formData.nombre = "";
        $scope.formData.workflow = "";
    }
    $scope.cambioTipoTemplate = async function(){
        var workflows_aux;
        if($scope.formData.tipo_template == 'project'){
            workflows_aux = $scope.WorkflowsProject;            
        } else if ($scope.formData.tipo_template == 'portafolio') {
            workflows_aux = $scope.WorkflowsPortafolio;
        }
        if(workflows_aux){
            $scope.Workflows = workflows_aux;
        } else {
            mostrarError('An error occured while loading the information');
        }               
    }
    $scope.submitForm = async function(formData){
        try{
            var id;
            if($scope.accion == 'insertar'){
                id = 0;
            } else if($scope.accion == 'editar'){
                id = formData.id;
            }
            var datos = {
                id: id,
                tipo_template: formData.tipo_template,
                nombre_template: formData.nombre,
                workflow: formData.workflow
            };
            await guardarTemplate(datos);
            $scope.Templates = await listarTemplates(sessionStorage.id);
            $scope.$apply();
            $("#modalInsertarActualizar").modal("hide");
        } catch(err){
            mostrarError(err);
        }
        
    }
    $scope.eliminarTemplate = async function(template){
        try{
            mostrarLoading();
            await eliminar_template(template.ID);            
            $scope.Templates = await listarTemplates(sessionStorage.id);
            $scope.$apply();
            cerrarLoading();
        } catch(err){
            mostrarError(err);
        }       
    }
    $scope.editarTemplate = function(template){
        $scope.accion = 'editar';
        $scope.formData.id = template.ID;
        $scope.formData.tipo_template = template.TIPO;
        if(template.TIPO =='project'){
            $scope.Workflows = $scope.WorkflowsProject;
        } else if(template.TIPO =='portafolio'){
            $scope.Workflows = $scope.WorkflowsPortafolio;
        }
        $scope.formData.nombre = template.NOMBRE;
        $scope.formData.workflow = template.ID_WORKFLOW;
        $scope.modal_titulo = "Edit workflow";
        $("#modalInsertarActualizar").modal("show");
    }
    $scope.verEnlaces = async function(template){
        try{
            mostrarLoading();
            $scope.Enlaces = await get_enlaces_template(template.ID);
            $scope.$apply();
            $("#modalVerEnlaces").modal("show");
            cerrarLoading();
        } catch(err){
            mostrarError(err);
        }        
    }
    /****** Fin Modal Edición inserción de templates  */

    //Funciones de acceso al servidor
    /****** Workflows */
    function cargarWorkflows(tipo){
        return new Promise((resolve,reject) => {
            if(tipo == 'project'){
                $http.get('/getWorkflows')
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => reject(error))
            } else if (tipo == 'portafolio') {
                $http.get('/getWorkflowsP')
                .then((result) => {
                    resolve(result.data)
                })
                .catch((error) => reject(error))
            }
        });        
    }
    /****** Fin Workflows */

    /****** Templates */
    function guardarTemplate(datos){
        return new Promise((resolve,reject) => {
            $http.post('/guardarTemplate',datos)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => reject(error))
        });        
    }
    function listarTemplates(id_usuario){
        return new Promise((resolve,reject) => {
            $http.get('/listarTemplates?id_usuario='+id_usuario)
            .then((result) => {
                resolve(result.data)
            })
            .catch((error) => reject(error))
        });
    }
    function eliminar_template(id_template){
        return new Promise((resolve,reject) => {
            $http.get('/eliminarTemplate?id_template='+id_template)
            .then((result) => {
                resolve(result.data)
            })
            .catch((error) => reject(error))
        });
    }
    function get_enlaces_template(id_template){
        return new Promise((resolve,reject) => {
            $http.get('/getEnlacesTemplate?id_template='+id_template)
            .then((result) => {
                resolve(result.data)
            })
            .catch((error) => reject(error))
        });
    }
    /****** Fin templates */
    //Fin funciones de acceso al servidor

    //Funciones de uso general
    function mostrarLoading(){
        $scope.loading = $.dialog({
            icon: 'fa fa-spinner fa-spin',
            title: 'Working!',
            content: 'Loading information...',
            closeIcon: false
        });
    }
    function cerrarLoading(){
        if($scope.loading){
            $scope.loading.close();
        }
    }
    function mostrarError(content){
        $.alert({
            title: 'Error!',
            content: content
        });
    }
    //Fin Funciones de uso general

    //Carga inicial
    async function cargaInicial(){
        mostrarLoading();
        try{
            var p1 = cargarWorkflows('project');
            var p2 = cargarWorkflows('portafolio');
            var p3 = listarTemplates(sessionStorage.id);
            Promise.all([p1, p2, p3]).then(values => { 
                $scope.WorkflowsProject = values[0];
                $scope.WorkflowsPortafolio = values[1];
                $scope.Templates = values[2];
                $scope.$apply();
                cerrarLoading();
            }); 
        } catch (err){
            mostrarError(err);
            cerrarLoading();
        }
               
    }

    //Entry point
    cargaInicial();
}]);
