export default function Badge({ children, variant='blue', className='' }) {
  const v = { blue:'badge-blue', green:'badge-green', red:'badge-red', amber:'badge-amber', slate:'badge-slate' }
  return <span className={`${v[variant]||variant} ${className}`}>{children}</span>
}
