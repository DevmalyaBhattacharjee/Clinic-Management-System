export default function Select({ label, name, value, onChange, error, options=[], required=false, disabled=false, placeholder='Select…', className='' }) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="label" htmlFor={name}>{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label>}
      <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} required={required}
        className={`input ${error?'input-error':''}`}>
        <option value="">{placeholder}</option>
        {options.map(o=>(
          <option key={o.value??o} value={o.value??o}>{o.label??o}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
    </div>
  )
}
