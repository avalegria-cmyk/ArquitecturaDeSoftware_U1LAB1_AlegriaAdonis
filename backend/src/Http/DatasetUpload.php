<?php
declare(strict_types=1);
namespace Weather\Http;

use Weather\Domain\ApiException;

final class DatasetUpload
{
    /** Traduce la estructura de carga de PHP a datos para el caso de uso. */
    public static function fromRequest(?array $upload): array
    {
        $error = $upload['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($error === UPLOAD_ERR_NO_FILE) {
            throw new ApiException('Selecciona un archivo CSV.');
        }
        if (in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            throw new ApiException('El archivo supera el límite de 10 MB.', 413, 'file_too_large');
        }
        if ($error !== UPLOAD_ERR_OK || !is_string($upload['name'] ?? null)
            || !is_string($upload['tmp_name'] ?? null)
            || !is_uploaded_file($upload['tmp_name'])) {
            throw new ApiException('No se pudo recibir el archivo. Vuelve a seleccionarlo.', 400);
        }
        return [$upload['tmp_name'], $upload['name'], (int) $upload['size']];
    }
}
