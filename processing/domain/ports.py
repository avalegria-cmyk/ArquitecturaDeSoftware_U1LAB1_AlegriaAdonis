from typing import Protocol, Any


class ModelRepository(Protocol):
    """Contrato de persistencia; la aplicación no conoce rutas ni Joblib."""
    def load(self) -> dict[str, Any] | None: ...
    def save(self, bundle: dict[str, Any]) -> None: ...
