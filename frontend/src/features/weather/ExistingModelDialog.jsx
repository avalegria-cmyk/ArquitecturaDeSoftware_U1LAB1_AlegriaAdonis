import { useEffect, useRef } from 'react';
import { ArrowRight, CircleCheck, X } from 'lucide-react';
import Button from '../../components/Button';
import MetricSummary from './MetricSummary';

export default function ExistingModelDialog({ model, open, onDismiss, onPredict }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function goToPrediction() {
    dialogRef.current.close();
    onDismiss();
    requestAnimationFrame(onPredict);
  }

  return <dialog ref={dialogRef} className="model-dialog" aria-labelledby="existing-model-title"
    aria-describedby="existing-model-description" onCancel={onDismiss}>
    {model.trained && <div className="p-6 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="icon-tile"><CircleCheck size={30} aria-hidden="true" /></span>
        <button type="button" onClick={onDismiss} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar aviso"><X size={21} /></button>
      </div>
      <p className="eyebrow mb-2">Modelo disponible</p>
      <h2 id="existing-model-title" className="text-2xl font-semibold tracking-tight">Ya existe un modelo entrenado</h2>
      <p id="existing-model-description" className="mt-3 text-sm leading-relaxed text-slate-600">Puedes usarlo para predecir sin volver a cargar el dataset. Estas son sus métricas de evaluación.</p>
      <p className="my-5 break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{model.dataset_name}</p>
      <MetricSummary metrics={model.results.metrics} compact />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onDismiss}>Ver módulos</Button>
        <Button type="button" className="flex-1" onClick={goToPrediction} autoFocus>Ir a predecir <ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
    </div>}
  </dialog>;
}
