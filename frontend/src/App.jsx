import { useRef, useState } from 'react';
import { ArrowRight, CloudSun, Database, RefreshCw, Sparkles } from 'lucide-react';
import Button from './components/Button';
import Notice from './components/Notice';
import Panel from './components/Panel';
import DatasetUpload from './features/weather/DatasetUpload';
import { ModelPerformance, ModelConfusion } from './features/weather/ModelResults';
import ExistingModelDialog from './features/weather/ExistingModelDialog';
import PredictionForm from './features/weather/PredictionForm';
import PredictionResult from './features/weather/PredictionResult';
import { useWeather } from './features/weather/useWeather';

export default function App() {
  const { model, prediction, operation, error, refresh, train, predict, clearPrediction } = useWeather();
  const [view, setView] = useState('train');
  const busy = Boolean(operation);
  const [dismissedModel, setDismissedModel] = useState(null);
  const moduleSection = useRef(null);
  const showPrediction = view === 'predict' && model.trained;
  function selectModule(nextView) {
    setView(nextView);
    moduleSection.current?.focus({ preventScroll: true });
    moduleSection.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }
  return <div className="min-h-screen">
    <a href="#main" className="skip-link">Saltar al contenido</a>
    <header className="border-b border-slate-200/70 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-10">
        <a href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight" aria-label="WeatherML inicio"><span className="brand-icon"><CloudSun size={24} /></span>Weather<span className="-ml-3 text-emerald-700">ML</span></a>
        <span className={`status-pill ${model.trained ? 'status-ready' : ''}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{operation === 'loading' ? 'Consultando modelo' : model.trained ? 'Modelo disponible' : 'Sin modelo activo'}</span>
      </div>
    </header>
    <main id="main" className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-10 lg:pt-14">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div><p className="eyebrow mb-3">Observa. Aprende. Predice.</p><h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Entiende tus datos.<br /><span className="text-emerald-800">Anticipa la lluvia.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Transforma observaciones meteorológicas en un modelo de predicción. Explora sus resultados, una observación a la vez.</p></div>
        <Button type="button" variant="secondary" onClick={refresh} disabled={busy}><RefreshCw size={16} />Actualizar modelo</Button>
      </div>
      <ol className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Proceso de trabajo">
        {['Carga tus datos', 'Revisa el aprendizaje', 'Realiza una predicción'].map((label, i) => <li key={label} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-3"><span className="step-number">0{i+1}</span><span className="text-xs font-medium sm:text-sm">{label}</span>{i < 2 && <ArrowRight className="ml-auto text-slate-300" size={15} aria-hidden="true" />}</li>)}
      </ol>
      {error && <div className="mb-6"><Notice danger>{error.message}{error.code === 'model_changed' && <p className="mt-1">Pulsa «Actualizar modelo» para cargar su nueva configuración.</p>}</Notice></div>}
      {operation && <div className="mb-6"><Notice>{operation === 'training' ? 'Procesando el CSV y entrenando el modelo. Puedes esperar en esta página; las métricas aparecerán al finalizar.' : operation === 'predicting' ? 'Calculando el resultado con el modelo activo…' : 'Consultando el modelo guardado…'}</Notice></div>}
      <div className="space-y-6">
        <div ref={moduleSection} tabIndex={-1} className="min-w-0 rounded-2xl">
          <Panel title={showPrediction ? 'Predecir' : 'Prepara tu modelo'}
            eyebrow={showPrediction ? 'Predicción · Nueva observación' : 'Entrenamiento · Dataset meteorológico'}
            action={showPrediction
              ? <Sparkles size={23} className="shrink-0 text-emerald-700" aria-hidden="true" />
              : <Database size={23} className="shrink-0 text-emerald-700" aria-hidden="true" />}>
            <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1.5" role="group" aria-label="Selecciona una tarea">
              <button type="button" className={`tab ${!showPrediction ? 'tab-active' : ''}`}
                onClick={() => setView('train')} aria-pressed={!showPrediction} aria-controls="training-content" disabled={busy}>
                <Database size={17} aria-hidden="true" />Entrenar
              </button>
              <button type="button" className={`tab ${showPrediction ? 'tab-active' : ''}`}
                onClick={() => setView('predict')} aria-pressed={showPrediction} aria-controls="prediction-content" disabled={busy || !model.trained}>
                <Sparkles size={17} aria-hidden="true" />Predecir
              </button>
            </div>
            <div id="training-content" hidden={showPrediction}>
              <DatasetUpload onTrain={train} busy={operation === 'training'} disabled={busy} hasModel={model.trained} />
            </div>
            <div id="prediction-content" hidden={!showPrediction}>
              {model.trained && <>
                <PredictionForm key={model.model_id} schema={model.schema} onPredict={predict} busy={operation === 'predicting'} disabled={busy} errors={error?.fields} onChange={clearPrediction} />
                <PredictionResult prediction={prediction} />
              </>}
            </div>
          </Panel>
        </div>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <ModelPerformance model={model} />
          <ModelConfusion model={model} />
        </div>
      </div>
      <ExistingModelDialog model={model} open={model.trained && !busy && dismissedModel !== model.model_id}
        onDismiss={() => setDismissedModel(model.model_id)} onPredict={() => selectModule('predict')} />
      <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500"><span>WeatherML · Laboratorio 01</span><span>Aprendizaje a partir de tus datos meteorológicos</span></footer>
    </main>
  </div>;
}
