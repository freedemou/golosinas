-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-02-2020 a las 06:44:59
-- Versión del servidor: 10.3.16-MariaDB
-- Versión de PHP: 7.3.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fd_golosinas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fd_usuarios`
--

CREATE TABLE `fd_usuarios` (
  `idusuario` int(10) NOT NULL,
  `token` varchar(32) DEFAULT NULL,
  `contrasena` varchar(64) DEFAULT NULL,
  `nombres` varchar(100) DEFAULT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `sexo` varchar(1) DEFAULT NULL,
  `estado` char(2) DEFAULT 'A',
  `cambio_clave` varchar(1) DEFAULT 'N',
  `idfacebook` varchar(50) DEFAULT NULL,
  `idperfil` int(10) DEFAULT NULL,
  `esadmin` varchar(1) DEFAULT 'N',
  `telefono` int(12) DEFAULT NULL,
  `usuario` char(30) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `idlogin` varchar(100) DEFAULT NULL,
  `r_social` char(30) DEFAULT NULL,
  `tipo_usuario` char(2) DEFAULT NULL COMMENT '[S, RS]',
  `idimagen` varchar(50) DEFAULT NULL,
  `oferta` int(10) NOT NULL,
  `nro_documento` char(11) DEFAULT NULL,
  `datos_pago` text DEFAULT NULL,
  `nro_celular` char(15) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `fd_usuarios`
--
ALTER TABLE `fd_usuarios`
  ADD PRIMARY KEY (`idusuario`),
  ADD KEY `sys_usuarios_fk0` (`idperfil`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `fd_usuarios`
--
ALTER TABLE `fd_usuarios`
  MODIFY `idusuario` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
