"""Punto de entrada del servicio de procesamiento; la interfaz vive en frontend."""
from processing import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)
