# WeatherML

Aplicación local para entrenar un modelo de clasificación con datos meteorológicos y realizar predicciones. La interfaz permite cargar un CSV, consultar las métricas del modelo activo y completar un formulario generado según sus características.

La refactorización combina arquitectura en capas y Tuberías y Filtros. Se utiliza Random Forest con 200 árboles, semilla 42 y balanceo de clases, así como la división estratificada 80/20. En una comparación aislada de cantidades de árboles, 200 obtuvo el mayor accuracy promedio de validación cruzada entre las opciones evaluadas y pasó de 75,00 % a 75,42 % en el conjunto reservado, frente a los 100 árboles originales. El cambio a 200 se aplica al próximo entrenamiento; no reemplaza automáticamente el modelo guardado.

## Organización

```text
Pipes&Filtros/
├── compose.yaml                Tres servicios, redes y volúmenes Docker
├── docker/                     Un Dockerfile por servicio
├── frontend/                   React, JavaScript y Tailwind CSS
│   └── src/
│       ├── components/         Botones, paneles y avisos reutilizables
│       ├── features/weather/   Carga, predicción, métricas y estado de pantalla
│       └── services/           Cliente HTTP de la API
├── backend/                    API REST en PHP
│   ├── public/index.php        Entrada HTTP y composición de dependencias
│   └── src/
│       ├── Application/        Casos de uso de WeatherML
│       ├── Domain/             Contrato del procesamiento y errores
│       ├── Infrastructure/     Adaptador HTTP hacia Flask
│       └── Http/               Respuestas JSON
├── processing/                 Servicio Flask y Python
│   ├── application/            Orquestación del entrenamiento y predicción
│   ├── domain/                 Contrato del repositorio y errores
│   ├── filters/                Carga → Validación → Preparación → Entrenamiento → Evaluación
│   ├── http/                   Rutas internas
│   ├── infrastructure/         Persistencia atómica mediante Joblib
│   └── storage/                Modelo nuevo, esquema y métricas
├── docs/
│   └── api.md                  Contrato entre las capas
├── app.py                      Entrada del servicio Python
└── requirements.txt            Dependencias de procesamiento
```

Flujo de comunicación:

```text
Navegador → React → /api (proxy Vite) → PHP → Flask → Tuberías y Filtros
                                                  ↕
                                            Repositorio Joblib
```

El navegador consume únicamente la API PHP para las operaciones del modelo. Los componentes React no conocen Flask ni las rutas de almacenamiento. PHP depende de `ProcessingGateway`, implementado por `FlaskGateway`; el servicio Python depende del contrato `ModelRepository`, implementado por `JoblibModelRepository`. Los filtros no dependen de Flask ni de React.

## Ejecución recomendada con Docker

Abre una terminal en la raíz del repositorio, donde está compose.yaml. Abre Docker Desktop y espera a que esté listo. No necesitas instalar PHP, Python o Node.js en el Mac para ejecutar esta modalidad. Docker Compose construye tres imágenes y levanta tres contenedores independientes.

```bash
docker compose up --build
```

Cuando Vite indique que está listo, abre **http://localhost:5173**. La primera vez se descargan las imágenes y las dependencias; puede tardar varios minutos. El entorno virtual local puede permanecer activo, pero Docker no lo utiliza. Si tenías Vite ejecutándose fuera de Docker, detenlo con Ctrl+C para liberar el puerto 5173.

| Servicio | Tecnología | Dirección dentro de Docker | Acceso desde el Mac |
| --- | --- | --- | --- |
| `frontend` | Node.js 22, React y Tailwind | `frontend:5173` | `http://localhost:5173` |
| `backend` | PHP 8.3 con cURL | `backend:8000` | A través de `/api` en React |
| `processing` | Python 3.12 y Flask | `processing:5001` | Solo desde PHP |

El frontend y PHP comparten la red `presentation`; PHP y Flask comparten la red privada `processing`. Los nombres de servicio resuelven las conexiones, sin IP fijas. Los controles de disponibilidad de los puertos ordenan el inicio; no son pruebas funcionales del modelo.

### Editar desde VS Code

Abre esta misma carpeta local. Los archivos se montan en los contenedores:

- React y CSS: Vite actualiza la interfaz al guardar, con detección por sondeo para Docker Desktop.
- PHP: la siguiente solicitud usa el código guardado.
- Python: Flask reinicia el servicio al detectar cambios, sin activar el depurador web. Evita editar mientras entrenas, porque la recarga interrumpe ese procesamiento.
- Si modificas `frontend/package.json`, ejecuta `docker compose restart frontend` para sincronizar las dependencias.
- Si modificas `requirements.txt`, un Dockerfile o `compose.yaml`, ejecuta `docker compose up --build` nuevamente.

`node_modules` y la caché npm están en volúmenes Docker, separados de los paquetes de macOS. El frontend instala las dependencias al iniciar y genera o actualiza `frontend/package-lock.json` en tu carpeta; conserva ese archivo en el repositorio.

### Detener y volver a iniciar

Con los registros en primer plano, Ctrl+C detiene los servicios. También puedes usar otra terminal:

```bash
docker compose down
```

Para iniciarlos en segundo plano y consultar sus registros:

```bash
docker compose up -d --build
docker compose logs -f
```

Para ver solo los registros de un servicio: `docker compose logs -f processing`, `backend` o `frontend`.

### Persistencia del modelo en Docker

El modelo nuevo se guarda en `/data/weather_model.joblib`, dentro del volumen `model_data`. Se conserva al detener, recrear contenedores o ejecutar `docker compose down`. No uses `docker compose down -v` si quieres conservarlo: esa opción elimina también los volúmenes.

El modelo de Docker es independiente del archivo local en `processing/storage`. Entrena con tu CSV la primera vez que uses Docker. No se importan automáticamente modelos previos.

Los Dockerfiles están en `docker/frontend`, `docker/backend` y `docker/processing`. Es una configuración de desarrollo con recarga de código.

## Alternativa sin Docker

Las instrucciones siguientes solo son necesarias si prefieres ejecutar los tres procesos directamente en el Mac.

### Requisitos locales

- Python 3.11 o 3.12 para las versiones fijadas en `requirements.txt`.
- Node.js 22.12 o superior y npm.
- PHP 8.2 o superior con la extensión cURL habilitada.
- Tres terminales, una por servicio.

No se necesita Composer: el cargador de clases de PHP resuelve el espacio de nombres `Weather` desde `backend/src`.

## Preparación

Abre una terminal en la carpeta del proyecto. Las comillas son necesarias porque la ruta contiene espacios y `&`.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

El entorno `.venv` se crea localmente y no se incluye en Git. En Windows, activa el entorno con `.venv\Scripts\activate`.

Instala las dependencias de la interfaz una vez:

```bash
cd frontend
npm install
```

El repositorio incluye `package-lock.json` para registrar las versiones resueltas. Las dependencias instaladas en `node_modules` no se incluyen en Git.

## Inicio local

### Terminal 1 — procesamiento

Desde la raíz del proyecto:

```bash
source .venv/bin/activate
python app.py
```

Flask escucha en `http://127.0.0.1:5001`. Es una API interna: la interfaz ya no se abre en este puerto.

### Terminal 2 — API PHP

Desde la raíz del proyecto:

```bash
php -d upload_max_filesize=10M -d post_max_size=12M -d max_execution_time=190 -d display_errors=0 -d log_errors=1 -S 127.0.0.1:8000 -t backend/public backend/public/index.php
```

Se usan opciones `-d` para mantener la configuración y extensiones ya instaladas de PHP. `backend/php.ini` contiene las mismas directivas como referencia para otro servidor.

### Terminal 3 — interfaz

Desde la raíz del proyecto:

```bash
cd frontend
npm run dev
```

Abre **http://127.0.0.1:5173**. Vite redirige `/api` a PHP y evita configurar CORS en el navegador. Los tres procesos deben mantenerse activos.

Si más adelante deseas generar los archivos de distribución, `npm run build` los crea en `frontend/dist`; `npm run preview` permite consultarlos localmente en el puerto 4173, manteniendo PHP y Flask iniciados.

## Datos y uso

1. Selecciona un CSV UTF-8 separado por comas, de hasta 10 MB.
2. Incluye una columna llamada exactamente `rain` y al menos una característica predictora. `rain` necesita al menos dos clases.
3. Cada clase debe tener dos o más registros; además, las particiones de entrenamiento y evaluación deben tener espacio para todas las clases. Por ejemplo, para dos clases se requieren al menos seis filas válidas, con al menos dos filas por clase.
4. Pulsa **Entrenar modelo** y revisa las métricas. Las columnas completamente vacías y los números infinitos producen un mensaje de validación; los valores faltantes parciales se imputan en la tubería entrenada.
5. Abre **Predecir**. Los campos numéricos aceptan decimales y los categóricos ofrecen las opciones del dataset. Los rangos observados orientan al usuario sin imponer límites físicos inventados.
6. Genera la predicción. El resultado conserva las etiquetas originales del CSV y muestra las probabilidades por clase; no presupone que `1`, `Yes` o cualquier otra etiqueta significa lluvia.

Evita incluir identificadores, columnas que revelen la respuesta o variables que no estarán disponibles cuando quieras predecir. La aplicación trata todas las columnas distintas de `rain` como características.

Accuracy es la proporción total de aciertos. Precision, Recall y F1 se calculan con promedio ponderado por soporte de cada clase. El preprocesamiento se ajusta únicamente con el conjunto de entrenamiento.

## Modelo guardado

El nuevo modelo se guarda en `processing/storage/weather_model.joblib` junto con su identificador, fecha, columnas, categorías, rangos y métricas. Al recargar la página se recupera ese estado. Predecir no elimina los resultados del entrenamiento.

Los modelos entrenados no se incluyen en el repositorio. Después de clonar el proyecto, carga tu CSV y entrena para crear el modelo de esta instalación.

El reemplazo del archivo nuevo es atómico: una lectura obtiene el modelo anterior o el nuevo completo. Una predicción incluye el identificador del modelo que generó su formulario; si cambió, la API solicita actualizarlo. Si un entrenamiento falla antes del guardado, se conserva el modelo anterior.

## Configuración y alcance

Las variables se leen del entorno del proceso; no hay carga automática de archivos `.env`.

| Variable | Proceso | Valor predeterminado |
| --- | --- | --- |
| `PROCESSING_URL` | PHP | `http://127.0.0.1:5001` |
| `API_URL` | Vite | `http://127.0.0.1:8000` |
| `WEATHER_MODEL_PATH` | Python | Ruta absoluta a `processing/storage/weather_model.joblib` |

Esta entrega está preparada para uso local en el laboratorio, con un modelo activo compartido. No incorpora cuentas de usuario, historial de modelos ni colas de trabajos. El entrenamiento es síncrono; PHP espera hasta 180 segundos al procesamiento. Ante un timeout, actualiza el modelo antes de repetir el entrenamiento porque Python puede haber continuado trabajando. Si se lanzan entrenamientos concurrentes, queda activo el último que termina de guardarse.

La separación en tres procesos añade configuración y comunicación HTTP; permite sustituir la interfaz, el adaptador o la persistencia sin trasladar esos detalles a los filtros. Los servidores incluidos son para desarrollo local; un despliegue público requeriría servidores de producción, control de acceso y gestión de trabajos largos.

## Referencias de configuración

- [Servicios de Docker Compose](https://docs.docker.com/reference/compose-file/services/).
- [Imagen oficial PHP](https://hub.docker.com/_/php).
- [Integración de Tailwind CSS con Vite](https://tailwindcss.com/docs/installation/using-vite).
- [Guía oficial de Vite](https://vite.dev/guide/).

