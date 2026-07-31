/**
 * Button — enhanced with:
 *   - leadingIcon / trailingIcon slots
 *   - fullWidth prop
 *   - href prop for link-as-button
 */
import Spinner from './Spinner'

export default function Button({
  children,
  type          = 'button',
  variant       = 'primary',
  size          = 'md',
  loading       = false,
  disabled      = false,
  onClick,
  className     = '',
  leadingIcon,
  trailingIcon,
  fullWidth     = false,
  href,
  ...props
}) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }
  const sizes = { sm:'btn-sm', md:'', lg:'btn-lg' }
  const cls   = `btn ${variants[variant] || variant} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`

  const inner = loading
    ? <><Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'brand'}/> Loading…</>
    : <>{leadingIcon && <span className="shrink-0">{leadingIcon}</span>}{children}{trailingIcon && <span className="shrink-0">{trailingIcon}</span>}</>

  if (href) {
    return <a href={href} className={cls} {...props}>{inner}</a>
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cls}
      {...props}
    >
      {inner}
    </button>
  )
}
