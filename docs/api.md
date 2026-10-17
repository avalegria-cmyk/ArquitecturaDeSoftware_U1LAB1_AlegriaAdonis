# Contrato HTTP de WeatherML

La interfaz consume rutas relativas `/api`. Vite las envía a PHP; PHP valida la solicitud y utiliza `ProcessingGateway` para comunicarse con Flask. Los datos del formulario se validan también en Python contra el esquema del modelo activo.

| Ruta pública | Método | Ruta interna Flask | Propósito |
| --- | --- | --- | --- |
| `/api/model` | GET | `/internal/model` | Consultar modelo, esquema y métricas |
| `/api/train` | POST | `/internal/train` | Recibir un CSV y entrenar |
| `/api/predict` | POST | `/internal/predict` | Predecir una observación |

## Respuestas

Las respuestas correctas usan `{ "data": ... }`. Los errores usan:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Revisa los campos indicados.",
    "fields": { "temperature": "Ingresa un número válido y finito." }
  }
}
```

Los mensajes no revelan trazas de ejecución. Los detalles inesperados se registran en la terminal del servicio correspondiente.

## Consulta del modelo

Sin modelo devuelve `{"data":{"trained":false}}`. Con modelo devuelve `trained`, `model_id`, `trained_at` (UTC ISO 8601), `dataset_name`, `schema` y `results` dentro de `data`.

Cada entrada del esquema contiene `name` y `type`. Los campos `number` incluyen `min_observed` y `max_observed`; los campos `category` incluyen `options`.

`results` contiene `rows`, `removed_rows`, `feature_count`, `target`, `train_rows`, `test_rows`, `class_distribution` y `metrics`. Las métricas incluyen `accuracy`, `precision`, `recall`, `f1`, `labels` y `confusion_matrix`; los porcentajes están entre 0 y 100.

## Entrenamiento

Envía `multipart/form-data` con el campo de archivo `dataset`. Máximo: 10 MB de archivo. La respuesta tiene la misma estructura que la consulta de un modelo entrenado. La aplicación mantiene un único modelo activo.

## Predicción

Envía `Content-Type: application/json`. Ejemplo de estructura; los campos y el identificador reales se obtienen de `/api/model`:

```json
{
  "model_id": "identificador-del-modelo-activo",
  "features": {
    "temperature": "21.5",
    "location": "Quito"
  }
}
```

La respuesta contiene `label`, `probability`, `distribution` y `model_id`. `distribution` es una lista de objetos con `label` y `probability`. La probabilidad corresponde a la clase predicha, no necesariamente a lluvia.

## Estados de error

| Estado | Significado |
| --- | --- |
| 400 | JSON o solicitud mal formada |
| 404 | Ruta inexistente |
| 405 | Método HTTP no permitido |
| 409 | Falta el modelo o el formulario corresponde a otra versión |
| 413 | Archivo o solicitud demasiado grande |
| 415 | Tipo de contenido no admitido en predicción |
| 422 | CSV, campos o distribución de clases inválidos |
| 500 | Error interno registrado por el servicio |
| 502 | Respuesta del servicio de procesamiento incompatible con el contrato |
| 503 | Procesamiento inaccesible o falta cURL en PHP |
| 504 | Se agotó el tiempo de espera del procesamiento |
