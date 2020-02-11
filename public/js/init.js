var DatosEbus = {
    dataHorarios: [],
    dataRangoSlider: [],
    dataRangoPrecios: [],
    dataRagoHoraSalida: [],
    dataRangoHoraLlegada: [],
    contadorEmpresas: 0,
    totalEmpresas: 0,
    init: function(){
        this.dataHorarios = [];
        this.dataRangoSlider = [];
        this.dataRangoPrecios = [];
        this.dataRagoHoraSalida = [];
        this.dataRangoHoraLlegada = [];
        this.contadorEmpresas = 0;
        this.totalEmpresas = 0;
    },
    validarDatosEmpresas: function(){
        this.contadorEmpresas++;
        console.log('========================================= Inicio =========================================');
        console.log('Total Horarios: ' + this.dataHorarios.length);
        console.log('Contador: ' + this.contadorEmpresas);
        console.log('Total Empresas: ' + this.totalEmpresas);
        console.log('========================================= Fin =========================================');
        if(!this.dataHorarios.length && this.contadorEmpresas == this.totalEmpresas){
            setTimeout(function(){
                $(".filtro-contenido .filtro").hide();
                $(".carga-resultados").fadeOut();
                $(".ebus-lista-busqueda").css({'height':'calc(60vh + 120px)'});
                setTimeout(function(){
                    $(".ebus-lista-busqueda .cargando-bus").show();
                }, 200);
            }, 200);
        }
    }
}
var Ebus = {
    data_asientos: {},
    datos_viaje: {},
    datos_viaje_estado: {},
    estado_viaje: {},
    filtroPageYOffset: 0,
    maximaCantidadAsientos: 0,
    fecha_viaje: $("#fecha_viaje"),
    fecha_retorno: $("#fecha_retorno"),
    select_origen: $(".select2-origen"),
    select_destino: $(".select2-destino"),
    filtro_fecha_actual: '',
    viaje_retorno: '',
    viaje_retorno_estado: '',
    fila_busqueda_top: 0,
    texto_viaje_encabezado: $("[data-template='viaje']"),
    id_viaje_ida: '',
    encabezado_viaje: $(".ebus-encabezado-viaje"),
    extension_idioma: '',
    idioma_traduccion: {},
    data_rango_slider: [],
    resultados_busqueda: $(".resultados-busqueda"),
    monedas: {},
    moneda_simbolo: '',
    moneda_codigo: '',
    moneda: '',
    plantilla_lista_comentarios: $("[data-template='lista_plantilla_comentarios']"),
    time_minutos: 0,
    time_init: 0,
    time_interval: 0,
    time_accion: '',
    time_validar: false,
    time_status: true,
    lista_filtros_asientos: $(".lista-filtros-asientos"),
    filtro_header_opciones: $(".ebus-header-opcion"),
    init: function(){
        this.data_asientos = {};
        this.datos_viaje['ida'] = {};
        this.datos_viaje['vuelta'] = {};
        this.datos_viaje_estado = {
            ida: false,
            vuelta: false
        };
        this.estado_viaje = {
            ida: true,
            vuelta: false
        };
        this.filtroPageYOffset = 284;
        this.maximaCantidadAsientos = 5;
        this.filtro_fecha_actual = '';
        this.viaje_retorno = false;
        this.viaje_retorno_estado = false;
        this.fila_busqueda_top = 0;
        this.texto_viaje_encabezado.text(this.idioma_traduccion.texto_pasaje_de_ida);
        this.id_viaje_ida = '';
        this.precargarDatosBuscadorFiltro();
        this.encabezado_viaje.find(".informacion[data-viaje='vuelta']").hide();
        this.encabezado_viaje.find(".pasaje-retorno").show();
        this.eliminarAsientosLocalStorage();
        this.movilAntes();
        this.movilDespues();
        this.data_rango_slider = [];
        this.monedas = {
            pen: {
                simbolo: 'S/',
                codigo: 'pen'
            },
            usd: {
                simbolo: '$',
                codigo: 'usd'
            }
        };
        this.moneda_simbolo = (localStorage.getItem('ebus_moneda') != null) ? this.monedas[localStorage.getItem('ebus_moneda')]['simbolo'] : 'S/';
        this.moneda_codigo = (localStorage.getItem('ebus_moneda') != null) ? this.monedas[localStorage.getItem('ebus_moneda')]['codigo'] : 'pen';
        if(localStorage.getItem('ebus_moneda') != null){
            if(localStorage.getItem('ebus_moneda') === 'usd')this.obtenerTipoCambioMoneda(localStorage.getItem('ebus_moneda'));
            else this.moneda = 0;
        }else{
            this.moneda = 0;
        }
        this.lista_filtros_asientos.hide();
        localStorage.removeItem("datos_asientos_formulario");
    },
    piePaginaInformacionAsientos: function(objContenedor){
        var lista_asientos = [];
        var total_asientos = 0;
        var total_pagar = 0;
        if(Object.keys(Ebus.data_asientos).length){
            this.lista_filtros_asientos.show();
            objContenedor.find(".ebus-contenedor-viaje").css({"margin-bottom": "54px"});
            for(i in Ebus.data_asientos){
                lista_asientos.push(Ebus.data_asientos[i].num_asiento);
                total_pagar += parseFloat(Ebus.data_asientos[i].precio_asiento);
                total_asientos++;
            };
        }else{
            this.lista_filtros_asientos.hide();
            objContenedor.find(".ebus-contenedor-viaje").removeAttr("style");
        }
        var texto_asientos = (total_asientos > 1) ? 'Asientos' : 'Asiento';
        this.lista_filtros_asientos.find(".bloque.asiento").text(total_asientos+" "+texto_asientos);
        this.lista_filtros_asientos.find(".bloque.numero").text(lista_asientos);
        this.lista_filtros_asientos.find(".bloque.total").text(this.moneda_simbolo+" "+total_pagar.toFixed(2));
    },
    precargarDatosBuscadorFiltro: function(){
        var datos = JSON.parse(localStorage.getItem('data_buscador_filtro'));
        if(datos != null && Object.keys(datos).length > 0){
            this.select_origen.val(datos.origen).trigger('change.select2');
            this.select_destino.val(datos.destino).trigger('change.select2');
        }
    },
    validarDisponiblidadAsiento: function(objContenedor, idempresa, num_piso, num_asiento, key_servicio, idasiento, idbus, precio_asiento, asientoSeleccionado){
        objContenedor.find(".contenedor-bus .cargando").show();
        var key_asiento = String("ID"+idbus+"E"+idempresa+"P"+num_piso+"NA"+num_asiento);
        var params = {
            idempresa: idempresa,
            num_piso: num_piso,
            num_asiento: num_asiento,
            key_servicio: key_servicio,
            idasiento: idasiento,
            precio_asiento: parseFloat(precio_asiento).toFixed(2),
            key_asiento: key_asiento
        }
        if(idempresa === '1')params.hash = asientoSeleccionado.attr("data-hash");
        $.post(this.extension_idioma+"/index/validar-disponiblidad-asiento", params, function(response){
            if(response.result == 'disponible'){
                params.precio_asiento = response.data.precio;
                asientoSeleccionado.addClass("active");
                if(idempresa === '2'){
                    params.hash = response.data.hash;
                    asientoSeleccionado.attr("data-hash", response.data.hash);
                }
                Ebus.datosSesionAsiento(params, 'agregar', response.data.codigo_transaccion);
                if(Ebus.estado_viaje.ida && !Ebus.estado_viaje.vuelta){
                    Ebus.datos_viaje_estado.ida = true;
                }else if(Ebus.estado_viaje.ida && Ebus.estado_viaje.vuelta){
                    Ebus.datos_viaje_estado.vuelta = true;
                }
            }else if(response.result == 'ocupado'){
                asientoSeleccionado.removeClass("active");
                if(Ebus.data_asientos[params.key_asiento] != undefined){
                    Ebus.desbloquearAsiento(params, Ebus.data_asientos[params.key_asiento].codigo_transaccion);
                }
                Ebus.datosSesionAsiento(params, 'eliminar');
            }
            Ebus.validarContinuidad();
            Ebus.mostrarAsientosSeleccinados(objContenedor, params);
            Ebus.calcularMontoTotalAsiento(objContenedor, params);
            Ebus.mostrarPasajeOpciones(objContenedor, params);
            Ebus.validarEncabezadoViaje(objContenedor);
            if($(".step-header").is(":visible")){
                var datos_pasaje = Ebus.obtenerDatosPasaje();
                $("[data-template-pago='total_pago']").text(Ebus.moneda_simbolo+" " + datos_pasaje.total_pagar);
                if(Object.keys(Ebus.data_asientos).length == 0)modal_hide('modal-tercero');
            }
            if(window.innerWidth <= Principal.width_responsive){
                Ebus.piePaginaInformacionAsientos(objContenedor);
            }
            objContenedor.find(".contenedor-bus .cargando").hide();
        }, 'json');
    },
    mostrarPasajeOpciones: function(objContenedor, params){
        var contenedor_viaje = objContenedor.find(".ebus-contenedor-viaje");
        if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
            if(Object.keys(this.data_asientos).length > 0){
                contenedor_viaje.find(".btn-continuar-sin-pasaje, .btn-pasaje-retorno").show();
            }else{
                contenedor_viaje.find(".btn-continuar-sin-pasaje, .btn-pasaje-retorno").hide();
            }
            if(this.estado_viaje.ida && this.estado_viaje.vuelta){
                contenedor_viaje.find(".btn-pasaje-retorno").hide();
                if(Object.keys(this.data_asientos).length > 0){
                    contenedor_viaje.find(".btn-completar-datos-pasajero").show();
                }else{
                    contenedor_viaje.find(".btn-completar-datos-pasajero").hide();
                }
            }
        }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
            contenedor_viaje.find(".btn-completar-datos-pasajero").show();
        }
    },
    mostrarAsientosSeleccinados(objContenedor, params){
        var datosPasaje = this.obtenerDatosPasaje();
        var contenedor_viaje = objContenedor.find(".ebus-contenedor-viaje");
        var bloque_pasaje_ida = contenedor_viaje.find(".bloque[data-accion='ida']");
        var bloque_pasaje_vuelta = contenedor_viaje.find(".bloque[data-accion='vuelta']");
        if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
            /********************** IDA **********************/
            switch(params.num_piso){
                case '1':
                    var bloque_piso = bloque_pasaje_ida.find(".asientos-seleccionados > .piso[data-piso='1']");
                    bloque_piso.find(".numero").text('').text(datosPasaje.ida.piso_1.numero_asiento);
                break;
                case '2':
                    var bloque_piso = bloque_pasaje_ida.find(".asientos-seleccionados > .piso[data-piso='2']");
                    bloque_piso.find(".numero").text('').text(datosPasaje.ida.piso_2.numero_asiento);
                break;
            }
        }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
            /********************** VUELTA **********************/
            switch(params.num_piso){
                case '1':
                    var bloque_piso = bloque_pasaje_vuelta.find(".asientos-seleccionados > .piso[data-piso='1']");
                    bloque_piso.find(".numero").text('').text(datosPasaje.vuelta.piso_1.numero_asiento);
                break;
                case '2':
                    var bloque_piso = bloque_pasaje_vuelta.find(".asientos-seleccionados > .piso[data-piso='2']");
                    bloque_piso.find(".numero").text('').text(datosPasaje.vuelta.piso_2.numero_asiento);
                break;
            }
        }
    },
    calcularMontoTotalAsiento: function(objContenedor, params){
        var datosPasaje = this.obtenerDatosPasaje();
        var seccion_total = objContenedor.find(".ebus-contenedor-viaje > .encabezado > .monto");
        var total = datosPasaje.ida.total;
        if(this.estado_viaje.ida && this.estado_viaje.vuelta){
            total += datosPasaje.vuelta.total;
        }
        seccion_total.attr("data-monto", total.toFixed(2));
        seccion_total.text(Ebus.moneda_simbolo+" " + total.toFixed(2));
    },
    desbloquearAsiento: function(params, codigo_transaccion){
        params.codigo_transaccion = codigo_transaccion;
        $.post(this.extension_idioma + "/index/desbloquear-asiento", params, function(response){
            console.log(response);
        }, 'json');
    },
    datosSesionAsiento: function(params, accion, codigo_transaccion = ''){
        var pasaje = '';
        if(this.estado_viaje.ida && !this.estado_viaje.vuelta)pasaje='ida';
        else if(this.estado_viaje.ida && this.estado_viaje.vuelta)pasaje='vuelta';
        switch(accion){
            case 'agregar':
                this.data_asientos[params.key_asiento] = {
                    num_piso: params.num_piso,
                    num_asiento: params.num_asiento,
                    codigo_transaccion: codigo_transaccion,
                    precio_asiento: params.precio_asiento,
                    idempresa: params.idempresa,
                    idasiento: params.idasiento,
                    pasaje: pasaje,
                    key_servicio: params.key_servicio,
                    hash: params.hash
                };
            break;
            case 'eliminar':
                delete this.data_asientos[params.key_asiento];
            break;
        }
        this.guardarAsientosLocalStorage();
    },
    obtenerDatosViaje: function(objContenedor){
        var datosPasaje = this.obtenerDatosPasaje();
        var bus_cuerpo = objContenedor.find(".ebus-contenedor-bus .bus-cuerpo");
        var bloque_piso_2 = bus_cuerpo.find(".bus-segundo-piso");
        var contenedor_viaje = objContenedor.find(".ebus-contenedor-viaje");
        contenedor_viaje.find(".encabezado .monto").text(Ebus.moneda_simbolo+' 0.00');
        contenedor_viaje.find(".bloque[data-accion='ida'], .bloque[data-accion='vuelta']").hide();
        var fecha_viaje = this.fecha_viaje.val();
        if(this.datos_viaje_estado.ida){
            fecha_viaje = this.fecha_retorno.val();
        }
        var datos_viaje = {
            hora_embarque: objContenedor.find(".informacion-bus span[data-template='hora_embarque']").text(),
            terminal_embarque: objContenedor.find(".informacion-bus span[data-template='terminal_embarque']").text(),
            duracion_viaje: objContenedor.find(".informacion-bus span[data-template='duracion_viaje']").text(),
            hora_desembarque: objContenedor.find(".informacion-bus span[data-template='hora_desembarque']").text(),
            terminal_desembarque: objContenedor.find(".informacion-bus span[data-template='terminal_desembarque']").text(),
            logo_empresa: objContenedor.find(".informacion-bus dl[data-template='logo_empresa'] img").attr("src"),
            origen: $(".direccion-rutas div[data-template='origen']").text(),
            destino: $(".direccion-rutas div[data-template='destino']").text(),
            fecha_viaje: fecha_viaje,
            idempresa: objContenedor.attr("data-idempresa"),
            direccion_embarque: objContenedor.find(".ebus-informacion [data-template='direccion_embarque']").text(),
            direccion_desembarque: objContenedor.find(".ebus-informacion [data-template='direccion_desembarque']").text(),
            bus_servicio: objContenedor.find(".informacion-bus span[data-template='bus_servicio']").text()
        };
        if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
            this.datos_viaje['ida'] = datos_viaje;
            var bloque_viaje_ida = contenedor_viaje.find(".bloque[data-accion='ida']");
            bloque_viaje_ida.find("img[data-template='logo_empresa']").attr("src", datos_viaje.logo_empresa);
            bloque_viaje_ida.find("span[data-template='hora_embarque']").text(datos_viaje.hora_embarque);
            bloque_viaje_ida.find("span[data-template='terminal_embarque']").text(datos_viaje.terminal_embarque);
            bloque_viaje_ida.find("span[data-template='duracion_viaje']").text(datos_viaje.duracion_viaje);
            bloque_viaje_ida.find("span[data-template='hora_desembarque']").text(datos_viaje.hora_desembarque);
            bloque_viaje_ida.find("span[data-template='terminal_desembarque']").text(datos_viaje.terminal_desembarque);
            if(bloque_piso_2.children().length == 0 || bloque_piso_2.children().length == 1){
                bloque_viaje_ida.find(".piso[data-piso='2']").hide();
            }
            bloque_viaje_ida.show();
        }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
            /********************** IDA **********************/
            var bloque_viaje_ida = contenedor_viaje.find(".bloque[data-accion='ida']");
            bloque_viaje_ida.find("img[data-template='logo_empresa']").attr("src", this.datos_viaje['ida'].logo_empresa);
            bloque_viaje_ida.find("span[data-template='hora_embarque']").text(this.datos_viaje['ida'].hora_embarque);
            bloque_viaje_ida.find("span[data-template='terminal_embarque']").text(this.datos_viaje['ida'].terminal_embarque);
            bloque_viaje_ida.find("span[data-template='duracion_viaje']").text(this.datos_viaje['ida'].duracion_viaje);
            bloque_viaje_ida.find("span[data-template='hora_desembarque']").text(this.datos_viaje['ida'].hora_desembarque);
            bloque_viaje_ida.find("span[data-template='terminal_desembarque']").text(this.datos_viaje['ida'].terminal_desembarque);
            var bloque_piso_ida_1 = bloque_viaje_ida.find(".asientos-seleccionados > .piso[data-piso='1']");
            bloque_piso_ida_1.find(".numero").text('').text(datosPasaje.ida.piso_1.numero_asiento);
            var bloque_piso_ida_2 = bloque_viaje_ida.find(".asientos-seleccionados > .piso[data-piso='2']");
            bloque_piso_ida_2.find(".numero").text('').text(datosPasaje.ida.piso_2.numero_asiento);
            if(datosPasaje.ida.piso_2.numero_asiento == "")bloque_piso_ida_2.hide();
            bloque_viaje_ida.show();
            /********************** VUELTA **********************/
            this.datos_viaje['vuelta'] = datos_viaje;
            var bloque_viaje_vuelta = contenedor_viaje.find(".bloque[data-accion='vuelta']");
            bloque_viaje_vuelta.find("img[data-template='logo_empresa']").attr("src", datos_viaje.logo_empresa);
            bloque_viaje_vuelta.find("span[data-template='hora_embarque']").text(datos_viaje.hora_embarque);
            bloque_viaje_vuelta.find("span[data-template='terminal_embarque']").text(datos_viaje.terminal_embarque);
            bloque_viaje_vuelta.find("span[data-template='duracion_viaje']").text(datos_viaje.duracion_viaje);
            bloque_viaje_vuelta.find("span[data-template='hora_desembarque']").text(datos_viaje.hora_desembarque);
            bloque_viaje_vuelta.find("span[data-template='terminal_desembarque']").text(datos_viaje.terminal_desembarque);
            if(bloque_piso_2.children().length == 0 || bloque_piso_2.children().length == 1){
                bloque_viaje_vuelta.find(".piso[data-piso='2']").hide();
            }
            bloque_viaje_vuelta.show();
        }
        if(window.innerWidth <= Principal.width_responsive){
            objContenedor.find(".ebus-contenedor-viaje .encabezado").hide();
            objContenedor.find(".ebus-contenedor-viaje .bloque").hide();
        }
        Ebus.calcularMontoTotalAsiento(objContenedor, {});
    },
    validarEstadoAsientos: function(){
        var data = [];
        if(Object.keys(this.data_asientos).length > 0){
            for(i in this.data_asientos){
                if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
                    if(!this.viaje_retorno){
                        if(this.data_asientos[i].pasaje == 'ida'){
                            data.push(this.data_asientos[i]);
                            delete this.data_asientos[i];
                        }
                    }
                }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
                    if(this.data_asientos[i].pasaje == 'vuelta'){
                        data.push(this.data_asientos[i]);
                        delete this.data_asientos[i];
                    }
                }
            }
            if(data.length > 0){
                $.post(this.extension_idioma+"/index/validar-estado-asientos",{data: JSON.stringify(data)}, function(response){
                    console.log(response);
                }, 'json');
            }
        }
        this.guardarAsientosLocalStorage();
    },
    validarContinuidad: function(){
        if(this.time_status && $(".asiento.active").length > 0){
            this.time_status = false;
            Ebus.tiempoContinuidad(1);
        }else if(!this.time_status && $(".asiento.active").length == 0){
            this.time_status = true;
            Ebus.tiempoContinuidad(1, 'eliminar');
        }
    },
    tiempoContinuidad: function(paso, accion = 'iniciar'){
        var self = this;
        self.time_accion = accion;
        if(self.time_accion == 'eliminar'){
            clearInterval(self.time_interval);
            return;
        }
        clearInterval(self.time_interval);
        self.time_init = self.time_minutos*60;
        self.time_interval = 0;
        self.mostrarTiempoRestante(paso);
        self.time_interval = setInterval(function(){
            self.time_init--;
            self.mostrarTiempoRestante(paso);
        },1000);
    },
    mostrarTiempoRestante: function(paso){
        var self = this;
        if(self.time_init<0){
            clearInterval(self.time_interval);
            modal_ncl(this.extension_idioma+"/index/confirmar-continuidad?paso="+paso,"modal-quinto");
            return;
        }
        var date = new Date(1970,0,1);
        date.setSeconds(self.time_init);
        var time = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        //console.log(time);
    },
    borrarTiempoContinuidad: function(){
        var self = this;
        clearInterval(self.time_interval);
    },
    validarEncabezadoViaje(objContenedor){
        var encabezado_viaje = $(".ebus-encabezado-viaje");
        var encabezado_viaje_ida = encabezado_viaje.find(".informacion[data-viaje='ida']");
        var encabezado_viaje_vuelta = encabezado_viaje.find(".informacion[data-viaje='vuelta']");
        var total_asientos_activos = 0;
        objContenedor.find(".ebus-contenedor-bus .bus-cuerpo .asiento").each(function(){
            if($(this).hasClass("active"))total_asientos_activos += 1;
        });
        if(total_asientos_activos >= 1){
            if(Object.keys(this.datos_viaje['ida']).length > 0){
                encabezado_viaje_ida.find("[data-template-viaje='origen']").text(this.datos_viaje['ida'].origen);
                encabezado_viaje_ida.find("[data-template-viaje='destino']").text(this.datos_viaje['ida'].destino);
                encabezado_viaje_ida.find("[data-template-viaje='logo_empresa']").attr("src", this.datos_viaje['ida'].logo_empresa);
                encabezado_viaje_ida.find("[data-template-viaje='fecha_viaje']").text(this.datos_viaje['ida'].fecha_viaje);
                encabezado_viaje_ida.find("[data-template-viaje='hora_embarque']").text(this.datos_viaje['ida'].hora_embarque+' ');
                encabezado_viaje_ida.find("[data-template-viaje='terminal_embarque']").text(this.datos_viaje['ida'].terminal_embarque);
                encabezado_viaje_ida.find("[data-template-viaje='hora_desembarque']").text(this.datos_viaje['ida'].hora_desembarque+' ');
                encabezado_viaje_ida.find("[data-template-viaje='terminal_desembarque']").text(this.datos_viaje['ida'].terminal_desembarque);
                encabezado_viaje_ida.show();
            }
            if(Object.keys(this.datos_viaje['vuelta']).length > 0){
                encabezado_viaje_vuelta.find("[data-template-viaje='origen']").text(this.datos_viaje['vuelta'].origen);
                encabezado_viaje_vuelta.find("[data-template-viaje='destino']").text(this.datos_viaje['vuelta'].destino);
                encabezado_viaje_vuelta.find("[data-template-viaje='logo_empresa']").attr("src", this.datos_viaje['vuelta'].logo_empresa);
                encabezado_viaje_vuelta.find("[data-template-viaje='fecha_viaje']").text(this.datos_viaje['vuelta'].fecha_viaje);
                encabezado_viaje_vuelta.find("[data-template-viaje='hora_embarque']").text(this.datos_viaje['vuelta'].hora_embarque+' ');
                encabezado_viaje_vuelta.find("[data-template-viaje='terminal_embarque']").text(this.datos_viaje['vuelta'].terminal_embarque);
                encabezado_viaje_vuelta.find("[data-template-viaje='hora_desembarque']").text(this.datos_viaje['vuelta'].hora_desembarque+' ');
                encabezado_viaje_vuelta.find("[data-template-viaje='terminal_desembarque']").text(this.datos_viaje['vuelta'].terminal_desembarque);
                encabezado_viaje_vuelta.show();
                encabezado_viaje.find(".pasaje-retorno").hide();
            }
            encabezado_viaje.show();
            this.filtroPageYOffset = 360;
            this.fila_busqueda_top = 110;
            this.actualizarSliderPrincipal(true);
        }else{
            this.borrarTiempoContinuidad();
            if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
                this.datos_viaje_estado.ida = false;
            }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
                this.datos_viaje_estado.vuelta = false;
            }
            if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
                encabezado_viaje_ida.hide();
                encabezado_viaje.hide();
            }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
                encabezado_viaje.find(".pasaje-retorno").show();
                encabezado_viaje_vuelta.hide();
            }
            this.filtroPageYOffset = 284;
            this.actualizarSliderPrincipal(false);
        }
        this.movilDespues();
    },
    actualizarSliderPrincipal: function(activo){
        if(window.innerWidth >= 769){
            if(activo){
                $(".result-search").css({'height':'400px'});
                $(".ebus-buscador").css({'top':'340px'});
            }else{
                if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
                    $(".result-search").removeAttr('style');
                    $(".ebus-buscador").removeAttr('style');
                }
            }
        }
    },
    pasajeRetorno: function(){
        if(this.fecha_retorno.val() != ''){
            var value_origen_1 = this.select_origen.val();
            var value_destino_1 = this.select_destino.val();
            this.select_origen.val(value_destino_1).trigger('change.select2');
            this.select_destino.val(value_origen_1).trigger('change.select2');
            this.select_origen.next().find('.select2-selection__rendered:first').text(this.select_destino.find("option:selected").text());
            this.select_destino.next().find('.select2-selection__rendered:first').text(this.select_origen.find("option:selected").text());
            this.viaje_retorno = true;
            this.viaje_retorno_estado = true;
            this.estado_viaje.vuelta = true;
            this.texto_viaje_encabezado.text(this.idioma_traduccion.texto_pasaje_de_retorno);
            $("html, body").animate({ scrollTop: 0 }, 500);
            $(".ebus-fila-busqueda .container").removeClass("active-detalle");
            $(".ebus-fila-busqueda .container").removeClass("active-asiento");
            $('.ebus-fila-busqueda .ebus-tabs-informacion').removeClass('current');
            $('.ebus-fila-busqueda .ebus-tabs').removeClass('current');
            if(this.estado_viaje.ida && this.estado_viaje.vuelta)this.filtro_fecha_actual = this.fecha_retorno.val();
            setTimeout(function(){
                $('.btn-buscar').click();
            }, 800);
        }else{
            modal_ncl(this.extension_idioma+'/index/fecha-retorno', 'modal-segundo');
        }
    },
    mensajeCargarContenidoBus: function(objContenedor, accion){
        objContenedor.find(".ebus-asientos .cargando").show();
        objContenedor.find(".ebus-asientos .container").hide();
        var mensaje_servicio = objContenedor.find(".ebus-asientos .cargando .cargando-contenedor").attr("data-mensaje-servicio");
        switch(accion){
            case 'cargar':
                objContenedor.find(".ebus-asientos .cargando .cargando-contenedor").html(
                    '<img class="logo-ebus-cargando" src="./img/ebus_logo_carga.svg" alt="Logo Ebus">'+
                    '<label>'+Ebus.idioma_traduccion.texto_cargando+'...</label>'
                );
            break;
            case 'no-disponible':
                objContenedor.find(".ebus-asientos .cargando .cargando-contenedor").html(
                    '<i class="fas fa-exclamation-triangle"></i>'+
                    '<label>'+mensaje_servicio+'.</label>'
                );
            break;
        }
    },
    metodoCompletarDatos: function(objContenedor, metodo){
        var ebus_fila_busqueda = $(objContenedor).parents(".ebus-fila-busqueda");
        var id = ebus_fila_busqueda.attr("data-id");
        var dataMenu = ebus_fila_busqueda.attr("data-idmenus");
        var idempresa = Ebus.datos_viaje.ida.idempresa;
        if(Ebus.datos_viaje_estado.ida && Ebus.datos_viaje_estado.vuelta){
            var idempresas = [Ebus.datos_viaje.ida.idempresa, Ebus.datos_viaje.vuelta.idempresa];
            var idunicoempresa = (idempresas) => idempresas.filter((v,i) => idempresas.indexOf(v) === i);
            idempresa = idunicoempresa(idempresas).join(",");
        }
        var key_ruta = ebus_fila_busqueda.attr("data-keyruta");
        var sitio = ebus_fila_busqueda.attr("data-sitio");
        var params = 'metodo='+metodo;
        var clase_tipo_modal = '';
        params += "&id="+id;
        params += "&dataMenu="+dataMenu;
        params += "&idempresa="+idempresa;
        params += "&key_ruta="+key_ruta;
        params += "&sitio="+sitio;
        if(window.innerWidth <= Principal.width_responsive)clase_tipo_modal = 'modal-cuarto';
        else clase_tipo_modal = 'modal-tercero';
        modal_ncl(this.extension_idioma+'/index/completar-datos?'+params, clase_tipo_modal);
    },
    validarPasajeSeleccionado: function(objContenedor){
        var contenedor_viaje = objContenedor.find(".ebus-contenedor-viaje");
        var bloque_pasaje_ida = contenedor_viaje.find(".bloque[data-accion='ida']");
        var bloque_pasaje_vuelta = contenedor_viaje.find(".bloque[data-accion='vuelta']");
        if(this.estado_viaje.ida && !this.estado_viaje.vuelta){
            bloque_pasaje_ida.find(".asientos-seleccionados .piso > .numero").text('');
        }else if(this.estado_viaje.ida && this.estado_viaje.vuelta){
            this.calcularMontoTotalAsiento(objContenedor, {});
            bloque_pasaje_vuelta.find(".asientos-seleccionados .piso > .numero").text('');
        }
    },
    obtenerDatosPasaje: function(){
        var data = {};
        var ida = {};
        var ida_piso_1  = [];
        var ida_piso_2  = [];
        var vuelta = {};
        var vuelta_piso_1  = [];
        var vuelta_piso_2  = [];
        var total_ida = 0;
        var total_vuelta = 0;
        if(Object.keys(this.data_asientos).length > 0){
            for(i in this.data_asientos){
                if(this.data_asientos[i].pasaje == 'ida'){
                    if(this.data_asientos[i].num_piso == '1'){
                        ida_piso_1.push(this.data_asientos[i].num_asiento);
                    }else{
                        ida_piso_2.push(this.data_asientos[i].num_asiento);	
                    }
                    total_ida += parseFloat(this.data_asientos[i].precio_asiento);
                }else{
                    if(this.data_asientos[i].num_piso == '1'){
                        vuelta_piso_1.push(this.data_asientos[i].num_asiento);
                    }else{
                        vuelta_piso_2.push(this.data_asientos[i].num_asiento);	
                    }
                    total_vuelta += parseFloat(this.data_asientos[i].precio_asiento);
                }
            }
        }
        data = {
            ida: {
                informacion: this.datos_viaje.ida,
                piso_1: {
                    numero_asiento: ida_piso_1.join(',')
                },
                piso_2: {
                    numero_asiento: ida_piso_2.join(',')
                },
                total: total_ida
            },
            vuelta: {
                informacion: this.datos_viaje.vuelta,
                piso_1: {
                    numero_asiento: vuelta_piso_1.join(',')
                },
                piso_2: {
                    numero_asiento: vuelta_piso_2.join(',')
                },
                total: total_vuelta
            },
            total_pagar: Number.parseFloat(total_ida + total_vuelta).toFixed(2)
        };
        return data;
    },
    restaurarViaje: function(){
        $(".ebus-encabezado-viaje").hide();
        //this.actualizarSliderPrincipal(false);
        var data = [];
        if(Object.keys(this.data_asientos).length > 0){
            for(i in this.data_asientos){
                data.push(this.data_asientos[i]);
            }
        }
        this.desbloquearAsientosSeleccionados(data);
        this.init();
        $(".result-search").removeAttr('style');
        $(".ebus-buscador").removeAttr('style');
        $(".btn-buscar").click();
    },
    desbloquearAsientosSeleccionados: function(data){
        if(data.length > 0){
            console.log(data);
            $.post(this.extension_idioma+"/index/validar-estado-asientos",{data: JSON.stringify(data)}, function(response){
                console.log(response);
            }, 'json');
        }
    },
    guardarAsientosLocalStorage: function(){
        localStorage.setItem('data_asientos', JSON.stringify(this.data_asientos));
    },
    eliminarAsientosLocalStorage: function(){
        var data = [];
        var data_asientos = localStorage.getItem('data_asientos');
        data_asientos = JSON.parse(data_asientos);
        if(data_asientos != null && Object.keys(data_asientos).length > 0){
            for(i in data_asientos){
                data.push(data_asientos[i]);
            }
            this.desbloquearAsientosSeleccionados(data);
        }
        localStorage.removeItem('data_asientos');
    },
    iniciarCarouselTestimonios: function(objContenedor){
        objContenedor.find('.testimonio-carousel').owlCarousel({
            autoplay: true,
            items: 1,
            loop:true,
            margin:10,
            dots: false,
            nav:true,
            navText: ["<i class='fas fa-chevron-left'></i>", "<i class='fas fa-chevron-right'></i>"]
        });
    },
    obtenerDetallesServicio: function(servicio, idempresa, objContenedor){
        $.get(Ebus.extension_idioma+'/index/obtener-detalles-servicio',{'servicio':servicio,'idempresa':idempresa},function(data){
            var com_array = [];
            objContenedor.find('.terminos_condiciones').html(data.condiciones);
            for(var i in data.comodidades){
                var opcional = '';
                if(data.comodidades[i].opcional == 'S'){
                    com_array.push(1);
                    opcional = '<span class="text-primary">*</span>';
                }
                objContenedor.find('.comodidades').append('<li><div><i class="'+data.comodidades[i].icono+'"></i></div><div>'+data.comodidades[i].descripcion+' '+opcional+'</div></li>');
            }
            if(com_array.length > 0)objContenedor.find('.text-opcional').show();
            else objContenedor.find('.text-opcional').hide();
        });
    },
    obtenerComentariosServicio: function(objContenedor){
        objContenedor.find('.testimonio-carousel').owlCarousel('destroy').removeClass("owl-hidden").html('');
        var idrow = $(objContenedor).attr("data-id");
        var tipo_servicio = $(objContenedor).attr("data-servicio");
        objContenedor.find(".cargando-puntuacion").show();
        $.post(this.extension_idioma+"/index/obtener-comentarios-servicio",{
            tipo_servicio: tipo_servicio
        }, function(response){
            if(response.result == 'success'){
                objContenedor.find("[data-template='lista_comentarios']").html('');
                if(response.data.length){
                    for(i in response.data){
                        var div = $("<div>").addClass("item");
                        div.html(Ebus.plantilla_lista_comentarios.html());
                        div.find("[data-comentario='imagen']").attr("src", response.data[i].datos_usuario.urlimagenrs);
                        div.find("[data-comentario='usuario']").text(response.data[i].datos_usuario.nombres+" "+response.data[i].datos_usuario.apellidos);
                        div.find("[data-comentario='comentario']").text(response.data[i].comentario);
                        div.find(".calificaciones").html('');
                        for(y in response.data[i].calificaciones){
                            div.find(".calificaciones").append('<button type="button">'+
                            '<span data-comentario="calificacion">'+response.data[i].calificaciones[y].nombre+' </span>'+
                            '<span><span data-comentario="puntaje">'+response.data[i].calificaciones[y].puntaje+'</span> <i class="fas fa-star"></i>'+
                            '</span></button> ');
                        }
                        objContenedor.find("[data-template='lista_comentarios']").append(div);
                    }
                    Ebus.iniciarCarouselTestimonios(objContenedor);
                }
            }else{
                objContenedor.find(".mensage-puntuacion").show().text(Ebus.idioma_traduccion.texto_mensaje_sin_comentarios);
            }
            objContenedor.find(".cargando-puntuacion").hide();
            if(window.innerWidth <= Principal.width_responsive){
                modal_ncl(Ebus.extension_idioma + '/index/detalles-servicio?idrow=' + idrow, 'modal-cuarto');
            }
        }, 'json');
    },
    obtenerAsientosIdaRegistrados: function(objContenedor){
        if(Object.keys(Ebus.data_asientos).length > 0){
            for(i in Ebus.data_asientos){
                $(".bus-primer-piso[data-nivel='"+Ebus.data_asientos[i].num_piso+"'] .asiento[data-numasiento='"+Ebus.data_asientos[i].num_asiento+"']").removeClass("no-disponible").addClass("active");
		        $(".bus-segundo-piso[data-nivel='"+Ebus.data_asientos[i].num_piso+"'] .asiento[data-numasiento='"+Ebus.data_asientos[i].num_asiento+"']").removeClass("no-disponible").addClass("active");
            }
        }
    },
    guardarDatosBuscadorFiltroLocalStorage: function(){
        var datos = {
            origen: $(".select2-origen").val(),
            destino: $(".select2-destino").val(),
            ida: $("#fecha_viaje").val(),
            retorno: $("#fecha_retorno").val()
        };
        localStorage.setItem('data_buscador_filtro', JSON.stringify(datos));
    },
    actualizarEncabezado: function(){
        $(".header").addClass("horarios");
        $('html, body').animate({
            scrollTop: $("body").offset().top - 0
        }, 500);
    },
    iniciarFiltroFijo: function(){
        var filtro = $(".ebus-filtros .filtro");
        var altoEncabezadoViajeToFiltro = (!$(".ebus-encabezado-viaje").is(":visible"))?0:0;
        if(filtro.length){
            if(window.pageYOffset > Ebus.filtroPageYOffset){
                var n_alto = (window.innerWidth <= Principal.width_responsive)?120:0;
                var n_top = (window.pageYOffset-Ebus.filtroPageYOffset+n_alto);
                $(".ebus-filtros .filtro").css({"top":n_top+'px'});
            }else{
                $(".ebus-filtros .filtro").css({"top":0});
            }
        }
    },
    filtrarBuses: function(){
        dataListaHorarios(false);
    },
    iniciarViajeEncabezadoFijo: function(){
        var encabezado_viaje = $(".ebus-encabezado-viaje");
        var top = (window.innerWidth <= Principal.width_responsive) ? 56 : 83;
        if(encabezado_viaje.is(":visible")){
            if(window.pageYOffset >= top){
                encabezado_viaje.addClass("encabezado-viaje-fixed");
            }else{
                encabezado_viaje.removeClass("encabezado-viaje-fixed");
            }
        }
    },
    movilAntes: function(){
        if(window.innerWidth <= Principal.width_responsive){
            if(this.resultados_busqueda.is(":visible")){
                $(".ebus-header-opcion .menu").hide();
                $("footer.footer").hide();
            }
        }
    },
    movilDespues: function(){
        if(window.innerWidth <= Principal.width_responsive){
            if(this.encabezado_viaje.is(":visible")){
                if($(".ebus-portada.responsive .informacion:visible").length == 1){
                    $(".ebus-portada.responsive").css({"height": "146px"});
                }else{
                    $(".ebus-portada.responsive").css({"height": "230px"});
                }
            }else{
                $(".ebus-portada.responsive").css({"height": ""});
            }
            if(this.resultados_busqueda.is(":visible")){
                $(".lista-busqueda-filtros").show();
                //$(".ebus-header-opcion .menu").hide();
                //$("footer.footer").hide();
                $(".ebus-encabezado-viaje .lista ul li").nextAll().hide();
            }
        }
    },
    ocultarFilasBusqueda: function(objContenedor){
        if(window.innerWidth <= Principal.width_responsive){
            $(objContenedor).find(".contenedor-resultados").hide();
            var idrow = $(objContenedor).attr("data-id");
            $('.ebus-fila-busqueda').not('[data-id="'+idrow+'"]').hide();
            var contenedor_bus_informacion = '<div class="contenedor-resultados contenedor-bus-informacion" style="display: inherit;"><div class="imagen"></div><div class="origen-destino"></div></div>';
            $(objContenedor).find(".espacio-contenido-col .precios").prepend(contenedor_bus_informacion);
            var ebus_fila_busqueda = $(".ebus-fila-busqueda[data-id='"+idrow+"']");
            var contenido_imagen = ebus_fila_busqueda.find(".contenedor-resultados .bloque.imagen").clone();
            var origen_destino = ebus_fila_busqueda.find(".contenedor-resultados .bloque.origen-destino").clone();
            $(objContenedor).find(".contenedor-bus-informacion .imagen").html(contenido_imagen);
            $(objContenedor).find(".contenedor-bus-informacion .origen-destino").html(origen_destino);
            var contenedor_bus_boton = '<div class="contenedor-bus-boton" style="display: inherit;"><button type="buttom" class="ebus-btn ebus-btn-orange">Regresar</button></div>';
            $(objContenedor).find(".ebus-contenedor-bus").append(contenedor_bus_boton);
        }
    },
    validarCambioMoneda: function(moneda){
        if(this.resultados_busqueda.is(":visible")){
            modal_ncl(Ebus.extension_idioma+'/index/cambiar-moneda?moneda='+moneda, 'modal-segundo');
            return false;
        }else{
            this.cambiarMoneda(moneda);
        }
    },
    cambiarMoneda: function(moneda){
        if($(".menu-sandwich").is(":visible")){
            $(".boton-sandwich").click();
        }
        $('a[data-accion="moneda"]').removeClass("icon-active");
        var prefijo_moneda = moneda;
        if(prefijo_moneda == 'pen')$("a[data-hash='"+prefijo_moneda+"']").addClass("icon-active");
        else $("a[data-hash='"+prefijo_moneda+"']").addClass("icon-active");
        $("img.moneda").attr("src", "img/"+prefijo_moneda+".png")
        localStorage.setItem('ebus_moneda', prefijo_moneda);
        this.obtenerTipoCambioMoneda(prefijo_moneda);
    },
    obtenerTipoCambioMoneda: function(prefijo_moneda){
        if(prefijo_moneda === 'pen'){
            this.moneda = '';
        }else{
            $.get(this.extension_idioma+"/index/obtener-moneda", {
                codigo: prefijo_moneda
            }, function(data){
                if(Object.keys(data).length > 0){
                    Ebus.moneda = data;
                }
            });
        }
    }
};
$(document).on('click', '.ebus-header-opcion .menu ul li a.filtro', function(){
    var idmenu = $(this).attr("data-id");
    $('.ebus-header-opcion .menu ul li a.filtro').removeClass('menu-activo');
    $(".menu ul li a.filtro[data-id='"+idmenu+"']").addClass("menu-activo");
    dataListaHorarios(false);
});
$(document).off("click", ".bus-contenedor .asiento");
$(document).on("click", ".bus-contenedor .asiento", function(){
    if($(this).hasClass('path') || $(this).hasClass('bloqueado') || $(this).hasClass('no-disponible'))return;
    var objContenedor = $(this).parents(".ebus-fila-busqueda");
    var cantidad_maxima_asientos = objContenedor.attr("data-maxasientos");
    if(!$(this).hasClass('active')){
        if(parseInt(Object.keys(Ebus.data_asientos).length) >= parseInt(cantidad_maxima_asientos)){
            alert('Solo debes elegir '+cantidad_maxima_asientos+' asientos como máximo.');
            return;
        }
    }
    var keyServicio = objContenedor.attr("data-key");
    var idEmpresa = objContenedor.attr("data-idempresa");
    var idbus = objContenedor.attr("data-idbus");
    var idAsiento = $(this).attr("data-idasiento");
    var numasiento = $(this).attr("data-numasiento");
    var precio_asiento = $(this).attr("data-precio");
    var numpiso = $(this).parent().attr("data-nivel");
    Ebus.validarDisponiblidadAsiento(objContenedor, idEmpresa, numpiso, numasiento, keyServicio, idAsiento, idbus, precio_asiento, $(this));
});
$(document).on("click", ".contenedor-bus-boton", function(){
    $(this).hide();
    $(".ebus-fila-busqueda .contenedor-resultados").show();
    $(".ebus-fila-busqueda").find(".contenedor-bus-informacion .imagen").html('');
    $(".ebus-fila-busqueda").find(".contenedor-bus-informacion .origen-destino").html('');
    $('.ebus-tabs-informacion, .ebus-tabs').removeClass('current');
    $('.ebus-fila-busqueda .container').removeClass('active-detalle active-asiento');
    $('.ebus-fila-busqueda').show();
});
$(document).off("click", ".quitar-asiento");
$(document).on("click", ".quitar-asiento", function(){
    var objContenedor = $(this).parents(".ebus-fila-busqueda");
    var obj = $(this).parents(".row.fila-asiento");
    var idnumasiento = $(obj).attr("data-idnumasiento");
    var precio = $(obj).attr("data-precio");
    var asientoSeleccionado = $('.bus-contenedor .asiento[data-idnumasiento='+idnumasiento+']');
    asientoSeleccionado.removeClass('active');
    asientoSeleccionado.find(".asiento-contenedor label").removeAttr('style');
    asientoSeleccionado.find(".asiento-contenedor svg path").css({'fill':'none', 'stroke':' #333'});
    $(obj).remove();
    ocultarBotonCompletarDatos(objContenedor);
    calcularMontoTotalPagar(objContenedor);
});
function ocultarBotonCompletarDatos(objContenedor){
    var totalAsientos = $(objContenedor).find(".lista-asientos .asientos-seleccionados .row.fila-asiento").length;
    if(totalAsientos > 0)$(objContenedor).find(".fila-completar-datos").show();
    else $(objContenedor).find(".fila-completar-datos").hide();
}
$(document).off("click", ".ebus-asientos .precios ul li a.filtro");
$(document).on("click", ".ebus-asientos .precios ul li a.filtro", function(){
    var objContenedor = $(this).parents(".ebus-fila-busqueda");
    objContenedor.find(".ebus-asientos .precios ul li a.filtro").removeClass("active");
    $(this).addClass("active");
    var precio = $(this).attr("data-precio");
    if(precio != ''){
        objContenedor.find(".bus-contenedor .asiento").each(function(){
            if(!$(this).hasClass('path')){
                if ($.trim($(this).attr("data-precio")).search(new RegExp(precio, "i")) < 0) {
                    $(this).addClass("filtro-bloqueado");
                    $(this).attr("data-estado", 0);
                }else{
                    $(this).removeClass("filtro-bloqueado");
                    $(this).attr("data-estado", 1);
                }
            }
        });
    }else{
        objContenedor.find(".bus-contenedor .asiento").attr("data-estado", 1).removeClass("filtro-bloqueado");
    }
});
$(document).ready(function () {
    $(".ebus-encabezado-viaje .btn-ida-cambiar").click(function(){
        modal_ncl(Ebus.extension_idioma+'/index/restaurar-viaje', 'modal-segundo');
        return false;
    });
    $('.lista-socios-carousel').owlCarousel({
        autoplay: true,
        loop:true,
        margin:10,
        nav:false,
        items:4,
        dotsEach: 1,
        navText: ['', ''],
        responsiveClass:true,
        pagination :false,
        slideSpeed : 2000,
        responsive:{
            0:{
                items:1,
                nav:true
            },
            600:{
                items:2,
                nav:false
            },
            1000:{
                items:4,
                nav:true,
                loop:false
            }
        }
    });
    $(".select2-origen").select2({
        selectOnClose: true,
        placeholder: Ebus.idioma_traduccion.texto_origen,
        dropdownParent: $('.localidad-origen'),
        minimumInputLength: 1,
        allowClear: false,
        sorter: function(results) {
            var query = $('.select2-search__field').val().toLowerCase();
            return results.sort(function(a, b) {
                return a.text.toLowerCase().indexOf(query) - b.text.toLowerCase().indexOf(query);
            });
        },
        matcher: function(params, data){
            if ($.trim(params.term) === '')return data;
            if (typeof data.text === 'undefined')return null;
            if (data.text.toLowerCase().replace(" - "," ").indexOf(params.term.toLowerCase()) > -1) {
                var modifiedData = $.extend({}, data, true);
                return modifiedData;
            }
            return null;
        }
    });
    $(".select2-destino").select2({
        selectOnClose: true,
        placeholder: Ebus.idioma_traduccion.texto_destino,
        dropdownParent: $('.localidad-destino'),
        minimumInputLength: 1,
        allowClear: false,
        sorter: function(results) {
            var query = $('.select2-search__field').val().toLowerCase();
            return results.sort(function(a, b) {
                return a.text.toLowerCase().indexOf(query) - b.text.toLowerCase().indexOf(query);
            });
        },
        matcher: function(params, data){
            if ($.trim(params.term) === '')return data;
            if (typeof data.text === 'undefined')return null;
            if (data.text.toLowerCase().replace(" - "," ").indexOf(params.term.toLowerCase()) > -1) {
                var modifiedData = $.extend({}, data, true);
                return modifiedData;
            }
            return null;
        }
    });
    if(window.outerWidth > 640){
        $(".select2-origen, .select2-destino").on('select2:opening', function (e) {
            $('.ebus-buscador .filtros [data-toggle="tooltip"]').tooltip('dispose');
            $(this).parents('.group-input-icon').addClass('hover-input-buscador');
        });
        $(".select2-origen, .select2-destino").on('select2:close', function (e) {
            $('.ebus-buscador .filtros [data-toggle="tooltip"]').tooltip('dispose');
        });
        $(".select2-origen, .select2-destino").change(function (e) {
            if ($(this).val() != '') {
                $(".select2-selection__rendered").css({'opacity': 'inherit'});
                if ($(this).hasClass('select2-origen'))
                    $(".select2-destino").select2('open');
                if ($(this).hasClass('select2-destino'))
                    $("#fecha_viaje").focus();
            } else {
                $(".select2-selection__rendered").css({'opacity': '1'});
            }
        });
        $(".select2-origen").on('select2:close', function (e) {
            $(".select2-destino").select2('open');
            $(this).parent('.group-input-icon').removeClass('hover-input-buscador');
        });
        $(".select2-destino").on('select2:close', function (e) {
            $("#fecha_viaje").focus();
            $(this).parent('.group-input-icon').removeClass('hover-input-buscador');
        });
    }
    $("#fecha_viaje").datepicker({
        language: "es",
        todayBtn: 1,
        autoclose: true,
        orientation: "auto",
        container: ".filtro-fecha-viaje",
        startDate: "today",
        format: 'dd/mm/yyyy'
    }).on('show', function(e){
        $(".datepicker-dropdown").removeAttr("style").css({'display':'block'});
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $('#fecha_retorno').datepicker('setStartDate', minDate);
    });
    $("#fecha_retorno").datepicker({
        language: "es",
        todayBtn: 1,
        autoclose: true,
        orientation: "auto",
        container: ".filtro-fecha-retorno",
        startDate: "today",
        format: 'dd/mm/yyyy',
    }).on('show', function(e){
        $(".datepicker-dropdown").removeAttr("style").css({'display':'block'});
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $('#fecha_viaje').datepicker('setEndDate', minDate);
        $('.ebus-buscador .filtros [data-toggle="tooltip"]').tooltip('dispose');
    });
    $('.btn-buscar').keyup(function(e){
        if(e.keyCode == 13)$('.btn-buscar').click();
    });
    $(document).on('focus', '#fecha_viaje, #fecha_retorno', function (e) {
        $(this).parents('.group-input-icon').addClass('hover-input-buscador');
    });
    $(document).on('blur', '#fecha_viaje, #fecha_retorno', function (e) {
        $(this).parents('.group-input-icon').removeClass('hover-input-buscador');
    });
    $(document).on('click','a[data-template=direccion_embarque_mapa], a[data-template=direccion_desembarque_mapa]',function(e){
        e.preventDefault();
        var direccion = $(this).attr('data-direccion');
        geocoder.geocode({'address': direccion}, function(results, status) {
            if (status === 'OK') {
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                window.open('http://maps.google.com/maps?z=10&q='+lat+','+lng,'_agencias_ebus');
            }
        });
    });
    var idContenedorTabs = '';
    $(document).off('click','.ebus-tabs-informacion');
    $(document).on('click','.ebus-tabs-informacion', function(){
        var objContenedor = $(this).parents('.ebus-fila-busqueda');
        var keyServicio = $(objContenedor).attr("data-key");
        var idempresa = $(objContenedor).attr("data-idempresa");
        var servicio = $(objContenedor).attr("data-servicio");
        var tab_id = $(this).attr('data-tab');
        if(window.innerWidth <= Principal.width_responsive){
            if(tab_id == 'detalle'){
                Ebus.obtenerDetallesServicio(servicio, idempresa, objContenedor);
                Ebus.obtenerComentariosServicio(objContenedor);
                return;
            }
        }
        if(idContenedorTabs != objContenedor.attr('data-id')){
            idContenedorTabs = objContenedor.attr('data-id');
            $('.ebus-tabs-informacion, .ebus-tabs').removeClass('current');
            $('.ebus-fila-busqueda .container').removeClass('active-detalle active-asiento');
            $('.ebus-tabs-informacion').removeClass('disabled');
        }
        if(tab_id == 'detalle'){
            if(!$(this).hasClass('current')){
                objContenedor.find(".container").removeClass("active-asiento");
                objContenedor.find(".container").addClass("active-detalle");
                objContenedor.find('.comodidades').html('');
                Ebus.obtenerDetallesServicio(servicio, idempresa, objContenedor);
                Ebus.obtenerComentariosServicio(objContenedor);
            }else{
                objContenedor.find(".container").removeClass("active-detalle");
            }
        }else if(tab_id == 'asiento'){
            if(window.innerWidth <= Principal.width_responsive){
                objContenedor.find(".ebus-asientos").removeAttr("style");
            }
            if(!$(this).hasClass('current')){
                objContenedor.find(".ebus-asientos").hide();
                objContenedor.find(".btn-precio-asiento").hide();
                objContenedor.find(".btn-precio-asiento-cargando").show();
                objContenedor.find(".ebus-tabs-informacion[data-tab='detalle']").addClass("disabled");
                if(Ebus.datos_viaje_estado.ida && !Ebus.viaje_retorno && Ebus.id_viaje_ida != objContenedor.attr("data-id")){
                    $("div[data-id='"+Ebus.id_viaje_ida+"']").find(".container").addClass("active-asiento");
                    $("div[data-id='"+Ebus.id_viaje_ida+"']").find('.ebus-asientos').addClass('current');
                    modal_ncl(Ebus.extension_idioma+'/index/restaurar-viaje', 'modal-segundo');
                    return false;
                }
                Ebus.ocultarFilasBusqueda(objContenedor);
                objContenedor.find(".container").removeClass("active-detalle");
                //objContenedor.find(".container").addClass("active-asiento");
                //Ebus.mensajeCargarContenidoBus(objContenedor, 'cargar');
                objContenedor.find(".lista-asientos .asientos-seleccionados").html('');
                objContenedor.find(".lista-asientos .asientos-seleccionados .fila-completar-datos").hide();
                objContenedor.find(".ebus-asientos .bus").html('');
                var params = {
                    'key': keyServicio,
                    'idempresa': idempresa,
                    'servicio':servicio,
                    'moneda': Ebus.moneda_codigo
                };
                $.get(Ebus.extension_idioma+'/index/obtener-asientos-disponibles',params, function(data){
                    console.log(data);
                    if(!data.ASIENTOS.length){
                        Ebus.mensajeCargarContenidoBus(objContenedor, 'no-disponible');
                        setTimeout(function(){
                            objContenedor.find('.ebus-tabs-informacion').removeClass('current');
                            objContenedor.find('.ebus-tabs').removeClass('current');
                        }, 1000);
                        return;
                    }
                    var dataFiltroPrecios = data.FILTRO_PRECIOS;
                    var dataAsientos = data.ASIENTOS;
                    var dataParametros = data.PARAMETROS;
                    var totalPisos = [];
                    var dataPosicion = data.POSICION.toLowerCase();
                    var divContenedorBusSuperior = $('<div/>').addClass('bus-superior').addClass(dataPosicion);
                    var divContenedorBusContenedor = $('<div/>').addClass('bus-contenedor').addClass(dataPosicion);
                    var divContenedorBusCuerpo = $('<div/>').addClass('bus-cuerpo').addClass(dataPosicion);
                    var divContenedorBusInferior = $('<div/>').addClass('bus-inferior').addClass(dataPosicion);
                    var divContenedorBusPrimeroPiso = $('<div/>').addClass('bus-primer-piso').css({
                        'position': 'relative',
                        'width': dataParametros.p1.ancho+'px',
                        'height': dataParametros.p1.alto+'px'
                    });
                    var divContenedorBusSegundoPiso = $('<div/>').addClass('bus-segundo-piso').css({
                        'position': 'relative',
                        'width': dataParametros.p2.ancho+'px',
                        'height': dataParametros.p2.alto+'px'
                    });
                    /* Asientos disponibles */
                    if(typeof dataParametros.mt_disponibilidad != 'undefined'){
                        if(Object.keys(dataParametros.mt_disponibilidad).length > 0){
                            var precio = Object.keys(dataParametros.mt_disponibilidad)[0];
                            var cantidad = dataParametros.mt_disponibilidad[precio];
                            if(precio != 1000000){
                                objContenedor.find('[data-template="tarifa"]').eq(0).text(Ebus.moneda_simbolo+' '+Number.parseFloat(precio).toFixed(2));
                            }
                            objContenedor.find('[data-template="informacion-asientos"]').eq(0).text(cantidad+' '+Ebus.idioma_traduccion.texto_asientos_disponibles);
                        }
                    }
                    /**/
                    var anchoAltoContenedorBusCuerpo = 0;
                    var distanciaPrimerPiso = 36;
                    objContenedor.find(".ebus-asientos .precios ul").html('').append('<li><a class="filtro ebus-btn ebus-btn-orange active" data-precio="" href="javascript:void(0);">'+Ebus.idioma_traduccion.texto_todos+'</a></li>');
                    for(p in dataFiltroPrecios){
                        var precio_filtro = dataFiltroPrecios[p];
                        objContenedor.find(".ebus-asientos .precios ul").append('<li><a class="filtro ebus-btn ebus-btn-orange" data-precio="'+precio_filtro+'" href="javascript:void(0);">'+Ebus.moneda_simbolo+' '+precio_filtro+'</a></li>');
                    }
                    objContenedor.find(".contenedor-bus").removeClass('h v').html('');
                    for(a in dataAsientos){
                        var divContenedorBusCuerpoAsiento = $('<div/>').addClass('asiento');
                        var divElemento = $('<div/>').addClass('elemento').addClass(dataPosicion);
                        var textoNumeroAsiento = $('<label/>').addClass(dataPosicion).text(dataAsientos[a].data_bus.ASIENTO);
                        var svgAsiento = dataParametros.icon;
                        var divPathElemento = $('<div/>');
                        var imgPathElemento = $('<img/>');
                        var idAsiento = (dataAsientos[a].data_bus.IDASIENTO != undefined)?dataAsientos[a].data_bus.IDASIENTO:0;
                        if(!dataAsientos[a].data_bus.DISPONIBLE)divContenedorBusCuerpoAsiento.addClass('no-disponible');
                        if(dataAsientos[a].data_bus.ELEMENTO == 'ASIENTO PAX'){
                            divContenedorBusCuerpoAsiento.attr("data-precio", dataAsientos[a].data_bus.TARIFA_TOTAL);
                            divContenedorBusCuerpoAsiento.attr("data-hash", dataAsientos[a].data_bus.HASH);
                            divContenedorBusCuerpoAsiento.attr("data-estado", 1);
                            divContenedorBusCuerpoAsiento.attr("data-numasiento", dataAsientos[a].data_bus.ASIENTO);
                            divContenedorBusCuerpoAsiento.attr("data-idasiento", idAsiento);
                            divContenedorBusCuerpoAsiento.attr("data-idnumasiento", "P"+dataAsientos[a].data_bus.NIVEL_PISO+"_"+dataAsientos[a].data_bus.ASIENTO);
                            divElemento.append(textoNumeroAsiento).append(svgAsiento);
                        }else if(dataAsientos[a].data_bus.ELEMENTO == 'ESCALERA'){
                            divContenedorBusCuerpoAsiento.addClass('path');
                            divPathElemento.addClass('h_escalera');
                            imgPathElemento.attr("width", "100%");
                            divPathElemento.append(imgPathElemento)
                            divElemento.append(divPathElemento);
                        }else if(dataAsientos[a].data_bus.ELEMENTO == 'TV'){
                            divContenedorBusCuerpoAsiento.addClass('path');
                            divPathElemento.addClass('h_tv');
                            divElemento.append(divPathElemento);
                        }else{
                            divContenedorBusCuerpoAsiento.addClass('path');
                            divPathElemento.addClass('h_bano');
                            divElemento.append(divPathElemento);
                        }
                        divContenedorBusCuerpoAsiento.css({
                            'width': dataAsientos[a].ancho,
                            'height': dataAsientos[a].alto,
                        });
                        if(parseInt(dataAsientos[a].data_bus.NIVEL_PISO) == 1){
                            divContenedorBusPrimeroPiso.attr({
                                'data-nivel': 1
                            });
                            divContenedorBusCuerpoAsiento.css({
                                'left': dataAsientos[a].x,
                                'top': dataAsientos[a].y
                            });
                            divContenedorBusPrimeroPiso.append(divContenedorBusCuerpoAsiento.append(divElemento));
                            if(totalPisos.indexOf(1) == -1)totalPisos.push(1);
                        }else{
                            divContenedorBusSegundoPiso.attr({
                                'data-nivel': 2
                            });
                            if(dataPosicion == 'v'){
                                divContenedorBusCuerpoAsiento.css({
                                    'left': dataAsientos[a].x,
                                    'top': dataAsientos[a].y - dataParametros.p1.alto - dataAsientos[a].alto
                                });
                            }else{
                                divContenedorBusCuerpoAsiento.css({
                                    'left': dataAsientos[a].x - dataParametros.p1.ancho - dataAsientos[a].ancho,
                                    'top': dataAsientos[a].y
                                });
                            }
                            divContenedorBusSegundoPiso.append(divContenedorBusCuerpoAsiento.append(divElemento));
                            if(totalPisos.indexOf(2) == -1)totalPisos.push(2);
                        }
                    }
                    divContenedorBusPrimeroPiso.append('<div class="nombre_piso">'+Ebus.idioma_traduccion.texto_pimer_piso.toUpperCase()+'</div>');
                    if(totalPisos.length > 1){
                        if(dataPosicion == 'v'){
                            divContenedorBusSegundoPiso.css({
                                'margin-top': distanciaPrimerPiso
                            });
                        }else{
                            divContenedorBusSegundoPiso.css({
                                'margin-left': distanciaPrimerPiso
                            });
                        }
                        if(divContenedorBusSegundoPiso.find('.elemento').length > 10){
                            divContenedorBusSegundoPiso.append('<div class="separador-pisos"></div>');
                            divContenedorBusSegundoPiso.append('<div class="nombre_piso">'+Ebus.idioma_traduccion.texto_segundo_piso.toUpperCase()+'</div>');
                            divContenedorBusSegundoPiso.css({
                                'margin-top': distanciaPrimerPiso + 14
                            });
                        }
                    }
                    divContenedorBusCuerpo.append(divContenedorBusPrimeroPiso).append(divContenedorBusSegundoPiso);
                    divContenedorBusCuerpo.append('<div class="cargando" style="opacity: 0.8;display: none;background: #7d95bc;">'+
                        '<div class="cargando-contenedor"><img class="logo-ebus-cargando" src="./img/ebus_logo_carga.svg"><label>'+Ebus.idioma_traduccion.texto_cargando+'...</label></div>'+
                    '</div>');
                    divContenedorBusContenedor.append(divContenedorBusCuerpo);
                    objContenedor.find(".contenedor-bus").append('<div class="road-v-t-l"></div><div class="road-v-t-r"></div><div class="road-v-b-l"></div><div class="road-v-b-r"></div>');
                    objContenedor.find(".contenedor-bus").addClass(dataPosicion).append(divContenedorBusSuperior).append(divContenedorBusContenedor).append(divContenedorBusInferior);
                    if(dataPosicion == 'v'){
                        if(totalPisos.length > 1)anchoAltoContenedorBusCuerpo = parseFloat(dataParametros.p1.alto) + parseFloat(dataParametros.p2.alto) + distanciaPrimerPiso;
                        else anchoAltoContenedorBusCuerpo = parseFloat(dataParametros.p1.alto);
                        objContenedor.find(".bus-contenedor, .bus-cuerpo").css({
                            'height': anchoAltoContenedorBusCuerpo + 'px'
                        });
                    }else{
                        if(dataParametros.p2.ancho<0)dataParametros.p2.ancho=0;
                        if(totalPisos.length > 1)anchoAltoContenedorBusCuerpo = parseFloat(dataParametros.p1.ancho)+parseFloat(dataParametros.p2.ancho) + distanciaPrimerPiso;
                        else anchoAltoContenedorBusCuerpo = parseFloat(dataParametros.p1.ancho);
                        objContenedor.find(".bus-contenedor").css({
                            'width': anchoAltoContenedorBusCuerpo + 'px'
                        });
                    }
                    objContenedor.find(".container.active-asiento:after").css({
                        'border-bottom-color': '#ebebeb'
                    });
                    objContenedor.find(".ebus-asientos .cargando").hide().find(".accion").hide();
                    objContenedor.find(".ebus-asientos .container").show();
                    if(Ebus.id_viaje_ida != objContenedor.attr("data-id")){
                        Ebus.validarEstadoAsientos();
                        Ebus.validarPasajeSeleccionado(objContenedor);
                    }else{
                        if(!Ebus.viaje_retorno){
                            Ebus.obtenerAsientosIdaRegistrados(objContenedor);
                        }
                    }
                    Ebus.id_viaje_ida = objContenedor.attr("data-id");
                    Ebus.obtenerDatosViaje(objContenedor);
                    if(window.innerWidth <= Principal.width_responsive){
                        objContenedor.find(".ebus-asientos.current").css({
                            "height": "inherit",
                            "max-height": "inherit"
                        });
                    }
                    objContenedor.find(".btn-precio-asiento").show();
                    objContenedor.find(".btn-precio-asiento-cargando").hide();
                    objContenedor.find(".ebus-asientos").show();
                    objContenedor.find(".container").addClass("active-asiento");
                });
            }else{
                objContenedor.find(".container").removeClass("active-asiento");
                objContenedor.find(".ebus-tabs-informacion[data-tab='detalle']").removeClass("disabled");
            }
        }
        $('html, body').animate({
            scrollTop: $("[data-id='"+objContenedor.attr('data-id')+"']").offset().top - Ebus.fila_busqueda_top
        }, 500);
        if($(this).hasClass('current')){
            objContenedor.find('.ebus-tabs-informacion').removeClass('current');
            objContenedor.find('.ebus-tabs').removeClass('current');
        }else{
            objContenedor.find('.ebus-tabs-informacion').removeClass('current');
            objContenedor.find('.ebus-tabs').removeClass('current');
            $(this).addClass('current');
            objContenedor.find('.ebus-tabs[data-id="'+tab_id+'"]').addClass('current'); 
        }
    });
});
function iniciarRangoSlider(data, moneda = ''){
    if(data.length){
        for(i in data){
            if(Object.keys(data[i].datos).length > 0){
                var objAccordion = $(".filtro-accordion .accordion-group[data-accion='"+data[i].accion+"']");
                if(objAccordion.length){
                    objAccordion.find(".vertical-progress-bar").hide();
                    objAccordion.find(".js-chart").show();
                    Ebus.filtro_header_opciones.find(".menu .ebus-btn.filtro").removeClass("disabled");
                }
            }
            var contenidoBar = $(".js-chart[data-accion='"+data[i].accion+"']");
            contenidoBar.find(".js-bar-chart").attr({
                "data-step":  data[i].datos.step,
                "data-labels": "["+JSON.stringify(data[i].datos.dataLabels)+"]",
                "data-series": "["+JSON.stringify(data[i].datos.dataSeries)+"]"
            });
            contenidoBar.find(".js-range-slider-"+data[i].accion).attr({
                "data-step": data[i].datos.step,
                "data-min": data[i].datos.min,
                "data-max": data[i].datos.max,
                "data-from": data[i].datos.min,
                "data-to": data[i].datos.max,
            });
            initRangeSlider(contenidoBar.find(".js-range-slider-"+data[i].accion), data[i].accion);
            initCharts(contenidoBar.find(".js-bar-chart"), data[i].accion);
            if(data[i].accion == 'precio'){
                $(".js-chart[data-accion='precio']  div.d-flex div span.text-muted:first-child").text(moneda);
            }
        }
    }
}
function initRangeSlider(obj, accion) {
    var $this = $(obj),
    type = $this.data('type'),
    minResult = $this.data('result-min'),
    step = $this.data('step'),
    maxResult = $this.data('result-max'),
    graphForegroundTarget = $this.data('foreground-target'),
    prefijoSliderLeft = (accion != 'precio')?'H':'',
    prefijoSliderRight = (accion != 'precio')?'H':'',
    minIntervalSlider = (accion != 'precio')?2:parseFloat(step);
    $this.ionRangeSlider({
        step: parseFloat(step),
        hide_min_max: true,
        hide_from_to: true,
        min_interval: minIntervalSlider,
        onStart: function (data) {
            if(accion == 'precio'){
                data.from = parseFloat(data.from).toFixed(2);
                data.to = parseFloat(data.to).toFixed(2);
            }
            if (graphForegroundTarget) {
                var w = (100 - (data.from_percent + (100 - data.to_percent)));
                $(graphForegroundTarget).css({
                    left: data.from_percent + '%',
                    width: w + '%'
                });
                $(graphForegroundTarget + '> *').css({
                    width: $(graphForegroundTarget).parent().width(),
                    'transform': 'translateX(-' + data.from_percent + '%)'
                });
            }
            if (minResult || maxResult && type === 'double') {
                if ($(minResult).is('input')) {
                    $(minResult).val(data.from);
                } else {
                    $(minResult).text(data.from + ' ' + prefijoSliderLeft);
                }
                if ($(minResult).is('input')) {
                    $(maxResult).val(data.to);
                } else {
                    $(maxResult).text(data.to + ' ' + prefijoSliderRight);
                }
            }
        },
        onChange: function (data) {
            if(accion == 'precio'){
                data.from = parseFloat(data.from).toFixed(2);
                data.to = parseFloat(data.to).toFixed(2);
            }
            if (graphForegroundTarget) {
                var w = (100 - (data.from_percent + (100 - data.to_percent)));
                $(graphForegroundTarget).css({
                    left: data.from_percent + '%',
                    width: w + '%'
                });
                $(graphForegroundTarget + '> *').css({
                    width: $(graphForegroundTarget).parent().width(),
                    'transform': 'translateX(-' + data.from_percent + '%)'
                });
            }
            if (minResult || maxResult && type === 'double') {
                if ($(minResult).is('input')) {
                    $(minResult).val(data.from);
                } else {
                    $(minResult).text(data.from + ' ' + prefijoSliderLeft);
                }
                if ($(minResult).is('input')) {
                    $(maxResult).val(data.to);
                } else {
                    $(maxResult).text(data.to + ' ' + prefijoSliderRight);
                }
            }
        },
        onFinish: function (data) {
            Ebus.filtrarBuses();
        },
        onUpdate: function (data) {}
    });

    var slider = $this.data('ionRangeSlider');
    slider.update({
        step: parseFloat($(obj)[0].dataset.step),
        min: $(obj)[0].dataset.min,
        max: $(obj)[0].dataset.max,
        from: $(obj)[0].dataset.min,
        to: $(obj)[0].dataset.max,
        min_interval: minIntervalSlider,
    });

    $(minResult).text($(obj)[0].dataset.min + ' ' + prefijoSliderLeft);
    $(maxResult).text($(obj)[0].dataset.max + ' ' + prefijoSliderRight);

    $(window).on('resize', function () {
        $(graphForegroundTarget + '> *').css({
            width: $(graphForegroundTarget).parent().width()
        });
    });
}
function initCharts(obj, accion) {
    $(obj).each(function (i, el) {
        $(el).css({'transform': 'translateX(0%)'}).parent().css({'left': '0%', 'width': '100%'});
        var optStrokeWidth = $(el).data('stroke-width'),
        optStrokeColor = $(el).data('stroke-color'),
        optContentWidth = $(el).data('content-width'),
        step = parseFloat(el.getAttribute('data-step'));
        $(el).attr('id', accion+'barCharts' + i);
        $('<style id="'+accion+'barChartsStyle' + i + '"></style>').insertAfter($(el));
        var barChartStyles = '',
        optSeries = JSON.parse(el.getAttribute('data-series')),
        optLabels = JSON.parse(el.getAttribute('data-labels')),
        optHeight = $(el).data('height'),
        optHigh = $(el).data('high'),
        optLow = $(el).data('low'),
        optDistance = $(el).data('distance'),
        optIsShowAxisX = Boolean($(el).data('is-show-axis-x')),
        optIsShowAxisY = Boolean($(el).data('is-show-axis-y')),
        optTotalStrokeWidth = (accion != 'precio')?14:14,
        data = {
            labels: optLabels,
            series: optSeries
        },
        options = {
            width: '100%',
            height: 100,
            axisX: {
                offset: 0,
                scaleMinSpace: 0,
                showGrid: false,
                showLabel: false
            },
            axisY: {
                offset: 0,
                scaleMinSpace: 0,
                showGrid: false,
                showLabel: false
            },
            chartPadding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        };
        var chart = new Chartist.Bar(el, data, options),
        isOnceCreatedTrue = 1;
        chart.on('created', function () {
            if (isOnceCreatedTrue == 1) {
                $(el).find('.ct-series').each(function () {
                    barChartStyles += '#'+accion+'barCharts' + i + ' .ct-series .ct-bar {stroke-width: ' + optTotalStrokeWidth + '; stroke: ' + optStrokeColor + '}';
                });
                $('#'+accion+'barChartsStyle' + i).text(barChartStyles);
            }
            isOnceCreatedTrue++;
        });
        chart.update();
    });
}
window.onscroll = function (event) {
    var scroll = this.scrollY;
    Ebus.iniciarFiltroFijo();
    Ebus.iniciarViajeEncabezadoFijo();
    if($(".ebus-home").is(":visible")){
        if(scroll > 0){
            if(window.innerWidth <= Principal.width_responsive){
                $("header.header").addClass("fixed");
            }
        }else{
            $("header.header").removeClass("fixed");
        }
    }else{
        $("header.header").removeClass("fixed");
    }
};
window.onload = function(){
    if(window.innerWidth <= Principal.width_responsive){
        $(".select2-origen").select2('destroy');
        $(".select2-destino").select2('destroy');
    }
    if(localStorage.getItem('ebus_moneda')){
        $(".select-moneda-sandwich").val(localStorage.getItem('ebus_moneda'));
    }
}