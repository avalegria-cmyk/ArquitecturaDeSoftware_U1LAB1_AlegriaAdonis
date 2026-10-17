import { useRef, useState } from 'react';
import { ArrowUpRight, FileSpreadsheet, UploadCloud } from 'lucide-react';
import Button from '../../components/Button';
import Notice from '../../components/Notice';

export default function DatasetUpload({ onTrain, busy, disabled, hasModel }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const input = useRef(null);

  function select(candidate) {
    setError('');
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith('.csv')) {
      setError('Selecciona un archivo con extensión .csv.'); setFile(null); return;
    }
    if (candidate.size === 0 || candidate.size > 10 * 1024 * 1024) {
      setError('El archivo debe contener datos y pesar como máximo 10 MB.'); setFile(null); return;
    }
    setFile(candidate);
  }

  return <form onSubmit={(event) => { event.preventDefault(); if (file) onTrain(file); }}>
    <button type="button" className={`dropzone ${dragging ? 'dropzone-active' : ''}`} disabled={disabled}
      onClick={() => input.current.click()}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) select(event.dataTransfer.files[0]); }}>
      <span className="icon-tile">{file ? <FileSpreadsheet size={29} /> : <UploadCloud size={29} />}</span>
      <span className="mt-5 block max-w-full break-all font-semibold">{file ? file.name : 'Tu próximo pronóstico empieza aquí'}</span>
      <span className="mt-2 block text-sm text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} KB · Pulsa para cambiar` : 'Arrastra tu CSV o pulsa para seleccionarlo'}</span>
      <span className="mt-5 block text-xs font-medium uppercase tracking-widest text-slate-400">CSV · Hasta 10 MB</span>
    </button>
    <input ref={input} type="file" accept=".csv,text/csv" className="hidden" aria-label="Seleccionar dataset CSV"
      onChange={(event) => { select(event.target.files[0]); event.target.value = ''; }} disabled={disabled} />
    {error && <div className="mt-4"><Notice danger>{error}</Notice></div>}
    <div className="my-6 space-y-3 text-sm text-slate-600">
      <p><strong className="text-slate-800">¿Qué debe incluir?</strong> Una columna <code>rain</code> con la clase a predecir y columnas con observaciones meteorológicas.</p>
      <p>Incluye al menos dos clases y suficientes registros por clase. Los valores faltantes de las características se completan durante el entrenamiento.</p>
    </div>
    <Button type="submit" className="w-full" busy={busy} disabled={disabled || !file}>
      {busy ? 'Entrenando el modelo…' : hasModel ? 'Entrenar un nuevo modelo' : 'Entrenar modelo'}
      {!busy && <ArrowUpRight size={18} />}
    </Button>
    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
      {hasModel ? 'Un entrenamiento correcto reemplaza el modelo activo. Si falla, se conserva el anterior.' : 'El 80 % de los datos se usa para entrenar y el 20 % para evaluar.'}
    </p>
  </form>;
}
