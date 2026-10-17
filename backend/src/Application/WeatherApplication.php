<?php
declare(strict_types=1);
namespace Weather\Application;

use Weather\Domain\ApiException;
use Weather\Domain\ProcessingGateway;

final class WeatherApplication
{
    public function __construct(private ProcessingGateway $processing) {}

    public function state(): array
    {
        return $this->processing->state();
    }

    public function train(string $path, string $filename, int $size): array
    {
        if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'csv') {
            throw new ApiException('Solo se aceptan archivos CSV.');
        }
        if ($size <= 0 || $size > 10 * 1024 * 1024) {
            throw new ApiException('El CSV debe contener datos y pesar como máximo 10 MB.', 413);
        }
        return $this->processing->train($path, basename($filename));
    }

    public function predict(array $body): array
    {
        if (!isset($body['features']) || !is_array($body['features'])) {
            throw new ApiException('Completa las características para predecir.');
        }
        if (!isset($body['model_id']) || !is_string($body['model_id']) || $body['model_id'] === '') {
            throw new ApiException('Actualiza el modelo antes de predecir.', 409, 'model_changed');
        }
        return $this->processing->predict($body['features'], $body['model_id']);
    }
}
