import { LoaderCircle } from 'lucide-react';

export default function Button({ children, busy = false, disabled = false, variant = 'primary', className = '', ...props }) {
  return <button {...props} disabled={disabled || busy} className={`button button-${variant} ${className}`}>
    {busy && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
    {children}
  </button>;
}
