import { BarChart3, CheckCircle2, Grid3X3 } from 'lucide-react';
import Panel from '../../components/Panel';
import MetricSummary from './MetricSummary';

export function ModelPerformance({ model }) {
  if (!model.trained) return <Panel title="Rendimiento del modelo" eyebrow="Evaluación del modelo" action={<BarChart3 aria-hidden="true" />}>
    <p className="mb-5 text-sm text-slate-500">Entrena un modelo para consultar sus métricas con los datos reservados para evaluación.</p>
    <MetricSummary />
  </Panel>;
  const { results, dataset_name, trained_at } = model;
  const { metrics } = results;
  return (
    <Panel title="Rendimiento del modelo" eyebrow="Evaluación del modelo"
      action={<CheckCircle2 size={22} className="shrink-0 text-emerald-700" aria-label="Modelo entrenado" />}>
      <p className="mb-5 break-all text-sm text-slate-500">{dataset_name} <span className="block mt-1 text-xs">{new Date(trained_at).toLocaleString('es-EC')}</span></p>
      <MetricSummary metrics={metrics} />
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center">
        {[[results.rows, 'Registros válidos'], [results.feature_count, 'Características'], [results.removed_rows, 'Filas descartadas']].map(([value, title]) => <div key={title}><dd className="text-lg font-semibold">{value}</dd><dt className="mt-1 text-xs text-slate-500">{title}</dt></div>)}
      </dl>
      <p className="mt-5 text-xs text-slate-500">Entrenamiento: {results.train_rows} filas · Evaluación: {results.test_rows} filas</p>
    </Panel>
  );
}

export function ModelConfusion({ model }) {
  if (!model.trained) return <Panel title="Aciertos y errores" eyebrow="Matriz de confusión" action={<Grid3X3 aria-hidden="true" />}>
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <span className="icon-tile mb-4"><Grid3X3 size={28} aria-hidden="true" /></span>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">Después del entrenamiento verás las clases reales, las predicciones y la distribución de tus datos.</p>
    </div>
  </Panel>;
  const { results } = model;
  const { metrics } = results;
  return (
    <Panel title="Aciertos y errores" eyebrow="Matriz de confusión" action={<Grid3X3 size={22} className="text-emerald-700" aria-hidden="true" />}>
      <p className="mb-4 text-sm leading-relaxed text-slate-500">Filas: clase real. Columnas: clase predicha. La diagonal resalta los aciertos.</p>
      <div className="overflow-x-auto"><table className="confusion-table">
        <caption className="sr-only">Matriz de confusión del modelo activo</caption>
        <thead><tr><th scope="col">Real / Predicha</th>{metrics.labels.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{metrics.confusion_matrix.map((row, i) => <tr key={metrics.labels[i]}><th scope="row">{metrics.labels[i]}</th>{row.map((value, j) => <td key={metrics.labels[j]} className={i === j ? 'matrix-hit' : ''}>{value}</td>)}</tr>)}</tbody>
      </table></div>
      <h3 className="mt-7 mb-4 text-sm font-semibold">Distribución de clases · {results.target}</h3>
      <ul className="space-y-4">{Object.entries(results.class_distribution).map(([label, count]) => <li key={label}>
        <div className="mb-2 flex justify-between gap-4 text-xs"><span className="break-all font-medium">{label}</span><span className="shrink-0 text-slate-500">{count} registros</span></div>
        <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-emerald-700/70" style={{ width: `${count / results.rows * 100}%` }} /></div>
      </li>)}</ul>
    </Panel>
  );
}
