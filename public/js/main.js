var Principal = {
    extension_idioma: '',
    width_responsive: 768,
    idioma_traduccion: {}
}

var LoginPrincipal = {
    w: '',
    token: '',
    redirect_uri: '',
    window_config: '',
    cargando: $(".modal-cargando"),
    modalIniciarSesion: $(".modal-iniciar-sesion"),
    headerIniciarSesion: $(".header-iniciar-sesion"),
    aplicacionIdFacebook: '',
    aplicacionIdLinkedin: '',
    extension_idioma: '',
    origen: '',
    facebook: () => {
        LoginPrincipal.cargando.show();
        this.w = window.open("https://www.facebook.com/dialog/oauth?display=popup&response_type=token&client_id="+LoginPrincipal.aplicacionIdFacebook+"&redirect_uri="+(encodeURI(LoginPrincipal.redirect_uri)), $.now(), "width=600,height=600,location=yes");
        this.w.opener.addEventListener('message', LoginPrincipal.mensajeFacebook, false);
    },
    linkedin: () => {
        LoginPrincipal.cargando.show();
        this.w = window.open("https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id="+LoginPrincipal.aplicacionIdLinkedin+"&redirect_uri="+(encodeURI(LoginPrincipal.redirect_uri))+"&state=987654321&scope=r_liteprofile%20r_emailaddress", $.now(), "width=600,height=600,location=yes");
        this.w.opener.addEventListener('message', LoginPrincipal.mensajeLinkedin, false);
    },
    twitter: () => {
        LoginPrincipal.cargando.show();
        $.post(LoginPrincipal.extension_idioma+'/usuario/obtener-solicitud-token-twitter', (response) => {
            if(response.result){
                this.w = window.open("https://api.twitter.com/oauth/authenticate?oauth_token="+response.oauth_token, $.now(), "width=600,height=600,location=no");
                this.w.opener.addEventListener('message', LoginPrincipal.mensajeTwitter, false);
            }
        },'json');
    },
    email: function() {
        $(".login-opciones").hide();
        $("form.modal-form-login").show();
        $(".icon-anterior").show();
    },
    registroEmail: function(){
        $(".login-opciones").hide();
        $("form.form-registrar-usuario").show();
        $(".header-registrar-usuario span").first().show().attr("data-origen", "registrar-actual");
    },
    windowParametros: () => {
        this.window_config = '';
        var left = (screen.width/2)-(w/2);
        var top = (screen.height/2)-(h/2);
        var params = "width=600,height=600,location=no,left="+left+"&top="+top;
        this.window_config = params;
    },
    mensajeFacebook: (e) => {
        this.token = e.data.split("#access_token=")[1].split("&")[0];
        $.post(LoginPrincipal.extension_idioma+"/usuario/facebook",{key: this.token},(response)=>{
            LoginPrincipal.respuestaDatosUsuario(response);
        },'json');
        this.w.close();
        window.removeEventListener('message', LoginPrincipal.mensajeFacebook);
    },
    mensajeLinkedin: (e) => {
        this.token = e.data.split("code=")[1].split("&")[0];
        $.post(LoginPrincipal.extension_idioma+"/usuario/linkedin",{key: this.token},(response)=>{
            LoginPrincipal.respuestaDatosUsuario(response);
        },'json');
        this.w.close();
        window.removeEventListener('message', LoginPrincipal.mensajeLinkedin);
    },
    mensajeTwitter: (e) => {
        this.token = e.data.split("oauth_token=")[1].split("&")[0]+"||"+e.data.split("oauth_token=")[1].split("&")[1].split("oauth_verifier=")[1];
        $.post(LoginPrincipal.extension_idioma+"/usuario/twitter",{key: this.token},(response)=>{
            LoginPrincipal.respuestaDatosUsuario(response);
        },'json');
        this.w.close();
        window.removeEventListener('message', LoginPrincipal.mensajeTwitter);
    },
    respuestaDatosUsuario: (response) => {
        if(response.result == 'success' || response.result == 'pendiente'){
            modal_ncl(LoginPrincipal.extension_idioma+'/usuario/registrar-usuario?id='+response.id+'&origen='+LoginPrincipal.origen,'modal-segundo');
        }else if(response.result == 'activo'){
            LoginPrincipal.mostrarInformacionUsario(response.data);
            LoginPrincipal.actualizarSesionUsuario(response.data.idusuario);
        }
        LoginPrincipal.cargando.hide();
    },
    mostrarInformacionUsario: (data) => {
        if(Object.keys(data).length){
            var apellidos = (data.apellidos!=null)?data.apellidos:'';
            switch(LoginPrincipal.origen){
                case 'completar-formulario':
                    $(".modal-login .no-login").hide();
                    $(".modal-login .login").show();
                    var apellidos = (data.apellidos!=null)?data.apellidos:'';
                    $(".modal-login .login").find("[data-usuario='foto']").attr("src", data.urlimagenrs);
                    $(".modal-login .login").find("[data-usuario='usuario']").text(data.nombres+" "+apellidos);
                    $(".modal-login .login").find("[data-usuario='correo']").text(data.correo);
                    $(".modal-login .login").find("[data-usuario='num-doc']").text('00000007');    
                break;
            }
            /****** Menu Usuario *****/
            $("li[data-accion='iniciar'], li[data-accion='registrate']").hide();
            $("li[data-accion='usuario']").show();
            $("li[data-accion='usuario']").first().find("a > strong").text(data.nombres+" "+apellidos);
            $("li[data-accion='usuario']").last().show();
            modal_hide('modal-segundo');
        };
    },
    actualizarSesionUsuario: function(id){
        $.post(LoginPrincipal.extension_idioma+"/usuario/obtener-datos-usuario",{id: id},(response)=>{
            if(Object.keys(response).length){
                $("li[data-accion='usuario']").first().find("a > strong").text(response.nombres+" "+response.apellidos);
                $("li[data-accion='usuario']").last().find("img[data-user='foto']").attr("src", response.urlimagenrs+"?"+$.now());
            }
        },'json')
    },
    mostrarSesionUsuario: function(data){
        $("li[data-accion='iniciar'], li[data-accion='registrate']").hide();
        $("li[data-accion='usuario']").show();
        $("li[data-accion='usuario']").first().find("a > strong").text(data.nombres+" "+data.apellidos);
        $("li[data-accion='usuario']").last().show();
        modal_hide('modal-segundo');
    }
}

$(document).ready(function () {
    if(localStorage.getItem('ebus_moneda')){
        $("img.moneda").attr("src", "img/" + localStorage.getItem('ebus_moneda').toLowerCase() + ".png");
        if(localStorage.getItem('ebus_moneda').toLowerCase() == 'pen'){
            $("a[data-accion='moneda']").first().addClass("icon-active");
        }else if(localStorage.getItem('ebus_moneda').toLowerCase() == 'usd'){
            $("a[data-accion='moneda']").last().addClass("icon-active");
        }else{
            $("a[data-accion='moneda']").first().addClass("icon-active");
        }
    }
    $('.modal').on('hidden.bs.modal', function () {
        $(".modal").each(function(){
            if($(this).is(':visible')){
                $("body").addClass('modal-open');
                //$('.modal').removeClass("show");
            }
        });
        $(this).removeClass("show");
    });
    $('.modal').on('show.bs.modal', function () {
        $(this).addClass("show");
    });
    $(".ebus-mouse .mousey").click(function(){
        $('html,body').animate({
            scrollTop: $("." + $(this).attr("data-id")).offset().top
        }, 1000);
    });
    $("body").on("click",".pop-up",function(e){
        e.preventDefault();
        modal_ncl($(this).attr("href"),'modal-primario');
    });
    $("body").on("click",".pop-up-2",function(e){
        e.preventDefault();
        modal_ncl($(this).attr("href"),'modal-segundo');
    });
    $("body").on("click",".pop-up-3",function(e){
        e.preventDefault();
        modal_ncl($(this).attr("href"),'modal-tercero');
    });
    $("body").on("click",".pop-up-4",function(e){
        e.preventDefault();
        modal_ncl($(this).attr("href"),'modal-cuarto');
    });
    $("body").on("click",".pop-up-5",function(e){
        e.preventDefault();
        modal_ncl($(this).attr("href"),'modal-quinto');
    });
    (function (original) {
        jQuery.fn.clone = function () {
            var result           = original.apply(this, arguments),
                my_textareas     = this.find('textarea').add(this.filter('textarea')),
                result_textareas = result.find('textarea').add(result.filter('textarea')),
                my_selects       = this.find('select').add(this.filter('select')),
                result_selects   = result.find('select').add(result.filter('select'));
    
            for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
            for (var i = 0, l = my_selects.length;   i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;
    
            return result;
        };
    }) (jQuery.fn.clone);
});
$(".lista-busqueda-filtros .bloque.buscar").click(function(){
    modal_ncl(Principal.extension_idioma+'/index/opcion-buscador', 'modal-cuarto');
});
$(".lista-busqueda-filtros .bloque.filtrar").click(function(){
    modal_ncl(Principal.extension_idioma+'/index/opcion-filtrar', 'modal-cuarto');
});
$(".lista-busqueda-filtros .bloque.ordenar").click(function(){
    modal_ncl(Principal.extension_idioma+'/index/opcion-ordenar', 'modal-cuarto');
});
$(".calendario-fecha-ida").click(function(e){
    modal_ncl(Principal.extension_idioma+'/index/buscar-fecha-ida', 'modal-cuarto');
});
$(".calendario-fecha-retorno").click(function(e){
    modal_ncl(Principal.extension_idioma+'/index/buscar-fecha-retorno', 'modal-cuarto');
});
$("body").on("click",".btn-submit",function(e){
    e.preventDefault();
    var idForm = $(this).attr("data-id-form");
    var form = $('#'+idForm);
    var url = form.attr('data-action');
    var data = new FormData(form[0]);
    var callback = form.attr('data-callback');
    if(form.valid()){
        $(this).addClass("disabled","");
        process_form(url,data,callback);
    }
});
function process_form(url,data,callback){
    if($(".btn-uploader-form").length){
        if(!$(".btn-uploader-form").hasClass('disabled'))$(".btn-uploader-form").addClass("disabled");
        $(".btn-uploader-form").html("<i class='fa fa-circle-o-notch fa-spin'></i> Guardando <span class='btn-uploader-form-percent'>0%</span>");
    }
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        contentType: false,
        processData: false,
        success: function (response) {
            //response  = JSON.parse(response);
            if(typeof callback === 'function')callback(response);
            else if(callback.length>2)eval(callback);
        },
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt){
              if (evt.lengthComputable) {
                var percentComplete = Math.round((evt.loaded / evt.total)*100)+"%";
                $(".btn-uploader-form-percent").text(percentComplete);
              }
            }, false);
            return xhr;
        },
        error: function(){
            console.log('Se han detectado errores de red intente en otro momento.','error');
            setTimeout(function(){$("#myModal").modal('hide')},1000);
        }
    });
}
function modal_ncl(src,id){
    $('#'+id).modal({
        backdrop: 'static',
        keyboard: false
    });
    $('#'+id).modal('show');
    $('#'+id).find('.modal-content').html('<div class="text-center" style="padding:30px;"><i class="fas fa-spinner fa-pulse fa-5x"></i> <br/><br/> <p>'+Principal.idioma_traduccion.texto_cargando_contenido+'</p></div>');  
    $.post(src,function(data){
        $('#'+id).find('.modal-content').html(data); 
    }).fail(function(e){
        var msj = '';
        var icon = 'fas fa-exclamation-triangle fa-5x txt-color-red';
        switch(e.status){
            case 0:
                msj = 'No se ha podido conectar con el servidor, intente en otro momento.';
                icon = "fas fa-globe fa-5x txt-color-red";
            break;
            case 404:
                msj = 'El contenido que usted esta buscando no se ha encontrado en el servidor.';
            break;
            case 401:
                msj = 'Usted no tiene acceso a esta opción.';
                icon = "fas fa-ban fa-5x txt-color-red";
            break;
            case 500:
                msj = 'Se ha encontrado un error en el servidor, contácte con su administrador del sistema.';
                icon = "fas fa-plug fa-5x txt-color-red";
            break;
            default:
                msj = 'No se ha podido conectar con el servidor, intente en otro momento.';
                icon = "fas fa-globe fa-5x txt-color-red";
            break;
        }
        $('#'+id).find('.modal-content').html('<div class="text-center" style="padding:30px;"><i class="'+icon+'"></i> <br/><br/> <p>'+msj+'</p><br/> <div class="btn ebus-btn ebus-btn-black" data-dismiss="modal">Cerrar</div></div>'); 	
    });
}
function modal_hide(instance){
    if(!instance)instance = 'modal-primario';
    $('#'+instance).modal('hide');
}
$('.accordion-group .encabezado').click(function() {
    var $this = $(this);
    if($this.next().hasClass('show')){
        $this.removeClass('open');
        $this.next().removeClass('show');
        $this.next().slideUp(350);
    }else{
        $this.toggleClass('open');
        $this.next().toggleClass('show');
        $this.next().slideToggle(350);
    }
});
$(document).on('keyup', '.ebus-buscador input.select2-search__field', function(e) {
	$('[data-toggle="tooltip"]').tooltip('hide');
});
$('.boton-sandwich').click(function() {
    $(this).toggleClass('active');
    if($(this).hasClass('active')) {
        $('.main-menu-sandwich').addClass('active');
    }else {
        $('.main-menu-sandwich').removeClass('active');
    }
    $("html, body").animate({ scrollTop: window.pageYOffset }, "slow");
});
$(".select-idioma-sandwich").change(function(){
    window.location.href = window.location.origin + "/"+  $(this).val()
});

$(".select-moneda-sandwich").change(function(){
    localStorage.removeItem('ebus_moneda');
    Ebus.validarCambioMoneda($(this).val());
});

$("a.dropdown-item").click(function(){
    if($(this).attr("data-accion") == "moneda"){
        Ebus.validarCambioMoneda($(this).attr("data-hash"));
    }
});

$(".dropdown-menu-usuario > a").click(function(){
    var accion = $(this).attr("data-accion");
    switch(accion){
        case 'datos-personales': break;
        case 'mis-tickets': break;
        case 'notificaciones': break;
        case 'salir':
            $("li[data-accion='iniciar'], li[data-accion='registrate']").show();
            $("li[data-accion='usuario']").hide();
            $("li[data-accion='usuario']").first().find("a > strong").text("");
            $("li[data-accion='usuario']").last().hide();
            if($(".btn-calificacion").is(":visible"))$(".btn-calificacion").attr("data-accion", "login");
            $.post(LoginPrincipal.extension_idioma+"/usuario/logout", function(response) {},'json');
        break;
    }
});
$("li[data-accion='iniciar']").click(function(){
    LoginPrincipal.origen = 'iniciar-sesion';
    modal_ncl(LoginPrincipal.extension_idioma+'/usuario/iniciar-sesion', 'modal-segundo');
});
$("li[data-accion='registrate']").click(function(){
    LoginPrincipal.origen = "registrar-actual";
    modal_ncl(LoginPrincipal.extension_idioma+'/usuario/registrar-usuario?origen=registrar', 'modal-segundo');
});
$(document).ajaxSend(function(e, jqXHR, options) {
    //console.log(jqXHR);
});
$(document).ajaxComplete(function(event, xhr, settings) {
    if(xhr.xhr_tag == 'validar_request'){
        console.log('>>>>>>>>>>> ajax completado');
        console.log(xhr);
        DatosEbus.validarDatosEmpresas();
    }
});
/*$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    if(jqxhr.xhr_tag == 'validar_request'){
        console.log('>>>>>>>>>>> error');
        console.log(jqxhr);
        DatosEbus.validarDatosEmpresas();
    }
});*/