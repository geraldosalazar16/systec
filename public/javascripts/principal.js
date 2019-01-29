var app = angular.module('MyApp',['cgNotify']);

app.controller('principal', ['$scope', '$http','$window','notify', function($scope, $http,$window,notify) { 
    //Control de sesion
    $scope.nombre_usuario = sessionStorage.nombre;
    $scope.permisos = {
        administrar_usuarios: sessionStorage.administrar_usuarios,
        agregar_wf: sessionStorage.agregar_wf,
        cargar_primavera: sessionStorage.cargar_primavera,
        cargar_smartsheet: sessionStorage.cargar_smartsheet,
        editar_wf: sessionStorage.editar_wf,
        eliminar_wf: sessionStorage.eliminar_wf
    }
    $scope.accion = sessionStorage.accion;
    $scope.id_wf = sessionStorage.id_wf;
    $scope.id_enlace_actual = 0;
    $scope.cmbLogica = 'Inclusive'; //AND por defecto
    $scope.mostrarLogica = false; //Por defecto no aparece

    //Variables de uso general
    $scope.loading; //para almacenar el modal de jquery de ocupado
    $scope.proyecto_actual;
    $scope.wf_actual;
    //para cambiar el texto del boton salvar enlace
    $scope.accion_enlace = 'Create';
    //Mostrar el nombre del proyecto cuando se carga
    $scope.mostrarNombreProyecto = false;
    //Tipo de filtro cualquier valor por defecto
    $scope.tipo_filtro = 'Any';

    //Variables globales para los tabs
    var currentTab = 0; // Current tab is set to be the first tab (0)
    showTab(currentTab); // Display the current tab

    $scope.comentariosWorkflow = "";

    //Mostrar nombre del proyecto   
    $scope.mostrarNombreProyecto = false;

    //Para guardar la relacion entre columna P6 y SS
    $scope.Enlaces = Array();
    $scope.Proyectos = Array();
    $scope.columnasP6 = Array();
    $scope.columnasP6Fijas = Array();
    $scope.columnasP6Codes = Array();
    $scope.columnasP6UDFs = Array();
    $scope.columnasP6Todas = Array();
    $scope.columnasSS = Array();
    $scope.Hojas = Array();

    //Estas variables me sirven para determinar si ya se cargaron las hojas y los proyectos
    //Mientras no esten cargados no hago nada
    $scope.hojas_listas = 0;
    $scope.proyectos_listos = 0;

    //Bloquear hojas y proyectos cuando es edicion
    $scope.bloquear_hojas = false;
    $scope.bloquear_proyectos = false;
    //Bloquear columnas de primavera y ss cuando es edicion de bind
    $scope.bloquear_columna_p6 = false;
    $scope.bloquear_columna_ss = false;

    //Funciones para el control de los tabs
    function showTab(n) {
        // This function will display the specified tab of the form ...
        var x = document.getElementsByClassName("tab");
        x[n].style.display = "block";
        // ... and fix the Previous/Next buttons:
        if (n == 0) {
            document.getElementById("prevBtn").style.display = "none";
        } 
        else {
            document.getElementById("prevBtn").style.display = "inline";
        }
        if (n == (x.length - 1)) {
            document.getElementById("nextBtn").innerHTML = "Finish";
        } else {
            document.getElementById("nextBtn").innerHTML = "Next";
        }
        // ... and run a function that displays the correct step indicator:
        fixStepIndicator(n);
    }
    $scope.nextPrev =  function(n) {
        // This function will figure out which tab to display
        var x = document.getElementsByClassName("tab");
        // Exit the function if any field in the current tab is invalid:
        var validar_tab = false;
        if(currentTab == 0){
            validar_tab = validar_tab_1();
        }
        else if(currentTab == 1){
            validar_tab = validar_tab_2();
        }
        if (n == 1 && !validar_tab){
            return false;
        } 
        // Hide the current tab:
        x[currentTab].style.display = "none";
        // Increase or decrease the current tab by 1:
        currentTab = currentTab + n;
        // if you have reached the end of the form... :
        if (currentTab >= x.length) {
            //Aca enviar los datos
            //$scope.almacenarEnlaces();
            if($scope.accion == 'editar'){
                $.alert({
                    title: 'Success!',
                    content: 'Workflow saved!',
                });
            }
            else{
                $.alert({
                    title: 'Success!',
                    content: 'Workflow created!',
                });
            }
            $window.location.href = 'workflows';
            
            return false;
        }
        // Otherwise, display the correct tab:
        //Aca insertar el workflow si es nuevo
        $scope.almacenarWorkflow();
        
        showTab(currentTab);
    }
    function validar_tab_1(){
        if(!$scope.workflowName){
            /*
            var notificacion = {
                classes: 'alert-warning',                
                messageTemplate: '<span><i class="fas fa-exclamation-circle"></i> Name the workflow</span>', 
                duration: 2500,
                position: 'right'
            };
            notify(notificacion);
            */
           $.alert({
                title: 'Error!',
                content: 'Name the workflow!',
            });
            return false;
        }
        if(!$scope.cmbHojas){
            /*
            var notificacion = {
                classes: 'alert-warning',                
                messageTemplate: '<span><i class="fas fa-exclamation-circle"></i> Select a sheet</span>', 
                duration: 2500,
                position: 'right'
            };
            notify(notificacion);
            */
           $.alert({
                title: 'Error!',
                content: 'Select a sheet!',
            });
            return false;
        }
        if(!$scope.cmbProyectos){
            /*
            var notificacion = {
                classes: 'alert-warning',                
                messageTemplate: '<span><i class="fas fa-exclamation-circle"></i> Select a project</span>', 
                duration: 2500,
                position: 'right'
            };
            notify(notificacion);
            */
           $.alert({
                title: 'Error!',
                content: 'Select a project!',
            });
            return false;
        }
        return true;
    }  
    function validar_tab_2(){
        if($scope.Enlaces.length <= 0 || !$scope.Enlaces){
            /*
            var notificacion = {
                classes: 'alert-warning',                
                messageTemplate: '<span><i class="fas fa-exclamation-circle"></i> No bind created</span>', 
                duration: 2500,
                position: 'right'
            };
            notify(notificacion);
            */
           $.alert({
                title: 'Error!',
                content: 'No bind created!',
            });
            return false;
        }
        return true;
    }

    function fixStepIndicator(n) {
        // This function removes the "active" class of all steps...
        var i, x = document.getElementsByClassName("step");
        for (i = 0; i < x.length; i++) {
            x[i].className = x[i].className.replace(" active", "");
        }
        //... and adds the "active" class to the current step:
        x[n].className += " active";
      }
    //Fin del control de los tabs
    
    function setDatePicker(){
        $('#inputDatePicker').datepicker({
            language: 'en',
            minDate: new Date() // Now can select only dates, which goes after today
        })
    }
    function cargarDatosSS(){
        //Obtener cual es la hoja seleccionada
        var hoja_seleccionada = $scope.cmbHojas;
        if(!hoja_seleccionada){
           $.alert({
                title: 'Error!',
                content: 'No sheet selected!',
            });
        }
        else if(!$scope.Actividades){
           $.alert({
                title: 'Error!',
                content: 'No activities loaded!',
            });
        }
        else{
            //Esto hay que hacerlo dinamico
            var columnas = [
                {
                    col0: 'id_wbs'
                },
                {
                    col1: 'codigo_actividad'
                },
                {
                    col2: 'nombre_actividad'
                },
                {
                    col3: 'duracion_inicial'
                }
            ];
            var hoja = {
                nombre: $scope.cmbHojas.nombre,
                id: $scope.cmbHojas.id,
                columnas: JSON.stringify(columnas),
                datos: JSON.stringify($scope.Actividades)
            };
            $http.post('/cargar',hoja).
            then(function(response){
                if(response.data === 'ok'){
                   $.alert({
                        title: 'Success!',
                        content: 'Data loaded!',
                    });
                }
                else{
                    var mensaje = response.data.message;
                   $.alert({
                        title: 'Error!',
                        content: mensaje,
                    });
                }
            })
            .catch(function(error){
                var texto_error;
                if(error.message){
                   texto_error = error.message;
                }
                else{
                    texto_error = 'Error';
                }
                $.alert({
                    title: 'Error!',
                    content: texto_error
                });   
            });
        }
    }
    function getHojas(){
        return new Promise((resolve,reject) => {
            $http.post('/leer')
            .then((result) => {
                $scope.Hojas = result.data;
                $scope.Hojas = ordenar_alfabeticamente($scope.Hojas,'nombre');
                resolve(result)
            })
            .catch((error) => reject(error))
        });
    }
    function getHojaSS(id_hoja,llenar_listado){
        return new Promise((resolve,reject) => {
            $http.get('/getHojaSS',{params: {id_hoja : id_hoja}})
            .then((result) => {
                if(llenar_listado){
                    $scope.Hojas[0] = result.data;
                    $scope.cmbHojas = $scope.Hojas[0];
                }
                resolve(result)
            })
            .catch((error) => reject(error))
        });
    }
    async function cargarHojas(){
        $scope.Hojas = await getHojas();
        $scope.Hojas = $scope.Hojas.data;
        $scope.hojas_listas = 1;
            //Si estan ambos cargados reviso si es edicion para cargar la informacion
            if($scope.hojas_listas == 1 && $scope.proyectos_listos == 1){
                //Si es edicion hay que cargar la información del workflow
                if($scope.accion == 'editar'){
                    await $scope.cargarWorkflow();
                }
                //Cierro el loading
                $scope.loading.close();
                $scope.hojas_listas = 0;
            }
    }
    function cargarWorkflow(){
        return new Promise((resolve,reject) => {
            $http.get('/getWorkflowByID',{params: {id_wf:$scope.id_wf}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        }).
        catch((err) => {
            console.log(err);
        });
    }
    function cargarCalendario(){
        return new Promise((resolve,reject) => {
            $http.get('/getCalendario',{params: {id_calendario:$scope.proyecto_actual.ActivityDefaultCalendarObjectId}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        })
    }
    function getActividades(){
        return new Promise((resolve,reject) => {
            $http.get('/getActividades',{params: {id_proyecto:$scope.proyecto_actual.ObjectId}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }
    function getActivityCodeTypesByProjectId(){
        return new Promise((resolve,reject) => {
            $http.get('/getActivityCodeTypesByProjectId',{params: {id_proyecto:$scope.proyecto_actual.ObjectId}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }
    function getActivityCodes(){
        return new Promise((resolve,reject) => {
            $http.get('/getActivityCodes',{params: {id_proyecto:$scope.proyecto_actual.ObjectId}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }
    function getRelacionesActividadCodigo(){
        return new Promise((resolve,reject) => {
            $http.get('/getRelacionesActividadCodigo',{params: {id_proyecto:$scope.proyecto_actual.ObjectId}})
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }
    function cargarActividades(){
        return new Promise((resolve,reject) => {
            var promiseActividades = getActividades();
            var promiseActivityCodeType = getActivityCodeTypesByProjectId();
            var promiseActivityCode = getActivityCodes();
            var promiseRelActivityCodes = getRelacionesActividadCodigo();

            Promise.all([promiseActividades, promiseActivityCodeType,promiseActivityCode,promiseRelActivityCodes])
            .then(values => { 
                $scope.actividades = values[0].data.Activity
                $scope.activity_code_types = values[1].data.ActivityCodeType;
                $scope.activity_codes = values[2].data.ActivityCode;
                $scope.relaciones_actividades_codigos = values[3].data.ActivityCodeAssignment;
                //Si existen relaciones
                if($scope.relaciones_actividades_codigos && $scope.relaciones_actividades_codigos.length > 0){
                    //Arreglo pàra almacenar las posibles columnas
                    var columnas = Array();
                    //Cargo el primer valor apra que tenga algo
                    columnas[0] = {
                        TIPO: 'activity_code_type',
                        ID: $scope.relaciones_actividades_codigos[0]['ActivityCodeTypeObjectId'],
                        NOMBRE: $scope.relaciones_actividades_codigos[0]['ActivityCodeTypeName'],
                        TIPO_WORKFLOW: 'PROYECTO'
                    };
                    //Recorro todas las relaciones
                    $scope.relaciones_actividades_codigos.forEach(relacion => {
                        //variable para indicar si se encontro el tipo de codigo entre las relaciones
                        var found = 0;
                        columnas.forEach(columna => {
                            //para cada uno de los valores salvados verifico si es igual al tipo de codigo actual
                            //Si no aparece debo agregar ese tipo de codigo a las posibles columnas
                            //Si aparece es porque ya lo agregue antes y sigo buscando
                            if(columna.ID == relacion.ActivityCodeTypeObjectId){
                                found = 1;
                                return;
                            }
                        });
                        if(found == 0){
                            columnas.push({
                                TIPO: 'activity_code_type',
                                ID: relacion.ActivityCodeTypeObjectId,
                                NOMBRE: relacion.ActivityCodeTypeName,
                                TIPO_WORKFLOW: 'PROYECTO'
                            });
                        }
                        else{
                            found = 0;
                        }
                    });
                    //Agrego columnas adicionales a las encontradas en la base de datos que son fijas
                    if(columnas[0]){
                        columnas.forEach(columna => {
                            agregar_columna_p6('code',columna);
                        });
                    }
                    resolve('success');
                }
                else{
                    resolve('No relations between activities and activity codes found');
                }
            }).
            catch((err) => {
                reject(err);
            });
        });
    }
    //Funciones UDF
    function getUDFs(){
        return new Promise((resolve,reject) => {
            //Buscar las tablas en la base de datos
            $http.get('/getUDFs?area=Task').
            then(function(response){
                if(response.data == 'error'){
                    reject(response);
                }
                else{
                    udfs = response.data.UDFType;

                    var columnasUDFs = [];
                    udfs.forEach(udf => {
                        columnasUDFs.push({
                            TIPO: 'udf',
                            ID: udf.ObjectId,
                            NOMBRE: udf.Title,
                            TIPO_WORKFLOW: 'TASK',
                            TIPO_DATO: udf.DataType
                        });
                    });  
                    //Agrego las columnas de udf
                    if(columnasUDFs[0]){
                        columnasUDFs.forEach(columna => {
                            agregar_columna_p6('udf',columna);
                        });
                    } 
                    resolve(response);
                }
            }).
            catch(function(err){
                reject(err);
            });
        }) 
    }
    function getProyectos(){
        return new Promise((resolve,reject) => {
            $http.get('/leerProyectosP6')
            .then((result) => {
                resolve(result)
            })
            .catch((error) => reject(error))
        });
    }
    function getProyectoById(id_proyecto,llenar_listado){
        return new Promise((resolve,reject) => {
            $http.get('/getProyectoById',{params:{id_proyecto: id_proyecto}})
            .then((result) => {
                /*                
                if(llenar_listado){
                    $scope.Proyectos = Array();
                    $scope.Proyectos[0] = result.data.Project;
                    $scope.cmbProyectos = $scope.Proyectos[0];
                }   
                */             
                resolve(result)
            })
            .catch((error) => reject(error))
        });
    }
    async function cargarProyectos(){
        $scope.Proyectos = await getProyectos();
        $scope.Proyectos = $scope.Proyectos.data.Project;
        $scope.Proyectos = ordenar_alfabeticamente($scope.Proyectos,'Name');
        $scope.proyectos_listos = 1;
        //Si estan ambos cargados reviso si es edicion para cargar la informacion
        if($scope.hojas_listas == 1 && $scope.proyectos_listos == 1){
            //Si es edicion hay que cargar la información del workflow
            if($scope.accion == 'editar'){
                await $scope.cargarWorkflow();
            }
            //Cierro el loading
            $scope.loading.close();
            $scope.proyectos_listos = 0;
        }
        /*
        $http.get('/leerProyectosP6')
        .then(function(response) {
            $scope.Proyectos = response.data.Project;
            $scope.proyectos_listos = 1;
            //Si estan ambos cargados reviso si es edicion para cargar la informacion
            if($scope.hojas_listas == 1 && $scope.proyectos_listos == 1){
                //Si es edicion hay que cargar la información del workflow
                if($scope.accion == 'editar'){
                    $scope.cargarWorkflow();
                }
                //Cierro el loading
                $scope.loading.close();
                $scope.proyectos_listos = 0;
            }
        });
        */
    }
    function getEnlacesByWf(){
        return new Promise((resolve,reject) => {
            var params = {
                id_wf:$scope.id_wf,
                id_proyecto_primavera:$scope.wf_actual['ID_PROYECTO_PRIMAVERA'],
                id_hoja_smartsheet:$scope.wf_actual['ID_HOJA_SMARTSHEET']
            };
            $http.get('/getEnlacesByWF',{params: params}).
            then(function(response){
                resolve(response);
            }).
            catch(function(err){
                reject(err);
            })
        });
    }
    $scope.cambioProyecto = async function(){
        $scope.loading = $.dialog({
            icon: 'fa fa-spinner fa-spin',
            title: 'Working!',
            content: 'Loading project information, this might take some time...',
            closeIcon: false
        });
        if($scope.accion == 'editar'){
            await prcambioProyecto();
            $scope.loading.close();
        }
        else{
            await prcargarProyecto();
            $scope.loading.close();
        }    
    }
    function prcambioProyecto(){
        $scope.proyecto_actual = $scope.cmbProyectos;
        
        return new Promise((resolve,reject) => {

            var promiseActividades = cargarActividades();
            var promiseCalendario = cargarCalendario();
            var promiseColumnasP6 = cargarColumnasP6();

            Promise.all([promiseActividades,promiseCalendario,promiseColumnasP6])
            .then(values => { 
                if(values[2].data[0]){
                    values[2].data.forEach(columna => {
                        agregar_columna_p6('fija',columna);
                    });
                }
                if(values[1].data.Calendar[0].HoursPerDay)
                    $scope.factor_duracion = values[1].data.Calendar[0].HoursPerDay;
                else    
                    $scope.factor_duracion = 8;
                resolve();
            }).
            catch((err) => {
                reject(err);
            });
        });
    }
    function prcargarProyecto(){
        $scope.proyecto_actual = $scope.cmbProyectos;

        return new Promise((resolve,reject) => {
            var promiseActividades = cargarActividades();
            var promiseCalendario = cargarCalendario();
            var promiseColumnasP6 = cargarColumnasP6();

            Promise.all([promiseActividades,promiseCalendario,promiseColumnasP6])
            .then(values => { 
                if(values[2].data[0]){
                    values[2].data.forEach(columna => {
                        agregar_columna_p6('fija',columna);
                    });
                }
                if(values[1].data.Calendar[0].HoursPerDay)
                    $scope.factor_duracion = values[1].data.Calendar[0].HoursPerDay;
                else    
                    $scope.factor_duracion = 8;
                resolve();
            }).
            catch((err) => {
                reject(err);
            });            
        });
    }
    $scope.cambioHojas = function(){
        prcambioHojas().
        then(function(result){
            $scope.columnasSS = result.data;
        }). 
        catch(err => {
            console.log(err);
        })
    }
    function prcambioHojas(){

        var hoja = $scope.cmbHojas;
        return new Promise((resolve,reject) => {
            //Buscar las columnas de la hoja
            $http.post('/columnasSS',hoja)
            .then((result) => resolve(result))
            .catch((error) => reject(error))
        });
    }

    $scope.cambioColumnaP6 = function(){
        var nombre = $scope.cmbColumnasP6.NOMBRE;
        var tipo_columna = $scope.cmbColumnasP6.TIPO;
        var id_columna = $scope.cmbColumnasP6.ID;

        $scope.tipo_filtro = 'Any'; //Opcion pro defecto
        if(nombre == 'Status'){
            $scope.tipo_filtro = 'Equal';
            $scope.mostrarFiltroStatus = true;
            //Si hay elementos en enlaces hay que mostrar el filtro
            if($scope.Enlaces.length > 0){
                //Se deshabilita por ahora todo sera AND
                $scope.mostrarLogica = false;
            }
            else{
                $scope.mostrarLogica = false;
            }
        }
        else{
            $scope.mostrarFiltroStatus = false;
        }
        if(tipo_columna == 'activity_code_type'){
            $scope.tipo_filtro = 'Equal';
            //Seleccionar los activity codes que tienen como CodeTypeObject el id_columna
            $scope.ActivityCodesFiltrados = Array();
            var inicial = {
                CodeTypeObjectId: 0,
                CodeValue: 'All'
            };
            $scope.ActivityCodesFiltrados.push(inicial);
            $scope.activity_codes.forEach(element => {
                if(element.CodeTypeObjectId == id_columna){
                    $scope.ActivityCodesFiltrados.push(element);
                }
            });
            $scope.cmbActivityCode = inicial;
            $scope.mostrarFiltroActityCode = true;
            //Si hay elementos en enlaces hay que mostrar el filtro
            if($scope.Enlaces.length > 0){
                //Se deshabilita por ahora todo sera AND
                $scope.mostrarLogica = false;
            }
            else{
                $scope.mostrarLogica = false;
            }
        }
        else{
            $scope.mostrarFiltroActityCode = false;
        }
        if(nombre.includes('Date') || nombre.includes('date')){
            $scope.tipo_filtro = 'Any';
            $scope.mostrarSelectFechas = true;
            $scope.mostrarInputFechas = false;
            //Si hay elementos en enlaces hay que mostrar el filtro
            if($scope.Enlaces.length > 0){
                //Se deshabilita por ahora todo sera AND
                $scope.mostrarLogica = false;
            }
            else{
                $scope.mostrarLogica = false;
            }
        }
        else{
            $scope.mostrarSelectFechas = false;
            $scope.mostrarInputFechas = false;
        }
        if(tipo_columna == 'udf'){
            $scope.mostrarFiltroUDF = true;
        
            var tipo_dato = $scope.cmbColumnasP6.TIPO_DATO;
            $scope.tipo_dato = $scope.cmbColumnasP6.TIPO_DATO;
            if(tipo_dato == 'Cost' || tipo_dato == 'Double' || tipo_dato == 'Integer' || tipo_dato == 'Number'){
                $scope.mostrarcmbTipoFiltroUDFNum = true;
                $scope.cmbTipoFiltroUDFNum = 'Any';
                $scope.mostrarcmbTipoFiltroUDFText = false;
            } else if(tipo_dato == 'Text'){
                $scope.mostrarcmbTipoFiltroUDFNum = false;
                $scope.mostrarcmbTipoFiltroUDFText = true;
                $scope.cmbTipoFiltroUDFText = 'Any';
            } else if(tipo_dato == 'Indicator'){
                $scope.cmbUDFIndicador = 'Any';
                $scope.mostrarcmbTipoFiltroUDFIndicator = true;
            } else if(tipo_dato.includes('Date')){
                $scope.cmbSelectFechasUDF = 'Any';
                $scope.mostrarSelectFechasUDF = true;
                $scope.mostrarInputFechasUDF = false;
            }
        } else {
            $scope.mostrarcmbTipoFiltroUDFNum = false;
            $scope.mostrarcmbTipoFiltroUDFText = false;
            $scope.mostrarSelectFechasUDF = false;
            $scope.mostrarInputFechasUDF = false;
            $scope.mostrarcmbTipoFiltroUDFIndicator = false;
        }
    }
    function obtener_fecha_string (fecha){
        //Obtener la fecha de guardado
        var today = fecha;
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
    $scope.cambioSelectFechas = function(){
        var datepicker = $('#inputDatePicker').datepicker().data('datepicker');
        //
        $scope.tipo_filtro =$scope.cmbSelectFechas;
        if($scope.cmbSelectFechas == 'Range'){
            //datepicker.destroy();
            /*
            $('#cmbSelectFechas').datepicker({
                language: 'en',
                range: true,
                multipleDatesSeparator: ' - '
            })
            */
            /*
            // Single parameter update
            datepicker.update('range', true);
            datepicker.update('multipleDatesSeparator', " - ");
            $scope.$apply();
            */
           //datepicker.opts.range = true;
            datepicker.update({
                range: true,
                multipleDatesSeparator: " - "
            });
            var hoy = new Date();
            var manana=new Date(hoy.getTime() + 24*60*60*1000);
            hoy = obtener_fecha_string(hoy);
            manana = obtener_fecha_string(manana);
            $("#inputDatePicker").val(hoy + '-' + manana); 
            //$scope.inputDatePicker = hoy + '-' + manana;
        }
        else{

            /*
            $('#cmbSelectFechas').datepicker({
                language: 'en',
                range: true,
                multipleDatesSeparator: ' - '
            });
            */
           //datepicker.opts.range = false;
            datepicker.update({
                range: false
            });
            var hoy = new Date();
            hoy = obtener_fecha_string(hoy);
            $("#inputDatePicker").val(hoy); 
            //$scope.inputDatePicker = hoy;
        }
        if($scope.cmbSelectFechas == 'Any'){
            $scope.mostrarInputFechas = false;
        }
        else{
            $scope.mostrarInputFechas = true;
        }
    }
    $scope.agregarEnlace = function(data){
        var enlace = {
            id: data.ID,
            id_workflow: $scope.id_wf,
            id_p6: data.ID_COLUMNA_PRIMAVERA,
            NOMBRE_P6: data.COLUMNA_PRIMAVERA,
            tipo_columna_p6: data.TIPO_COLUMNA_PRIMAVERA,
            id_ss: data.COLUMNA_SMARTSHEET,
            NOMBRE_SS: data.NOMBRE_COLUMNA_SMARTSHEET,
            tipo_filtro: data.TIPO_FILTRO,
            valor_filtro: data.VALOR1_FILTRO,
            logica_filtro: data.LOGICA_FILTRO,
            descripcion: data.DESCRIPCION
        };
        $scope.Enlaces.push(enlace);
    }
    $scope.guardarEnlace = function(){
        //Determinar cual de los filtros esta activo
        if($scope.mostrarFiltroStatus == true){ //Filtro Status
            $scope.valor_filtro = $scope.cmbStatus;
        }
        else if($scope.mostrarFiltroActityCode == true){ //Filtro Activity Code
            $scope.valor_filtro = $scope.cmbActivityCode.CodeValue;
        }
        else if($scope.mostrarSelectFechas == true){ //Filtro Fechas
            //hay que verificar si es una fecha o es rango
            if($scope.cmbSelectFechas == 'Range'){
                $scope.valor_filtro = $("#inputDatePicker").val();
            }
            else{
                $scope.valor_filtro = $("#inputDatePicker").val();
            }
        }
        else if($scope.mostrarSelectFechasUDF == true){ //Filtro Fechas UDF
            //hay que verificar si es una fecha o es rango
            $scope.tipo_dato = $scope.cmbColumnasP6.TIPO_DATO;
            if($scope.cmbSelectFechasUDF == 'Range'){
                $scope.valor_filtro = $("#inputDatePickerUDF").val();
            }
            else{
                $scope.valor_filtro = $("#inputDatePickerUDF").val();
            }
        }
        else if($scope.mostrarFiltroUDF == true){
            //Necesito el tipo de dato del udf
            $scope.tipo_dato = $scope.cmbColumnasP6.TIPO_DATO;
            if($scope.mostrarcmbTipoFiltroUDFNum == true){
                if($scope.cmbTipoFiltroUDFNum == 'Between'){
                    $scope.valor_filtro = $scope.txtValorFiltroUDFNum1;
                    $scope.valor_filtro2 = $scope.txtValorFiltroUDFNum2;
                } else if($scope.cmbTipoFiltroUDFNum == 'Any'){
                    $scope.valor_filtro = 'Cualquier valor';
                } else {
                    $scope.valor_filtro = $scope.txtValorFiltroUDFNum1;
                }                
            }
            if($scope.mostrarcmbTipoFiltroUDFText == true){
                if($scope.cmbTipoFiltroUDFText == 'Any'){
                    $scope.valor_filtro = 'Cualquier valor';
                } else {
                    $scope.valor_filtro = $scope.txtValorFiltroUDFText;
                }                                
            }
            if($scope.mostrarcmbTipoFiltroUDFIndicator == true){
                if($scope.cmbTipoFiltroUDFIndicator == 'Any'){
                    $scope.valor_filtro = 'Cualquier valor';
                } else {
                    $scope.valor_filtro = $scope.cmbUDFIndicador;
                }
            }
        }
        else{
            $scope.valor_filtro = 'Cualquier valor';
        }
        //Construir la descripcion del filtro
        var descripcion = '';
        if($scope.tipo_filtro != 'Any' && $scope.tipo_filtro != 'Between'){
            descripcion = $scope.tipo_filtro+' '+$scope.valor_filtro+' '+$scope.cmbLogica;
        } else if ($scope.tipo_filtro == 'Between'){
            descripcion = $scope.tipo_filtro + ' ' + $scope.valor_filtro + ' AND ' + $scope.valor_filtro2 + ' ' +$scope.cmbLogica;
        } else {
            descripcion = 'Any value '+$scope.cmbLogica;
        }
        var id;
        if($scope.accion_enlace == 'Create'){
            id=0;
        }
        else{
            id = $scope.id_enlace_actual;
        }
        var enlace = {
            id: id,
            id_workflow: $scope.id_wf,
            id_p6: $scope.cmbColumnasP6.ID,
            NOMBRE_P6: $scope.cmbColumnasP6.NOMBRE,
            tipo_columna_p6: $scope.cmbColumnasP6.TIPO,
            id_ss: $scope.cmbColumnasSS.id,
            NOMBRE_SS: $scope.cmbColumnasSS.title,
            tipo_filtro: $scope.tipo_filtro,
            valor_filtro: $scope.valor_filtro,valor_filtro2: $scope.valor_filtro2,
            logica_filtro: $scope.cmbLogica,
            descripcion: descripcion,
            id_proyecto_primavera : $scope.wf_actual['ID_PROYECTO_PRIMAVERA'],
            id_hoja_smartsheet : $scope.wf_actual['ID_HOJA_SMARTSHEET'],
            tipo_dato: $scope.tipo_dato
        };
        //Si es edicion lo guardo si es modificacion lo modifico, esto lo se con el id (0 nuevo != 0 modificacion)
        $http.post('/almacenarEnlace',enlace)
            .then(function(response) {
                if(response.data.code == 'ER_PARSE_ERROR'){
                    $.alert({
                        title: 'Error!',
                        content: response.data.sqlMessage,
                    });
                }
                else{
                    getEnlacesByWf().
                    then(function(result){
                        $scope.Enlaces = Array();
                        if(result.data[0]){
                            result.data.forEach(enlace => {
                                $scope.agregarEnlace(enlace);
                            });
                        }
                        $scope.Enlaces = ordenar_alfabeticamente($scope.Enlaces,'NOMBRE_P6');
                        $scope.$apply();
                    })
                }
            });
        $("#modalInsertarActualizar").modal("hide");
    }
    $scope.almacenarWorkflow = async function(){
        //validaciones
        if(!$scope.workflowName){
           $.alert({
                title: 'Error!',
                content: 'Missing workflow name!',
            });
            return 0;
        }
        //Revisar si es edicion o creacion
        var id_wf;
        if($scope.accion == 'insertar'){
            id_wf = 0;
        }
        else{
            id_wf = $scope.id_wf;
        }
        //PRIMERO TENGO QUE GUARDAR EL WORKFLOW
        var workflow = {
            id_wf : id_wf,
            nombre: $scope.workflowName,
            id_proyecto_primavera: $scope.proyecto_actual.ObjectId,
            nombre_proyecto_primavera: $scope.proyecto_actual.Name,
            id_hoja_smartsheet: $scope.cmbHojas.id,
            nombre_hoja_ss: $scope.cmbHojas.nombre,
            comentarios: $scope.comentariosWorkflow,
            factor_duracion: $scope.factor_duracion
        };
        $http.post('/almacenarWorkFlow',workflow)
        .then(async function(response) {
            if(response){                    
                //Asignar el workflow actual 
                $scope.id_wf = response.data['ID'];
                var result = await cargarWorkflow();
                $scope.wf_actual = result.data[0];
                $scope.workflowName = result.data[0]['NOMBRE'];
                $scope.comentariosWorkflow = result.data[0]['COMENTARIOS'];
                var id_hoja_ss = result.data[0]['ID_HOJA_SMARTSHEET'];                
                var id_proyecto_primavera = result.data[0]['ID_PROYECTO_PRIMAVERA'];
            }
            else{
               $.alert({
                    title: 'Error!',
                    content: 'No data loaded!',
                });
            }
        });
    }
    $scope.insertarEnlace = function(){
        //para insercion se muestra el combo de tipos de columna
        $scope.mostrarCmbTipoColumna = true;
        $scope.cmbTipoColumna = 'fija';
        $scope.columnasP6 = $scope.columnasP6Fijas;

        $scope.cmbTipoFiltroUDFNum = 'Any';
        $scope.cmbTipoFiltroUDFText = 'Any';
        $scope.cmbSelectFechasUDF = 'Any';
        $scope.cmbTipoFiltroUDFIndicator = 'Any';
        $scope.cmbUDFIndicador = '';

        $scope.txtValorFiltroUDFNum1 = "";
        $scope.txtValorFiltroUDFNum2 = "";
        $scope.txtValorFiltroUDFText = "";
        $scope.inputDatePickerUDF = "";

        if(!$scope.proyecto_actual){
           $.alert({
                title: 'Error!',
                content: 'No project selected!',
            });
        }
        else if(!$scope.cmbHojas){
           $.alert({
                title: 'Error!',
                content: 'No sheet loaded!',
            });
        }
        else{
            //Ordenar enlaces, columnas primavera y columnas smartsheet
            $scope.Enlaces = ordenar_alfabeticamente($scope.Enlaces,'NOMBRE_P6');
            $scope.columnasP6 = ordenar_alfabeticamente($scope.columnasP6,'NOMBRE');
            $scope.columnasSS = ordenar_alfabeticamente($scope.columnasSS,'title');

            $scope.bloquear_columna_p6 = false;
            $scope.bloquear_columna_ss = false;
            $scope.cmbColumnasP6 = "";
            $scope.cmbColumnasSS = "";

            $scope.tipo_filtro = 'Any'; //Valor por defecto
            $scope.mostrarSelectFechas = false;
            $scope.mostrarInputFechas = false;
            $scope.cmbSelectFechas = 'Any'; //Opcion por defecto

            $scope.mostrarFiltroActityCode = false;

            $scope.mostrarFiltroStatus = false;
            $scope.cmbStatus = 'All'; //Opcion de inicio por defecto
            
            $scope.cmbLogica = 'Inclusive'; //AND por defecto
            $scope.mostrarLogica = false; //Por defecto no aparece
            $scope.accion_enlace = 'Create';

            //UDF
            $scope.mostrarFiltroUDF = false;
            $scope.mostrarcmbTipoFiltroUDFNum = false;
            $scope.mostrarcmbTipoFiltroUDFText = false;
            $scope.mostrarSelectFechasUDF = false;
            $scope.mostrarInputFechasUDF = false;
            $scope.mostrarcmbTipoFiltroUDFIndicator = false;

            //Iniciar el datepicker con la fecha de hoy
            var datepicker = $('#inputDatePicker').datepicker().data('datepicker');
            datepicker.selectDate(new Date());
            $("#modalInsertarActualizar").modal("show");
        }
    }
    $scope.eliminarEnlace = function(id_enlace){
       //Buscar la información del enlace en la base de datos
       $http.get('/deleteEnlaceById',{params: {id_enlace:id_enlace}}).
       then(function(response){ 
            getEnlacesByWf().
            then(function(result){
                $scope.Enlaces = Array();
                if(result.data[0]){
                    result.data.forEach(enlace => {
                        $scope.agregarEnlace(enlace);
                    });
                }
                $scope.Enlaces = ordenar_alfabeticamente($scope.Enlaces,'NOMBRE_P6');
                $scope.$apply();
            })
       });
    }
    $scope.editarEnlace = function(id_enlace){
        //Mostrar loading
        $scope.loading = $.dialog({
            icon: 'fa fa-spinner fa-spin',
            title: 'Working!',
            content: 'Loading bind information!',
            closeIcon: false
        });

        $scope.bloquear_columna_p6 = true;
        $scope.bloquear_columna_ss = true;
        //para edición no se muestra el combo de tipos de columna
        $scope.mostrarCmbTipoColumna = false;
        $scope.columnasP6 = $scope.columnasP6Todas; //Necesario para que aparezcan los nombres de las columnas

        //Buscar la información del enlace en la base de datos
        $http.get('/getEnlaceById',{params: {id_enlace:id_enlace}}).
        then(function(response){
            var id_columna_p6 = response.data[0]['ID_COLUMNA_PRIMAVERA'];
            $scope.tipo_filtro = response.data[0]['TIPO_FILTRO'];
            //Solo para UDF
            var tipo_dato = response.data[0]['TIPO_DATO'];
            for(i=0;i<$scope.columnasP6.length;i++){
                if($scope.columnasP6[i].ID.toString() == id_columna_p6){
                   $scope.cmbColumnasP6 = $scope.columnasP6[i];
               }
            }
            var id_columna_ss = response.data[0]['COLUMNA_SMARTSHEET'];
            for(i=0;i<$scope.columnasSS.length;i++){
                if($scope.columnasSS[i].id.toString() == id_columna_ss){
                   $scope.cmbColumnasSS = $scope.columnasSS[i];
               }
            }
            $scope.tipo_filtro = response.data[0]['TIPO_FILTRO'];
            
            //Unav vez que tengo el id de la columna la busco para hacer la validacion 
            //de los filtros que le corresponden
            var nombre = $scope.cmbColumnasP6.NOMBRE;
            var tipo_columna = $scope.cmbColumnasP6.TIPO;
            var id_columna = $scope.cmbColumnasP6.ID;
            if(nombre == 'Status'){
                $scope.mostrarFiltroStatus = true;
                $scope.cmbStatus = response.data[0]['VALOR1_FILTRO'];

                //Si hay elementos en enlaces hay que mostrar el filtro
                if($scope.Enlaces.length > 0){
                    //Se deshabilita por ahora todo sera AND
                    $scope.mostrarLogica = false;
                }
                else{
                    $scope.mostrarLogica = false;
                }
            }
            else{
                $scope.mostrarFiltroStatus = false;
            }
            if(tipo_columna == 'activity_code_type'){
                //Seleccionar los activity codes que tienen como CodeTypeObject el id_columna
                $scope.ActivityCodesFiltrados = Array();
                var inicial = {
                    CodeTypeObjectId: 0,
                    CodeValue: 'All'
                };
                $scope.ActivityCodesFiltrados.push(inicial);
                $scope.activity_codes.forEach(element => {
                    if(element.CodeTypeObjectId == id_columna){
                        $scope.ActivityCodesFiltrados.push(element);
                    }
                });
                $scope.mostrarFiltroActityCode = true;
                //Buscar el valor correspondiente para el filtro
                $scope.ActivityCodesFiltrados.forEach(ac => {
                    if(ac.CodeValue == response.data[0]['VALOR1_FILTRO']){
                        $scope.cmbActivityCode = ac;
                    }
                });

                //Si hay elementos en enlaces hay que mostrar el filtro
                if($scope.Enlaces.length > 0){
                    //Se deshabilita por ahora todo sera AND
                    $scope.mostrarLogica = false;
                }
                else{
                    $scope.mostrarLogica = false;
                }
            }
            else{
                $scope.mostrarFiltroActityCode = false;
            }
            //nombre == 'StartDate' || nombre == 'FinishDate' || nombre == 'ActualStartDate' || nombre == 'ActualFinishDate'
            if(nombre.includes('Date') || nombre.includes('date')){
            
                $scope.mostrarSelectFechas = true;
                if($scope.tipo_filtro == 'Any'){
                    $scope.mostrarInputFechas = false;
                }
                else{
                    $scope.mostrarInputFechas = true;
                }
                
                $scope.inputDatePicker = response.data[0]['VALOR1_FILTRO'];
                $scope.cmbSelectFechas = $scope.tipo_filtro;

                //Si hay elementos en enlaces hay que mostrar el filtro
                if($scope.Enlaces.length > 0){
                    //Se deshabilita por ahora todo sera AND
                    $scope.mostrarLogica = false;
                }
                else{
                    $scope.mostrarLogica = false;
                }
            }
            else{
                $scope.mostrarSelectFechas = false;
                $scope.mostrarInputFechas = false;
            }
            if(tipo_columna == 'udf'){
                //Inicializar todos los campos ocultos
                $scope.mostrarFiltroUDF = false;
                $scope.mostrarcmbTipoFiltroUDFNum = false;
                $scope.mostrarcmbTipoFiltroUDFText = false;
                $scope.mostrarcmbTipoFiltroUDFText = false;
                $scope.mostrarcmbTipoFiltroUDFIndicator = false;
                $scope.mostrarSelectFechasUDF = false;
                $scope.mostrarInputFechasUDF = false;

                $scope.tipo_dato = response.data[0]['TIPO_DATO'];
                var valor1;
                    if(response.data[0]['VALOR1_FILTRO'] == 'Cualquier valor'){
                        valor1 = "";
                    } else {
                        valor1 = response.data[0]['VALOR1_FILTRO'];
                    }
                if(tipo_dato == 'Cost' || tipo_dato == 'Double' || tipo_dato == 'Integer' || tipo_dato == 'Number'){
                    $scope.mostrarFiltroUDF = true;
                    $scope.mostrarcmbTipoFiltroUDFNum = true;
                    $scope.mostrarcmbTipoFiltroUDFText = false;

                    $scope.cmbTipoFiltroUDFNum = $scope.tipo_filtro;
                    $scope.txtValorFiltroUDFNum1 = parseFloat(response.data[0]['VALOR1_FILTRO']);
                    $scope.txtValorFiltroUDFNum2 = parseFloat(response.data[0]['VALOR2_FILTRO']);
                } else if (tipo_dato == 'Text'){
                    $scope.mostrarFiltroUDF = true;
                    $scope.mostrarcmbTipoFiltroUDFNum = false;
                    $scope.mostrarcmbTipoFiltroUDFText = true;

                    $scope.cmbTipoFiltroUDFText = $scope.tipo_filtro;
                    
                    $scope.txtValorFiltroUDFText = valor1;
                } else if(tipo_dato == 'Indicator'){
                    $scope.mostrarFiltroUDF = true;
                    $scope.mostrarcmbTipoFiltroUDFIndicator = true;
                    $scope.cmbTipoFiltroUDFIndicator = $scope.tipo_filtro;
                    $scope.cmbUDFIndicador = response.data[0]['VALOR1_FILTRO'];
                    switch ($scope.cmbUDFIndicador) {
                        case 'Red':
                            $scope.myStyle = {'color':'red'};
                            break;
                        case 'Yellow':
                            $scope.myStyle = {'color':'yellow'};
                            break;
                        case 'Green':
                            $scope.myStyle = {'color':'green'};
                            break;
                        case 'Blue':
                            $scope.myStyle = {'color':'blue'};
                            break;
                        default:
                            break;
                    }
                } else if(tipo_dato.includes('Date')){
                    $scope.mostrarFiltroUDF = true;
                    $scope.mostrarSelectFechasUDF = true;
                    $scope.cmbSelectFechasUDF = $scope.tipo_filtro;
                    $scope.mostrarInputFechasUDF = true;
                    $scope.inputDatePickerUDF = response.data[0]['VALOR1_FILTRO'];
                }
            } else {
                //UDF
                $scope.mostrarFiltroUDF = false;
                $scope.mostrarcmbTipoFiltroUDFNum = false;
                $scope.cmbTipoFiltroUDFText = false;
                $scope.mostrarSelectFechasUDF = false;
                $scope.mostrarInputFechasUDF = false;
            }
            $scope.accion_enlace = 'Save';
            $scope.id_enlace_actual = id_enlace;

            $scope.Enlaces = ordenar_alfabeticamente($scope.Enlaces,'NOMBRE_P6');
            $scope.columnasP6 = ordenar_alfabeticamente($scope.columnasP6,'NOMBRE');
            $scope.columnasSS = ordenar_alfabeticamente($scope.columnasSS,'title');

            $scope.loading.close();
            $("#modalInsertarActualizar").modal("show");
        });
    }
    function onSelect2(){
        $(".select2_single").select2({});
    }
    /*
        Funcion para cargar las columnas a elegir de primavera
        Usa las columnas almacenadas en la base de datos (fijas)
        más las columnas variables que dependen de los activity codes que traiga el proyecto
    */
    function cargarColumnasP6(){
        //las columnas seran las predefinidad por el usuario mas los activity codes
        return new Promise((resolve,reject) => {
            //Buscar las tablas en la base de datos
            $http.get('/columnasPrimavera').
            then(function(response){
                if(response.data == 'error'){
                    reject(response);
                }
                else{
                    resolve(response)
                }
            }).
            catch(function(err){
                reject(err);
            });
        })        
    }

    onSelect2();
    async function carga_inicial(){
            
        if($scope.accion == 'editar'){
            $scope.loading = $.dialog({
                icon: 'fa fa-spinner fa-spin',
                title: 'Working!',
                content: 'Sit back, we are loading the sheet, project and binds of this workflow!',
                closeIcon: false
            });
            //Bloquear hojas y proyectos cuando es edicion
            $scope.bloquear_hojas = true;
            $scope.bloquear_proyectos = true;

            var result = await cargarWorkflow();
            $scope.wf_actual = result.data[0];
            $scope.workflowName = result.data[0]['NOMBRE'];
            $scope.comentariosWorkflow = result.data[0]['COMENTARIOS'];
            //Con el id de la hoja busco en la lista de hojas
            //Y ese es el valor que debe tener la lista de hojas
            var id_hoja_ss = result.data[0]['ID_HOJA_SMARTSHEET'];
            //Solo debo cargar la hoja del workflow por disposición de Antonio
            await getHojaSS(id_hoja_ss,true);
            $scope.cambioHojas();
            //Cargar el proyecto de primavera correspondiente
            var id_proyecto_primavera = result.data[0]['ID_PROYECTO_PRIMAVERA'];
            //Solo cargar el proyecto que le corresponde al wf
            var result = await getProyectoById(id_proyecto_primavera,true);

            //Cargar todos los UDFs
            await getUDFs();                      

            $scope.$apply(function(){
                $scope.Proyectos = Array();
                $scope.Proyectos[0] = result.data.Project[0];
                $scope.cmbProyectos = $scope.Proyectos[0];
            });
            $scope.proyecto_actual = $scope.cmbProyectos;
            await prcambioProyecto();  
            result = await getEnlacesByWf();
            if(result.data[0]){
                result.data.forEach(enlace => {
                    $scope.agregarEnlace(enlace);
                });
            }  
            $scope.Enlaces = ordenar_alfabeticamente($scope.Enlaces,'NOMBRE_P6');       
        }
        else{
            $scope.loading = $.dialog({
                icon: 'fa fa-spinner fa-spin',
                title: 'Working!',
                content: 'Sit back, we are loading your sheets and projects!',
                closeIcon: false
            });
            //Desbloquear las listas de proyectos y hojas
            $scope.bloquear_hojas = false;
            $scope.bloquear_proyectos = false;

            //Cargar proyectos y hojas
            $scope.Proyectos = Array();
            $scope.Proyectos = await getProyectos();
            $scope.Proyectos = $scope.Proyectos.data.Project;
            $scope.Proyectos = ordenar_alfabeticamente($scope.Proyectos,'Name');
            await getHojas();
            //Cargar todos los UDFs
            await getUDFs(); 
        }
        $scope.loading.close();
    }
    function agregar_columna_p6(tipo_columna,columna){
        var consecutivo = $scope.columnasP6Todas.length+1;
        var col;
        if(tipo_columna == 'udf'){
            var col = {
                ID:columna['ID'],
                NOMBRE:columna['NOMBRE'],
                TIPO:columna['TIPO'],
                TIPO_WORKFLOW:columna['TIPO_WORKFLOW'],
                ID_INTERFACE: consecutivo,
                TIPO_DATO: columna['TIPO_DATO']
            }
        } else {
            col = {
                ID:columna['ID'],
                NOMBRE:columna['NOMBRE'],
                TIPO:columna['TIPO'],
                TIPO_WORKFLOW:columna['TIPO_WORKFLOW'],
                ID_INTERFACE: consecutivo
            }
        }        
        $scope.columnasP6Todas.push(col);

        switch (tipo_columna) {
            case 'fija':
                //var consecutivo = $scope.columnasP6Fijas.length+1;
                var mapeo = {
                    ID:columna['ID'],
                    NOMBRE:columna['NOMBRE'],
                    TIPO:columna['TIPO'],
                    TIPO_WORKFLOW:columna['TIPO_WORKFLOW'],
                    ID_INTERFACE: consecutivo
                }
                $scope.columnasP6Fijas.push(mapeo);
                break;
            case 'code':
                //var consecutivo = $scope.columnasP6Codes.length+1;
                var mapeo = {
                    ID:columna['ID'],
                    NOMBRE:columna['NOMBRE'],
                    TIPO:columna['TIPO'],
                    TIPO_WORKFLOW:columna['TIPO_WORKFLOW'],
                    ID_INTERFACE: consecutivo
                }
                $scope.columnasP6Codes.push(mapeo);
                break;
            case 'udf':
                //var consecutivo = $scope.columnasP6UDFs.length+1;
                var mapeo = {
                    ID:columna['ID'],
                    NOMBRE:columna['NOMBRE'],
                    TIPO:columna['TIPO'],
                    TIPO_WORKFLOW:columna['TIPO_WORKFLOW'],
                    ID_INTERFACE: consecutivo,
                    TIPO_DATO: columna['TIPO_DATO']
                }
                $scope.columnasP6UDFs.push(mapeo);
                break;
            default:
                break;
        }
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
    $scope.cambioTipoColumna = function(){
        switch ($scope.cmbTipoColumna) {
            case 'fija':
                $scope.columnasP6 = $scope.columnasP6Fijas;     
                break;
            case 'code':
                $scope.columnasP6 = $scope.columnasP6Codes;
                break;
            case 'udf':
                $scope.columnasP6 = $scope.columnasP6UDFs;
                break;
            default:
                break;
        }
    }
    $scope.cambioSelectFechasUDF = function(){
        var datepicker = $('#inputDatePickerUDF').datepicker().data('datepicker');
        
        if($scope.cmbSelectFechasUDF == 'Any'){
            $scope.mostrarInputFechasUDF = false;
        }
        else{
            $scope.mostrarInputFechasUDF = true;
        }

        $scope.tipo_filtro =$scope.cmbSelectFechasUDF;
        if($scope.cmbSelectFechasUDF == 'Range'){
            datepicker.update({
                range: true,
                multipleDatesSeparator: " - "
            });
            var hoy = new Date();
            var manana=new Date(hoy.getTime() + 24*60*60*1000);
            hoy = obtener_fecha_string(hoy);
            manana = obtener_fecha_string(manana);
            $("#inputDatePicker").val(hoy + '-' + manana); 
            //$scope.inputDatePicker = hoy + '-' + manana;
        }
        else{
            datepicker.update({
                range: false
            });
            var hoy = new Date();
            hoy = obtener_fecha_string(hoy);
            $("#inputDatePickerUDF").val(hoy); 
        }
    }
    $scope.cambioFiltroUDF = function(emisor){
        if(emisor == 'num'){
            $scope.tipo_filtro = $scope.cmbTipoFiltroUDFNum;
            if($scope.tipo_filtro == 'Any'){
                $scope.txtValorFiltroUDFNum1 = '';
                $scope.txtValorFiltroUDFNum2 = '';
            }
        } else if(emisor == 'text'){
            $scope.tipo_filtro = $scope.cmbTipoFiltroUDFText;
            if($scope.tipo_filtro == 'Any'){
                $scope.txtValorFiltroUDFText = '';
            }
        } else if(emisor == 'indicator'){
            $scope.tipo_filtro = $scope.cmbTipoFiltroUDFIndicator;
            if($scope.tipo_filtro == 'Any'){
                $scope.cmbUDFIndicador = '';
            }
        }
    }
    $scope.cambiocmbUDFIndicador = function(){
        switch ($scope.cmbUDFIndicador) {
            case 'Red':
                $scope.myStyle = {'color':'red'};
                break;
            case 'Yellow':
                $scope.myStyle = {'color':'yellow'};
                break;
            case 'Green':
                $scope.myStyle = {'color':'green'};
                break;
            case 'Blue':
                $scope.myStyle = {'color':'blue'};
                break;
            default:
                break;
        }
    }
    carga_inicial();
}]);
