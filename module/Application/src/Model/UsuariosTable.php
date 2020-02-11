<?php

namespace Application\Model;

use RuntimeException;
use Zend\Db\TableGateway\TableGatewayInterface;
use Zend\Db\Sql\Select;

class UsuariosTable {
    protected $tableGateway;
    public function __construct(TableGatewayInterface $tableGateway) {
        $this->tableGateway = $tableGateway;
    }
    public function obtenerUsuarios(){
        $rowset = $this->tableGateway->select();
        return $rowset;
    }
    public function obtenerDatoUsuario($where){
        $rowset = $this->tableGateway->select($where);
        return $rowset->current();
    }
    public function obtenerDatoUsuarioPerfil($idusuario){
        $adapter = $this->tableGateway->getAdapter();
        $sql = "SELECT * FROM ebus_usuarios WHERE idusuario = {$idusuario}";
        $data = $adapter->query($sql, $adapter::QUERY_MODE_EXECUTE)->current();
        return $data;
    }
    public function actualizarDatosUsuario($data,$idusuario){
        $rowset = $this->tableGateway->update($data,["idusuario" => $idusuario]);
    }
    public function agregarUsuario($data){
        $this->tableGateway->insert($data);
        return $this->tableGateway->lastInsertValue;
    }
    public function eliminarUsuario($idusuario){
        $this->tableGateway->delete(["idusuario" => $idusuario]);
    }
}