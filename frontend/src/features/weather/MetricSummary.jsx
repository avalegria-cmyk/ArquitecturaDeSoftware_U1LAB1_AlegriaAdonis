const metricDefinitions = [
  ['accuracy', 'Accuracy', 'Proporción total de aciertos.'],
  ['precision', 'Precision', 'Precisión ponderada entre las clases.'],
  ['recall', 'Recall', 'Detección ponderada entre las clases.'],
  ['f1', 'F1-score', 'Balance ponderado de precisión y recall.'],
];

export default function MetricSummary({ metrics, compact = false }) {
  return <div className="grid grid-cols-2 gap-3">
    {metricDefinitions.map(([key, title, description]) => <div className="metric-tile" key={key}>
      <p className="text-xs font-semibold text-slate-600">{title}</p>
      <p className="my-3 text-3xl font-semibold tracking-tight tabular-nums">
        {metrics ? metrics[key] : '—'}{metrics && <span className="ml-0.5 text-lg text-slate-400">%</span>}
      </p>
      {!compact && <>
        {metrics && <div className="h-1 overflow-hidden rounded bg-emerald-100"><div className="h-full bg-emerald-700" style={{ width: `${metrics[key]}%` }} /></div>}
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{description}</p>
      </>}
    </div>)}
  </div>;
}
