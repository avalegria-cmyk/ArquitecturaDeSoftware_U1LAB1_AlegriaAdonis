FROM php:8.3-cli-bookworm

WORKDIR /app
COPY backend/ ./backend/

# La imagen oficial PHP CLI incluye cURL; esta configuración conserva sus extensiones.
EXPOSE 8000
CMD ["php", "-d", "upload_max_filesize=10M", "-d", "post_max_size=12M", "-d", "max_execution_time=190", "-d", "display_errors=0", "-d", "log_errors=1", "-S", "0.0.0.0:8000", "-t", "backend/public", "backend/public/index.php"]
