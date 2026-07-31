import { useState, useCallback } from 'react'

/**
 * Simple controlled-form hook.
 *
 * @param {Object} initialValues
 * @param {Function} [validate]  - (values) => { fieldName: 'error msg', ... }
 */
export function useForm(initialValues = {}, validate) {
  const [values,  setValues]  = useState(initialValues)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  // Generic change handler — works with input, select, textarea
  const handleChange = useCallback(e => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => { const next = { ...prev }; delete next[name]; return next })
    }
  }, [errors])

  const handleBlur = useCallback(e => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    if (validate) {
      const errs = validate(values)
      if (errs[name]) {
        setErrors(prev => ({ ...prev, [name]: errs[name] }))
      }
    }
  }, [validate, values])

  const setField = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const runValidation = useCallback(() => {
    if (!validate) return true
    const errs = validate(values)
    setErrors(errs)
    // Touch all fields so errors show
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)
    return Object.keys(errs).length === 0
  }, [validate, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setField,
    setValues,
    setErrors,
    runValidation,
    reset,
    isValid,
  }
}
