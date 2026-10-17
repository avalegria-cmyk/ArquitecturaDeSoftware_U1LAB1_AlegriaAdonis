import math
import pandas as pd

from processing.domain.errors import ApplicationError


def prepare_sample(values, schema):
    """Convierte según el esquema entrenado, nunca según la apariencia del texto."""
    if not isinstance(values, dict):
        raise ApplicationError("Las características deben ser un objeto JSON.")
    cleaned, errors = {}, {}
    expected = {field["name"] for field in schema}
    if set(values) - expected:
        raise ApplicationError("Se enviaron características que no pertenecen al modelo.")
    for field in schema:
        name = field["name"]
        value = values.get(name)
        if value is None or isinstance(value, (list, dict, bool)) or str(value).strip() == "":
            errors[name] = "Completa este campo."
            continue
        if field["type"] == "number":
            try:
                number = float(value)
                if not math.isfinite(number):
                    raise ValueError()
                cleaned[name] = number
            except (ValueError, TypeError, OverflowError):
                errors[name] = "Ingresa un número válido y finito."
        else:
            category = str(value).strip()
            if category not in field["options"]:
                errors[name] = "Selecciona una de las categorías disponibles."
            else:
                cleaned[name] = category
    if errors:
        raise ApplicationError("Revisa los campos indicados.", fields=errors)
    return pd.DataFrame([cleaned], columns=[field["name"] for field in schema])
