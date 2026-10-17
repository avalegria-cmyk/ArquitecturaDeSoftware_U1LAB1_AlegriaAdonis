from math import ceil

from sklearn.model_selection import train_test_split

from processing.filters import (
    LoadDatasetFilter, ValidateDatasetFilter, PrepareDataFilter,
    TrainModelFilter, EvaluateModelFilter,
)
from processing.domain.errors import ApplicationError


class TrainingPipeline:
    """Tubería de entrenamiento independiente de HTTP y almacenamiento."""
    def __init__(self, target="rain", loader=None, validator=None, preparer=None,
                 trainer=None, evaluator=None):
        self.target = target
        self.loader = loader or LoadDatasetFilter()
        self.validator = validator or ValidateDatasetFilter(target)
        self.preparer = preparer or PrepareDataFilter(target)
        self.trainer = trainer or TrainModelFilter()
        self.evaluator = evaluator or EvaluateModelFilter()

    def run(self, source):
        raw = self.loader.run(source)
        validated = self.validator.run(raw)
        X, y, info = self.preparer.run(validated)
        counts = y.value_counts()
        test_rows = ceil(len(y) * 0.20)
        if counts.min() < 2 or test_rows < len(counts) or len(y)-test_rows < len(counts):
            raise ApplicationError(
                "No hay suficientes registros por clase para dividir los datos 80/20. "
                "Incluye al menos dos registros por clase y suficientes filas en ambos grupos."
            )
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y,
        )
        model = self.trainer.run(X_train, y_train, info)
        metrics = self.evaluator.run(model, X_test, y_test)
        schema = []
        for name in X.columns:
            numeric = name in info["numeric_columns"]
            field = {"name": name, "type": "number" if numeric else "category"}
            if numeric:
                field["min_observed"] = float(X[name].min())
                field["max_observed"] = float(X[name].max())
            else:
                field["options"] = sorted(X[name].dropna().unique().tolist())
            schema.append(field)
        results = {
            "rows": len(validated), "removed_rows": len(raw)-len(validated),
            "feature_count": len(X.columns), "target": self.target,
            "train_rows": len(X_train), "test_rows": len(X_test),
            "class_distribution": {str(k): int(v) for k, v in counts.items()},
            "metrics": metrics,
        }
        return model, schema, results
