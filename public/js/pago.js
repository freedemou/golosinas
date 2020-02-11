var Pago = {
    extension_idioma: '',
    idioma_traduccion: '',
    pago_id: '',
    pago_body: $(".pago-body"),
    template_header: $("[data-pago-template='pago_header']"),
    template_body: $("[data-pago-template='pago_body']"),
    template_footer: $("[data-pago-template='pago_footer']"),
    pago_contenedor: $(".pago-contenedor"),
    pago_cargando: $(".pago-cargando"),
    contenedor_datos_viaje: $(".contenedor-datos-viaje"),
    sp_fila_asiento: $(".sp_fila_asiento"),
    base_url: '',
    init: function(){
        this.obtenerDatosVenta(this.pago_id);
    },
    obtenerDatosVenta: function(id){
        setTimeout(function(){
            $.post(Pago.extension_idioma+"/pago/obtener-datos-venta", {id: id}, function(data) {
                console.log(data);
                if(Object.keys(data).length > 0){
                    Pago.pago_contenedor.show();
                    Pago.pago_cargando.hide();
                    var datos_venta = JSON.parse(data.datos_venta);
                    console.log(datos_venta);
                    var datos_ida = datos_venta.ida;
                    var datos_retorno = datos_venta.retorno;
                    var informacion_pago = datos_venta.pago;
                    var moneda_simbolo = (data.data_moneda != undefined) ? data.data_moneda.simbolo : 'S/';
                    /********************************************************************/
                    /******************************* VIAJE IDA **************************/
                    /********************************************************************/
                    /**************************** HEADER [INICIO] ***********************/
                    var contenedor_ida = $("<div>").addClass("sp_contenedor_ida");
                    var template_header = $("<div>").addClass("sp_header");
                    template_header.html(Pago.template_header.html());
                    var logo = datos_ida.informacion.logo_empresa.split("./");
                    var url_logo = Pago.base_url+"/"+logo[1];
                    template_header.find("[data-pago-template='logo']").attr("src", url_logo);
                    template_header.find("[data-pago-template='origen']").text(datos_ida.informacion.origen);
                    template_header.find("[data-pago-template='destino']").text(datos_ida.informacion.destino);
                    template_header.find("[data-pago-template='bus_servicio']").text(datos_ida.informacion.bus_servicio);
                    template_header.find("[data-pago-template='moneda_simbolo']").text(moneda_simbolo);
                    template_header.find("[data-pago-template='total_pagar']").text(parseFloat(datos_ida.total).toFixed(2));
                    var fecha_embarque = datos_ida.informacion.fecha_viaje.split("/");
                    fecha_embarque = fecha_embarque[2]+"/"+fecha_embarque[1]+"/"+fecha_embarque[0];
                    var fecha_1_embarque = moment(fecha_embarque).format('dddd D, MMMM');
                    var fecha_2_embarque = fecha_1_embarque + " del";
                    var fecha_3_embarque = fecha_2_embarque + " " + moment(fecha_embarque).format('YYYY');
                    fecha_3_embarque += " a las " + datos_ida.informacion.hora_embarque;
                    template_header.find("[data-pago-template='fecha_hora']").text(fecha_3_embarque);
                    template_header.find("[data-pago-template='terminal_embarque']").text(datos_ida.informacion.terminal_embarque);
                    template_header.find("[data-pago-template='direccion_embarque']").text(datos_ida.informacion.direccion_embarque);
                    template_header.find("[data-pago-template='direccion_embarque_mapa']").attr("data-direccion", datos_ida.informacion.direccion_embarque);
                    template_header.find("[data-pago-template='terminal_desembarque']").text(datos_ida.informacion.terminal_desembarque);
                    template_header.find("[data-pago-template='direccion_desembarque']").text(datos_ida.informacion.direccion_desembarque);
                    template_header.find("[data-pago-template='direccion_desembarque_mapa']").attr("data-direccion", datos_ida.informacion.direccion_desembarque);

                    contenedor_ida.append(template_header);
                    /**************************** HEADER [FIN] ***********************/
                    /**************************** BODY [INICIO] ***********************/
                    var template_body = $("<div>").addClass("sp_body");
                    var data_asientos_ida = datos_ida.asientos;
                    for(i in data_asientos_ida){
                        var fila_asiento = $("<div>").addClass("sp_fila_asiento");
                        var id_fila = "ida_" + i;
                        fila_asiento.attr("data-id", id_fila);
                        fila_asiento.html(Pago.template_body.html());
                        if(data_asientos_ida[i].informacion.idempresa == 1){
                            fila_asiento.find("[data-pago-template='usuario']").text(data_asientos_ida[i].data.nombres.value+" "+data_asientos_ida[i].data.apellido_paterno.value+" "+data_asientos_ida[i].data.apellido_materno.value);
                            fila_asiento.find("[data-pago-template='u_apellidos']").text(data_asientos_ida[i].data.apellido_paterno.value+" "+data_asientos_ida[i].data.apellido_materno.value);
                        }else{
                            fila_asiento.find("[data-pago-template='usuario']").text(data_asientos_ida[i].data.nombres.value);
                        }
                        fila_asiento.find("[data-pago-template='u_nombres']").text(data_asientos_ida[i].data.nombres.value);
                        fila_asiento.find("[data-pago-template='numero_asiento']").text(data_asientos_ida[i].informacion.num_asiento);
                        fila_asiento.find("[data-pago-template='nivel_asiento']").text(data_asientos_ida[i].informacion.num_piso);
                        fila_asiento.find("[data-pago-template='u_tipo_documento']").text(data_asientos_ida[i].data.tipo_documento.value);
                        fila_asiento.find("[data-pago-template='u_numero_documento']").text(data_asientos_ida[i].data.numero_documento.value);
                        fila_asiento.find("[data-pago-template='u_correo_electronico']").text(data_asientos_ida[i].data.correo_electronico.value);
                        template_body.append(fila_asiento);
                        Pago.pagarPasaje(data_asientos_ida[i].informacion.codigo, data_asientos_ida[i].informacion.idempresa, data_asientos_ida[i].informacion.key, data_asientos_ida[i].data, informacion_pago, id_fila,data_asientos_ida[i].informacion);
                    }
                    contenedor_ida.append(template_body);
                    /**************************** BODY [FIN] ***********************/
                    /**************************** FOOTER [INICIO] ***********************/
                    var template_footer = $("<div>").addClass("sp_footer");
                    template_footer.html(Pago.template_footer.html());
                    contenedor_ida.append(template_footer);
                    Pago.contenedor_datos_viaje.append(contenedor_ida);
                    /**************************** FOOTER [FIN] ***********************/
                    if(Object.keys(datos_retorno).length > 0){
                        /********************************************************************/
                        /******************************* VIAJE VUELTA **************************/
                        /********************************************************************/
                        /**************************** HEADER [INICIO] ***********************/
                        var contenedor_retorno = $("<div>").addClass("sp_contenedor_retorno");
                        var template_header = $("<div>").addClass("sp_header");
                        template_header.html(Pago.template_header.html());
                        var logo = datos_retorno.informacion.logo_empresa.split("./");
                        var url_logo = Pago.base_url+"/"+logo[1];
                        template_header.find("[data-pago-template='logo']").attr("src", url_logo);
                        template_header.find("[data-pago-template='origen']").text(datos_retorno.informacion.origen);
                        template_header.find("[data-pago-template='destino']").text(datos_retorno.informacion.destino);
                        template_header.find("[data-pago-template='bus_servicio']").text(datos_retorno.informacion.bus_servicio);
                        template_header.find("[data-pago-template='moneda_simbolo']").text(moneda_simbolo);
                        template_header.find("[data-pago-template='total_pagar']").text(parseFloat(datos_retorno.total).toFixed(2));
                        template_header.find("[data-pago-template='terminal_embarque']").text(datos_retorno.informacion.terminal_embarque);
                        var fecha_embarque = datos_retorno.informacion.fecha_viaje.split("/");
                        fecha_embarque = fecha_embarque[2]+"/"+fecha_embarque[1]+"/"+fecha_embarque[0];
                        var fecha_1_embarque = moment(fecha_embarque).format('dddd D, MMMM');
                        var fecha_2_embarque = fecha_1_embarque + " del";
                        var fecha_3_embarque = fecha_2_embarque + " " + moment(fecha_embarque).format('YYYY');
                        fecha_3_embarque += " a las " + datos_retorno.informacion.hora_embarque;
                        template_header.find("[data-pago-template='fecha_hora']").text(fecha_3_embarque);
                        template_header.find("[data-pago-template='direccion_embarque']").text(datos_retorno.informacion.direccion_embarque);
                        template_header.find("[data-pago-template='direccion_embarque_mapa']").attr("data-direccion", datos_retorno.informacion.direccion_embarque);
                        template_header.find("[data-pago-template='terminal_desembarque']").text(datos_retorno.informacion.terminal_desembarque);
                        template_header.find("[data-pago-template='direccion_desembarque']").text(datos_retorno.informacion.direccion_desembarque);
                        template_header.find("[data-pago-template='direccion_desembarque_mapa']").attr("data-direccion", datos_retorno.informacion.direccion_desembarque);
                        contenedor_retorno.append(template_header);
                        /**************************** HEADER [FIN] ***********************/
                        /**************************** BODY [INICIO] ***********************/
                        var template_body = $("<div>").addClass("sp_body");
                        var data_asientos_retorno = datos_retorno.asientos;
                        for(i in data_asientos_retorno){
                            var fila_asiento = $("<div>").addClass("sp_fila_asiento");
                            var id_fila = "retorno_" + i;
                            fila_asiento.attr("data-id", id_fila);
                            fila_asiento.html(Pago.template_body.html());
                            if(data_asientos_retorno[i].informacion.idempresa == 1){
                                fila_asiento.find("[data-pago-template='usuario']").text(data_asientos_retorno[i].data.nombres.value+" "+data_asientos_retorno[i].data.apellido_paterno.value+" "+data_asientos_retorno[i].data.apellido_materno.value);
                                fila_asiento.find("[data-pago-template='u_apellidos']").text(data_asientos_retorno[i].data.apellido_paterno.value+" "+data_asientos_retorno[i].data.apellido_materno.value);
                            }else{
                                fila_asiento.find("[data-pago-template='usuario']").text(data_asientos_retorno[i].data.nombres.value);
                            }
                            fila_asiento.find("[data-pago-template='u_nombres']").text(data_asientos_retorno[i].data.nombres.value);
                            fila_asiento.find("[data-pago-template='numero_asiento']").text(data_asientos_retorno[i].informacion.num_asiento);
                            fila_asiento.find("[data-pago-template='nivel_asiento']").text(data_asientos_retorno[i].informacion.num_piso);
                            fila_asiento.find("[data-pago-template='u_tipo_documento']").text(data_asientos_retorno[i].data.tipo_documento.value);
                            fila_asiento.find("[data-pago-template='u_numero_documento']").text(data_asientos_retorno[i].data.numero_documento.value);
                            fila_asiento.find("[data-pago-template='u_correo_electronico']").text(data_asientos_retorno[i].data.correo_electronico.value);
                            template_body.append(fila_asiento);
                            Pago.pagarPasaje(data_asientos_retorno[i].informacion.codigo, data_asientos_retorno[i].informacion.idempresa, data_asientos_retorno[i].informacion.key, data_asientos_retorno[i].data, informacion_pago, id_fila, data_asientos_retorno[i].informacion);
                        }
                        contenedor_retorno.append(template_body);
                        /**************************** BODY [FIN] ***********************/
                        /**************************** FOOTER [INICIO] ***********************/
                        var template_footer = $("<div>").addClass("sp_footer");
                        template_footer.html(Pago.template_footer.html());
                        contenedor_retorno.append(template_footer);
                        Pago.contenedor_datos_viaje.append(contenedor_retorno);
                        /**************************** FOOTER [FIN] ***********************/
                    }
                    Pago.pago_body.css({'height': 'auto'});
                    Pago.enviarCorreoPago();
                }else{
                    window.location.href = '/';
                }
            },'json');
        }, 2000);
    },
    pagarPasaje: function(codigo, idempresa, key, datos_pasajero, informacion_pago, id_fila, data_asientos){
        var params = {
            codigo: codigo,
            idempresa: idempresa,
            key: key,
            datos_pasajero: JSON.stringify(datos_pasajero),
            informacion_pago: JSON.stringify(informacion_pago),
            id_fila: id_fila,
            data_asientos: JSON.stringify(data_asientos),
            id: Pago.pago_id
        };
        $.post(this.extension_idioma+"/index/pagar-pasaje", params, function(response){
            console.log(response);
            if(response.result == 'success'){
                var fila_asiento = $(".sp_fila_asiento[data-id='"+response.id_fila+"']");
                if(fila_asiento.length > 0){
                    fila_asiento.find(".codigo-qr").show();
                    fila_asiento.find("[data-pago-template='numero_boleto']").text(response.numero_boleto);
                    fila_asiento.find("[data-pago-template='qr_code']").attr("src", response.qr).css({'width': '130px'});
                }
            }
        }, 'json');
    },
    enviarCorreoPago: function(){
        $.post(this.extension_idioma+"/pago/enviar-correo", {
            id: Pago.pago_id
        }, function(response) {
            console.log(response);
        });
    },
    opciones: function(obj){
        var boton_seleccionado = $(obj);
        var accion = boton_seleccionado.attr("data-accion");
        switch(accion){
            case 'regresar':
                window.location.href = "/";
            break;
            case 'imprimir':
                boton_seleccionado.addClass("disabled");
                window.print();
            break;
            case 'reenviar':
                boton_seleccionado.html('<i class="fas fa-spinner fa-spin"></i> '+this.idioma_traduccion.texto_reenviando_correo+'...');
                this.pago_body.find(".opciones .mensaje").hide();
                this.pago_body.find(".opciones .mensaje .alert").removeClass("alert-success alert-danger");
                $.post(this.extension_idioma+"/pago/reenviar-correo", {
                    id: this.pago_id
                }, function(response) {
                    console.log(response);
                    boton_seleccionado.removeClass("disabled");
                    Pago.pago_body.find(".opciones .mensaje").show();
                    if(response.result === 'success'){
                        boton_seleccionado.html('<i class="fas fa-envelope-open-text"></i> '+Pago.idioma_traduccion.texto_reenviar_por_correo);
                        Pago.pago_body.find(".opciones .mensaje .alert").addClass("alert-success").text(Pago.idioma_traduccion.texto_correo_reenviado_correctamente+'...');
                    }else{
                        Pago.pago_body.find(".opciones .mensaje .alert").addClass("alert-danger").text(Pago.idioma_traduccion.texto_error_servidor);
                    }
                    setTimeout(function(){
                        Pago.pago_body.find(".opciones .mensaje").fadeOut();
                    }, 2000);
                });
            break;
        }
    }
}
$(document).on('click','a[data-pago-template="direccion_embarque_mapa"], a[data-pago-template="direccion_desembarque_mapa"]',function(e){
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
window.onbeforeprint = function(e){
    //event open window print
};
window.onafterprint = function(e){
    $("button[data-accion='imprimir']").removeClass("disabled");
};