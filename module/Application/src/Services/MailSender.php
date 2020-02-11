<?php

namespace Application\Services;

use Zend\View\Model\ViewModel;
use Zend\Mail\Transport\Smtp;
use Zend\Mail\Transport\SmtpOptions;
use Zend\Mail\Message;
use Zend\Mime\Message as MimeMessage;
use Zend\Mime\Part as MimePart;

class MailSender {
    
    private $serviceManager;
    private $infoTable;
    
    public function __construct($serviceManager,$infoTable) 
    {
        $this->serviceManager = $serviceManager;
        $this->infoTable = $infoTable;
    }
    
    public function sendMail($to,$subject,$dataMail,$plantilla=null){
        if(trim($to) == '')return;
        $dataSysInfo = $this->infoTable->obternerDatosInfo(1);
        $dataConfig = json_decode($dataSysInfo['data'],true);
        $message = new Message();
        $to_mails = explode(",",str_replace([";","/"],",", str_replace(" ","",$to)));
        foreach($to_mails as $mail){
            if(!filter_var($mail, FILTER_VALIDATE_EMAIL))continue;
            $message->addTo($mail);
        }
        $message->addFrom($dataConfig['email_from'],$dataConfig['name_from']);
        $message->setSubject($subject);
        $view = new ViewModel($dataMail);
        if($plantilla != null)$view->setTemplate($plantilla);
        else $view->setTemplate('mail/template');
        $view->setTerminal(true);
        $emailBody = $this->serviceManager->get('ViewRenderer')->render($view);
        /*echo $emailBody;
        die;*/
        $html = new MimePart($emailBody);
        $html->type = "text/html";
        $body = new MimeMessage();
        $body->addPart($html);
        $transport = new Smtp();
        $config = [
            'name' => $dataConfig['servidor'],
            'host' => $dataConfig['servidor'],
            'connection_class' => 'login',
            'port' => $dataConfig['puerto'],
            'connection_config' => [
                'username' => $dataConfig['usuario'],
                'password' => $dataConfig['password'],
                'ssl' => $dataConfig['auth']
            ]  
        ];
        $options = new SmtpOptions($config);
        $transport->setOptions($options);
        $message->setBody($body);
        $transport->send($message);
    }
}
