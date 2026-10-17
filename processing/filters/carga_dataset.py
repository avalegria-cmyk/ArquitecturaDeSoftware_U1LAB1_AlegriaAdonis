import pandas as pd


class LoadDatasetFilter:
    def run(self, source):
        try:
            return pd.read_csv(source)
        except (pd.errors.EmptyDataError, pd.errors.ParserError, UnicodeDecodeError) as error:
            raise ValueError("El CSV está vacío, no usa UTF-8 o tiene filas mal formadas.") from error
