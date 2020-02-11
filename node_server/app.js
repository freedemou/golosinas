var express = require('express');
var mysql = require('mysql');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 9010;

var con = mysql.createConnection({
    host: "localhost",
    database : "db_ebus",
    user: "root",
    password: ""
});

var Ebus = {
    datos_pago: []
};

server.listen(port, () => {
    console.log('===> Servidor escuchando en el puerto', port);
});

con.connect(function(err) {
    if (err) throw err;
    console.log("===> Conectado a Base de datos Correctamente");
});

io.on('connection', (socket) => {
    socket.on('validar_confirmar_usuario', function(data) {
        console.log(data);
        con.query('SELECT idusuario, nombres, apellidos, correo, sexo, telefono, direccion, idlogin, idimagen, r_social, nro_documento, tipo_usuario FROM ebus_usuarios WHERE idusuario = "'+data.id+'"', function (error, results, fields) {
            if (error) throw error;
            var return_data = {};
            if(results.length == 0){
                return_data = {"result":"error"};
                io.sockets.emit('resultado_confirmar_usuario', return_data);
            }else{
                return_data = {
                    "result": "success",
                    "id": results[0].idusuario,
                    "token": data.token
                };
            }
            console.log(return_data);
            io.sockets.emit('resultado_confirmar_usuario', return_data);
        });
    });
    socket.on('datos_pago', function(data){
        Ebus.datos_pago = data.datos_pago;
    });
    socket.emit('obtener_datos_pago', {
        datos_pago: Ebus.datos_pago
    });
    socket.on('restaurar_datos_pago', function(data){
        if(data.restaurar){
            Ebus.datos_pago = [];
        }
    });
});
