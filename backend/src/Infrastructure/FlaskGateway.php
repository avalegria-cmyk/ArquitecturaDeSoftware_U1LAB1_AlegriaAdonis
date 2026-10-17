<?php
declare(strict_types=1);
namespace Weather\Infrastructure;

use Weather\Domain\ApiException;
use Weather\Domain\ProcessingGateway;

final class FlaskGateway implements ProcessingGateway
{
    public function __construct(private string $baseUrl)
    {
        if (!extension_loaded('curl')) {
            throw new ApiException('Habilita la extensión cURL de PHP para conectar el procesamiento.', 503, 'configuration_error');
        }
    }

    public function state(): array
    {
        return $this->request('GET', '/model');
    }

    public function train(string $path, string $filename): array
    {
        return $this->request('POST', '/train', [
            'dataset' => new \CURLFile($path, 'text/csv', $filename),
        ]);
    }

    public function predict(array $features, string $modelId): array
    {
        return $this->request('POST', '/predict', json_encode([
            'features' => (object) $features, 'model_id' => $modelId,
        ], JSON_THROW_ON_ERROR));
    }

    private function request(string $method, string $path, array|string|null $body = null): array
    {
        $handle = curl_init(rtrim($this->baseUrl, '/') . '/internal' . $path);
        $headers = ['Accept: application/json'];
        if (is_string($body)) {
            $headers[] = 'Content-Type: application/json';
        }
        curl_setopt_array($handle, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 180,
            CURLOPT_HTTPHEADER => $headers,
        ]);
        if ($body !== null) {
            curl_setopt($handle, CURLOPT_POSTFIELDS, $body);
        }
        $response = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $error = curl_error($handle);
        $errno = curl_errno($handle);
        curl_close($handle);
        if ($response === false) {
            error_log('WeatherML processing connection: ' . $error);
            $timeout = $errno === CURLE_OPERATION_TIMEDOUT;
            throw new ApiException(
                $timeout ? 'El procesamiento tardó demasiado. Actualiza el modelo antes de intentar entrenar otra vez.' : 'El servicio de procesamiento no está disponible. Inicia Flask e inténtalo nuevamente.',
                $timeout ? 504 : 503,
                $timeout ? 'processing_timeout' : 'processing_unavailable',
            );
        }
        try {
            $decoded = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new ApiException('El servicio devolvió una respuesta no válida.', 502, 'invalid_response');
        }
        if (!is_array($decoded)) {
            throw new ApiException('El servicio devolvió una respuesta no válida.', 502, 'invalid_response');
        }
        if ($status >= 400) {
            $problem = $decoded['error'] ?? [];
            throw new ApiException(
                $problem['message'] ?? 'No se pudo procesar la solicitud.',
                $status, $problem['code'] ?? 'processing_error', $problem['fields'] ?? [],
            );
        }
        if ($status < 200 || $status >= 300 || !isset($decoded['data']) || !is_array($decoded['data'])) {
            throw new ApiException('La respuesta no cumple el contrato esperado.', 502, 'invalid_response');
        }
        return $decoded['data'];
    }
}
