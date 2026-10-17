import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '../../components/Button';

function exampleValue(field) {
  if (field.type !== 'number') return field.options[0] ?? '';

  const minimum = field.min_observed;
  const maximum = field.max_observed;
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return '';

  // Ejemplo ilustrativo dentro del rango; no representa una fila real del CSV.
  const midpoint = minimum / 2 + maximum / 2;
  const rounded = Number(midpoint.toFixed(2));
  return String(Math.min(maximum, Math.max(minimum, rounded)));
}

export default function PredictionForm({ schema, onPredict, busy, disabled, errors = {}, onChange }) {
  const [values, setValues] = useState(() => Object.fromEntries(schema.map((field) => [field.name, exampleValue(field)])));
  return <form onSubmit={(event) => { event.preventDefault(); onPredict(values); }}>
    <p className="mb-6 text-sm leading-relaxed text-slate-600">Los campos incluyen valores de ejemplo que puedes modificar antes de predecir. Son ilustrativos y no corresponden necesariamente a una observación real.</p>
    <div className="grid gap-5 sm:grid-cols-2">
      {schema.map((field, index) => {
        const id = `feature-${index}`;
        return <div key={field.name}>
          <label className="mb-2 block break-words text-sm font-semibold" htmlFor={id}>{field.name}</label>
          {field.type === 'number' ? <input id={id} type="number" step="any" required disabled={disabled}
            className="field" value={values[field.name]} placeholder="Ingresa un valor"
            aria-invalid={Boolean(errors[field.name])} aria-describedby={`${id}-help`}
            onChange={(event) => { setValues({ ...values, [field.name]: event.target.value }); onChange(); }} />
            : <select id={id} required disabled={disabled} className="field" value={values[field.name]}
              aria-invalid={Boolean(errors[field.name])} aria-describedby={`${id}-help`}
              onChange={(event) => { setValues({ ...values, [field.name]: event.target.value }); onChange(); }}>
              <option value="">Selecciona una opción</option>
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>}
          <p id={`${id}-help`} className={`mt-2 text-xs ${errors[field.name] ? 'text-red-700' : 'text-slate-500'}`}>
            {errors[field.name] || (field.type === 'number' ? `Rango observado: ${field.min_observed} a ${field.max_observed}. Es una referencia, no un límite.` : 'Categorías presentes en los datos de entrenamiento.')}
          </p>
        </div>;
      })}
    </div>
    <Button type="submit" className="mt-7 w-full" busy={busy} disabled={disabled}>
      {!busy && <Sparkles size={18} />}{busy ? 'Calculando predicción…' : 'Generar predicción'}
    </Button>
  </form>;
}
