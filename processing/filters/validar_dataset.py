import numpy as np
import pandas as pd


class ValidateDatasetFilter:
    """Normaliza y valida el contrato del dataset antes del preprocesamiento."""
    def __init__(self, target="rain"):
        self.target = target

    def run(self, dataframe):
        if dataframe.empty:
            raise ValueError("El dataset está vacío.")
        frame = dataframe.copy()
        frame.columns = frame.columns.astype(str).str.strip()
        if frame.columns.duplicated().any() or any(not name for name in frame.columns):
            raise ValueError("Los nombres de las columnas deben ser únicos y no estar vacíos.")
        if self.target not in frame:
            raise ValueError(f"Falta la columna objetivo '{self.target}'.")
        if len(frame.columns) < 2:
            raise ValueError("Incluye al menos una característica además de rain.")
        for name in frame:
            if not pd.api.types.is_numeric_dtype(frame[name]) or name == self.target:
                frame[name] = frame[name].map(
                    lambda value: str(value).strip() if pd.notna(value) else np.nan
                ).replace("", np.nan)
        frame = frame.dropna(subset=[self.target]).drop_duplicates().copy()
        if frame.empty or frame[self.target].nunique() < 2:
            raise ValueError("Se necesitan registros válidos de al menos dos clases en rain.")
        features = frame.drop(columns=[self.target])
        if features.isna().all().any():
            raise ValueError("Hay características sin ningún dato. Completa o elimina esas columnas.")
        numeric = features.select_dtypes(include=["number", "bool"])
        if np.isinf(numeric.to_numpy(dtype=float)).any():
            raise ValueError("Las características no pueden contener valores infinitos.")
        return frame
