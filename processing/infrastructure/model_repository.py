import os
import tempfile
from pathlib import Path

import joblib


class JoblibModelRepository:
    """Publica modelo, esquema y métricas juntos mediante reemplazo atómico."""
    def __init__(self, path):
        self.path = Path(path)

    def load(self):
        if not self.path.exists():
            return None
        return joblib.load(self.path)

    def save(self, bundle):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary = tempfile.mkstemp(dir=self.path.parent, suffix=".joblib")
        os.close(descriptor)
        try:
            joblib.dump(bundle, temporary, compress=3)
            os.replace(temporary, self.path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
