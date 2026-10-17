import { Sparkles } from 'lucide-react';

export default function PredictionResult({ prediction }) {
  if (!prediction) return null;
  return <section className="prediction-result mt-6" aria-live="polite" aria-atomic="true">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"><Sparkles size={15} /> Resultado de la predicción</div>
    <p className="my-3 break-words text-3xl font-semibold">{prediction.label}</p>
    <p className="text-sm">Probabilidad estimada de esta clase: <strong>{prediction.probability}%</strong></p>
    <ul className="mt-5 space-y-2 border-t border-white/20 pt-4 text-sm">
      {prediction.distribution.map((item) => <li key={item.label} className="flex justify-between gap-4"><span className="break-all">{item.label}</span><span>{item.probability}%</span></li>)}
    </ul>
    <p className="mt-4 text-xs leading-relaxed text-white/75">Estimación del modelo a partir de tu dataset; no equivale a un pronóstico meteorológico oficial.</p>
  </section>;
}
