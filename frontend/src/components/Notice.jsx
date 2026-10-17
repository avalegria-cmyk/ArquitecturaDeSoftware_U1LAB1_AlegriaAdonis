import { AlertCircle, Info } from 'lucide-react';

export default function Notice({ children, danger = false }) {
  const Icon = danger ? AlertCircle : Info;
  return <div className={`notice ${danger ? 'notice-danger' : ''}`} role={danger ? 'alert' : 'status'}>
    <Icon size={19} className="mt-0.5 shrink-0" aria-hidden="true" /><div>{children}</div>
  </div>;
}
