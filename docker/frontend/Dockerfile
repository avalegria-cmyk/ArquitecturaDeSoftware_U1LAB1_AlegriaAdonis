FROM node:22-bookworm-slim

WORKDIR /app
COPY frontend/ ./

EXPOSE 5173

# Las dependencias Linux viven en un volumen, separadas de las del Mac.
# Instalar al iniciar sincroniza el volumen con package.json y el lockfile.
CMD ["sh", "-c", "npm install --no-audit --no-fund && exec npm run dev -- --host 0.0.0.0"]
