FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py ./
COPY processing/ ./processing/

EXPOSE 5001

# Recarga el código editado sin habilitar el depurador web interactivo.
CMD ["python", "-m", "flask", "--app", "app", "run", "--host=0.0.0.0", "--port=5001", "--reload", "--no-debugger"]
