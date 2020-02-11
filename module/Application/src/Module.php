<?php
/**
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2016 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */
namespace Application;

use Zend\Db\TableGateway\TableGateway;
use Zend\Db\Adapter\AdapterInterface;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Application\Services;

class Module
{
    const VERSION = '3.0.3-dev';

    public function getConfig()
    {
        return include __DIR__ . '/../config/module.config.php';
    }
    public function onBootstrap($e)
    {
        /*===================== Etiqueta Base ======================*/
        $protocol = (!empty($_SERVER['HTTPS'])) ? 'https' : 'http';
        $application = $e->getParam('application');
        $viewModel = $application->getMvcEvent()->getViewModel();
        $services = $application->getServiceManager();
        $config = $services->get('Config');
        /*====================== Event Manager ====================*/
        $eventManager = $e->getApplication()->getEventManager();
        $sharedEventManager = $eventManager->getSharedManager();
        $sharedEventManager->attach(AbstractActionController::class, MvcEvent::EVENT_DISPATCH, [$this, 'onDispatch'], 100);
        $sharedEventManager->attach('Zend\Mvc\Application', MvcEvent::EVENT_DISPATCH_ERROR, [$this, 'onDispatchError'], 100);
    }
    public function getServiceConfig()
    {
        return [
            'factories' => [
                Model\UsuarioTable::class => function($container){
                    $adapter = $container->get(AdapterInterface::class);
                    $tableGateway = new TableGateway('fd_usuarios', $adapter);
                    $table = new Model\UsuarioTable($tableGateway);
                    return $table;
                },
            ]
        ];
    }
    public function getControllerConfig()
    {
        return [
            'factories' => [
                Controller\IndexController::class => function($container) {
                    return new Controller\IndexController(
                        $container
                    );
                }
            ]
        ];
    }
    public function onDispatch(MvcEvent $event)
    {
        $this->InterfacePanel($event);
    }
    public function onDispatchError(MvcEvent $event)
    {
        $this->InterfacePanel($event);
    }
    private function InterfacePanel($event)
    {
        $application = $event->getParam('application');
        $viewModel = $application->getMvcEvent()->getViewModel();
        $container = $event->getApplication()->getserviceManager();
    }
    
    
}
