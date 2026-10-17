export default function Panel({ title, eyebrow, children, className = '', action }) {
  return <section className={`panel ${className}`}>
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>{eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}<h2 className="text-xl font-semibold tracking-tight">{title}</h2></div>
      {action}
    </header>
    {children}
  </section>;
}
