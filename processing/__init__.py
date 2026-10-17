import os
from pathlib import Path

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from .application.training_pipeline import TrainingPipeline
from .application.weather_service import WeatherService
from .domain.errors import ApplicationError
from .http.routes import create_routes
from .infrastructure.model_repository import JoblibModelRepository


def create_app(repository=None, pipeline=None):
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024
    default_path = Path(__file__).resolve().parent / "storage" / "weather_model.joblib"
    service = WeatherService(
        repository if repository is not None else JoblibModelRepository(os.getenv("WEATHER_MODEL_PATH", str(default_path))),
        pipeline if pipeline is not None else TrainingPipeline(),
    )
    app.register_blueprint(create_routes(service))

    @app.errorhandler(ApplicationError)
    def application_error(error):
        return jsonify(error={"code": error.code, "message": str(error), "fields": error.fields}), error.status

    @app.errorhandler(ValueError)
    def invalid_data(error):
        return jsonify(error={"code": "invalid_dataset", "message": str(error), "fields": {}}), 422

    @app.errorhandler(HTTPException)
    def http_error(error):
        message = "El archivo supera el límite de 10 MB." if error.code == 413 else "Solicitud no válida."
        return jsonify(error={"code": "http_error", "message": message, "fields": {}}), error.code

    @app.errorhandler(Exception)
    def unexpected_error(error):
        app.logger.exception("Error no controlado en el procesamiento")
        return jsonify(error={"code": "processing_error", "message": "No se pudo completar el procesamiento. Revisa el registro del servicio.", "fields": {}}), 500

    return app
