<?php
/**
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2016 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application;

use Zend\Router\Http\Literal;
use Zend\Router\Http\Segment;
use Zend\ServiceManager\Factory\InvokableFactory;
use Zend\I18n\Translator\Loader\PhpArray;
use Zend\I18n\View\Helper\Translate;

return [
    'router' => [
        'routes' => [
            'home' => [
                'type'    => Literal::class,
                'options' => [
                    'route'    => '/',
                    'defaults' => [
                        'controller' => Controller\IndexController::class,
                        'action'     => 'index'
                    ],
                ],
            ],
        ],
    ],
    'view_manager' => [
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'not_found_template'       => 'error/404',
        'exception_template'       => 'error/index',
        'template_map' => [
            'layout/layout'           => __DIR__ . '/../view/layout/layout.phtml',
            'pago'           => __DIR__ . '/../view/layout/pago.phtml',
            'application/index/index' => __DIR__ . '/../view/application/index/index.phtml',
            'error/404'               => __DIR__ . '/../view/error/404.phtml',
            'error/index'             => __DIR__ . '/../view/error/index.phtml',
            'mail/template'           => __DIR__ . '/../view/application/mail/template.phtml',
            'venta_es'           => __DIR__ . '/../view/application/mail/template_venta_es.phtml',
            'venta_en'           => __DIR__ . '/../view/application/mail/template_venta_en.phtml',
            'calificacion_es'           => __DIR__ . '/../view/application/mail/template_calificacion_es.phtml',
            'calificacion_en'           => __DIR__ . '/../view/application/mail/template_calificacion_en.phtml',
            'tcs_loc'                 => __DIR__ . '/../../../public/socios/tcs/formularios/form_local.phtml',
            'civa_loc'                 => __DIR__ . '/../../../public/socios/civa/formularios/form_local.phtml',
        ],
        'template_path_stack' => [
            __DIR__ . '/../view'
        ],
        'strategies' => [
            'ViewJsonStrategy',
        ]
    ],
    'view_helpers' => [
        'invokables' => [
            'translate' => Translate::class
        ],
    ],
    'translator' => [
        'locale' => 'es_ES',
        'translation_file_patterns' => [
            [
                'type'     => PhpArray::class,
                'base_dir' => __DIR__ . '/../language',
                'pattern' => '%s.php',
            ],
        ]
    ],
];
