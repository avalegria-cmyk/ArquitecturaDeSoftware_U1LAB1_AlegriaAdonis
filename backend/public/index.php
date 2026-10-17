<?php
declare(strict_types=1);

use Weather\Application\WeatherApplication;
use Weather\Domain\ApiException;
use Weather\Http\JsonResponse;
use Weather\Http\DatasetUpload;
use Weather\Infrastructure\FlaskGateway;

spl_autoload_register(static function (string $class): void {
    $prefix = 'Weather\\';
    if (str_starts_with($class, $prefix)) {
        $file = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});

try {
    // El transporte HTTP traduce solicitudes; los casos de uso no conocen rutas.
    $app = new WeatherApplication(new FlaskGateway(getenv('PROCESSING_URL') ?: 'http://127.0.0.1:5001'));
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $routes = ['/api/model' => 'GET', '/api/train' => 'POST', '/api/predict' => 'POST'];
    if (!isset($routes[$path])) {
        throw new ApiException('Ruta no encontrada.', 404, 'not_found');
    }
    if ($method !== $routes[$path]) {
        header('Allow: ' . $routes[$path]);
        throw new ApiException('Método no permitido.', 405, 'method_not_allowed');
    }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 11 * 1024 * 1024) {
        throw new ApiException('La solicitud supera el límite permitido.', 413, 'file_too_large');
    }
    if ($path === '/api/model') {
        $data = $app->state();
    } elseif ($path === '/api/train') {
        $data = $app->train(...DatasetUpload::fromRequest($_FILES['dataset'] ?? null));
    } else {
        if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
            throw new ApiException('Se requiere Content-Type application/json.', 415, 'unsupported_media_type');
        }
        try {
            $body = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new ApiException('El JSON no es válido.', 400, 'invalid_json');
        }
        if (!is_array($body)) {
            throw new ApiException('Se requiere un objeto JSON.', 400, 'invalid_json');
        }
        $data = $app->predict($body);
    }
    JsonResponse::send(['data' => $data]);
} catch (ApiException $error) {
    JsonResponse::send(['error' => [
        'code' => $error->errorCode, 'message' => $error->getMessage(), 'fields' => (object) $error->fields,
    ]], $error->status);
} catch (Throwable $error) {
    error_log((string) $error);
    JsonResponse::send(['error' => [
        'code' => 'internal_error', 'message' => 'Ocurrió un error en la API. Revisa su registro.', 'fields' => (object) [],
    ]], 500);
}
