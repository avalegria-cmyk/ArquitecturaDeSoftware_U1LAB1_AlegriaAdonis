from datetime import datetime, timezone
from uuid import uuid4

from processing.domain.errors import ApplicationError
from processing.domain.ports import ModelRepository
from .prediction import prepare_sample


class WeatherService:
    def __init__(self, repository: ModelRepository, pipeline):
        self.repository = repository
        self.pipeline = pipeline

    @staticmethod
    def describe(bundle):
        if bundle is None:
            return {"trained": False}
        return {"trained": True, **bundle["metadata"]}

    def state(self):
        return self.describe(self.repository.load())

    def train(self, stream, filename):
        model, schema, results = self.pipeline.run(stream)
        bundle = {
            "model": model,
            "metadata": {
                "model_id": str(uuid4()),
                "trained_at": datetime.now(timezone.utc).isoformat(),
                "dataset_name": filename,
                "schema": schema, "results": results,
            },
        }
        self.repository.save(bundle)
        return self.describe(bundle)

    def predict(self, values, model_id):
        bundle = self.repository.load()
        if bundle is None:
            raise ApplicationError("Primero carga un CSV y entrena el modelo.", "model_missing", 409)
        if model_id != bundle["metadata"]["model_id"]:
            raise ApplicationError(
                "El modelo cambió. Actualiza el modelo y completa nuevamente el formulario.",
                "model_changed", 409,
            )
        sample = prepare_sample(values, bundle["metadata"]["schema"])
        model = bundle["model"]
        label = str(model.predict(sample)[0])
        probabilities = model.predict_proba(sample)[0]
        distribution = [
            {"label": str(cls), "probability": round(float(probability)*100, 2)}
            for cls, probability in zip(model.classes_, probabilities)
        ]
        return {
            "label": label,
            "probability": next(item["probability"] for item in distribution if item["label"] == label),
            "distribution": distribution,
            "model_id": bundle["metadata"]["model_id"],
        }
