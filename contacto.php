<?php
/**
 * GRUPO EDUSER — Procesador de Contacto
 * Envío directo a contactoeduser@grupoeduserr.com
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Leer datos (JSON o POST tradicional)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !is_array($data)) {
    $data = $_POST;
}

$nombre   = trim($data['Nombre'] ?? $data['nombre'] ?? '');
$empresa  = trim($data['Empresa'] ?? $data['empresa'] ?? '');
$telefono = trim($data['Teléfono'] ?? $data['telefono'] ?? '');
$email    = trim($data['Correo'] ?? $data['Correo remitente'] ?? $data['email'] ?? '');
$eje      = trim($data['Eje de Interés'] ?? $data['eje_servicio'] ?? '');
$mensaje  = trim($data['Mensaje'] ?? $data['mensaje'] ?? '');
$folio    = trim($data['Folio'] ?? ('GE-' . substr(time(), -6)));

// Validaciones
if (empty($nombre) || empty($empresa) || empty($telefono) || empty($email) || empty($mensaje)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Por favor complete todos los campos obligatorios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El correo electrónico no tiene un formato válido.']);
    exit;
}

// Prevenir inyección de cabeceras
$cleanNombre = str_replace(["\r", "\n"], '', strip_tags($nombre));
$cleanEmail  = str_replace(["\r", "\n"], '', strip_tags($email));
$cleanEmpresa = str_replace(["\r", "\n"], '', strip_tags($empresa));

$destinatario = 'contactoeduser@grupoeduserr.com';
$asunto = "=?UTF-8?B?" . base64_encode("Nuevo Requerimiento [{$folio}] - {$cleanNombre} ({$cleanEmpresa})") . "?=";

// Cuerpo del mensaje en HTML corporativo
$htmlBody = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #2d3748; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #061A3A; color: #ffffff; padding: 24px 30px; border-bottom: 3px solid #C59B27; }
    .header h2 { margin: 0; font-size: 20px; color: #ffffff; }
    .header p { margin: 5px 0 0; color: #C59B27; font-size: 13px; font-weight: bold; }
    .content { padding: 30px; }
    .folio-badge { display: inline-block; background: #fdf8eb; border: 1px solid #e5d08a; color: #002B66; padding: 6px 14px; border-radius: 4px; font-weight: bold; margin-bottom: 20px; font-size: 14px; }
    .table-info { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table-info td { padding: 10px 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
    .table-info td.label { font-weight: bold; width: 35%; color: #4a5568; background-color: #f8fafc; }
    .message-box { background: #f8fafc; border-left: 4px solid #C59B27; padding: 16px; border-radius: 0 4px 4px 0; margin-top: 10px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #edf2f7; padding: 16px; text-align: center; font-size: 12px; color: #718096; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h2>GRUPO EDUSER — Portal Web</h2>
      <p>Nuevo Requerimiento Corporativo Registrado</p>
    </div>
    <div class='content'>
      <div class='folio-badge'>Folio: {$folio}</div>
      <table class='table-info'>
        <tr><td class='label'>Nombre completo:</td><td>" . htmlspecialchars($cleanNombre) . "</td></tr>
        <tr><td class='label'>Empresa / Entidad:</td><td>" . htmlspecialchars($cleanEmpresa) . "</td></tr>
        <tr><td class='label'>Teléfono:</td><td><a href='tel:" . htmlspecialchars($telefono) . "'>" . htmlspecialchars($telefono) . "</a></td></tr>
        <tr><td class='label'>Correo electrónico:</td><td><a href='mailto:" . htmlspecialchars($cleanEmail) . "'>" . htmlspecialchars($cleanEmail) . "</a></td></tr>
        <tr><td class='label'>Eje de Interés:</td><td>" . htmlspecialchars($eje) . "</td></tr>
        <tr><td class='label'>Fecha y Hora:</td><td>" . date('d/m/Y H:i:s') . "</td></tr>
      </table>
      <strong>Detalle del Requerimiento:</strong>
      <div class='message-box'>" . nl2br(htmlspecialchars($mensaje)) . "</div>
    </div>
    <div class='footer'>
      Este mensaje fue generado automáticamente a través del formulario de contacto de GRUPO EDUSER.
    </div>
  </div>
</body>
</html>
";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: GRUPO EDUSER <no-reply@grupoeduserr.com>',
    'Reply-To: ' . $cleanNombre . ' <' . $cleanEmail . '>',
    'X-Mailer: PHP/' . phpversion()
];

$enviado = @mail($destinatario, $asunto, $htmlBody, implode("\r\n", $headers));

if ($enviado) {
    echo json_encode([
        'success' => true,
        'folio' => $folio,
        'message' => 'Solicitud enviada correctamente.'
    ]);
} else {
    // Si la función mail() local de PHP falló en el servidor
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo enviar el correo desde el servidor PHP.'
    ]);
}

