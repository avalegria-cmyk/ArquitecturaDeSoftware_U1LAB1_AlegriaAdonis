export class ApiError extends Error {
  constructor(message, code = 'network_error', fields = {}) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers: { Accept: 'application/json', ...options.headers } });
  } catch {
    throw new ApiError('No se pudo conectar con la API. Revisa que los servicios estén iniciados.');
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('La API no devolvió una respuesta válida. Revisa que PHP esté iniciado.');
  }
  if (!response.ok || payload.error) {
    throw new ApiError(payload.error?.message || 'No se pudo completar la solicitud.', payload.error?.code, payload.error?.fields);
  }
  return payload.data;
}

export const weatherApi = {
  getModel: () => request('/model'),
  train: (file) => {
    const body = new FormData();
    body.append('dataset', file);
    return request('/train', { method: 'POST', body });
  },
  predict: (features, modelId) => request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features, model_id: modelId }),
  }),
};
