from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from processing.domain.errors import ApplicationError


def create_routes(service):
    routes = Blueprint("weather", __name__, url_prefix="/internal")

    @routes.get("/model")
    def state():
        return jsonify(data=service.state())

    @routes.post("/train")
    def train():
        uploaded = request.files.get("dataset")
        if uploaded is None or not uploaded.filename:
            raise ApplicationError("Selecciona un archivo CSV.")
        if not uploaded.filename.lower().endswith(".csv"):
            raise ApplicationError("Solo se aceptan archivos CSV.")
        uploaded.stream.seek(0, 2)
        if uploaded.stream.tell() > 10 * 1024 * 1024:
            raise ApplicationError("El archivo supera el límite de 10 MB.", "file_too_large", 413)
        uploaded.stream.seek(0)
        return jsonify(data=service.train(
            uploaded.stream, secure_filename(uploaded.filename) or "dataset.csv",
        ))

    @routes.post("/predict")
    def predict():
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            raise ApplicationError("Envía un objeto JSON válido.", status=400)
        return jsonify(data=service.predict(body.get("features"), body.get("model_id")))

    return routes
