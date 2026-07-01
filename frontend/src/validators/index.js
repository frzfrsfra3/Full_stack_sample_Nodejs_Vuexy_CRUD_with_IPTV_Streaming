export const requiredValidator = (val) => !!val || 'Required'
export const regexValidator = (val, pattern) => {
  if (!val) return true // defer to requiredValidator
  return new RegExp(pattern).test(val) || 'Invalid format'
}
export const integerValidator = (val) => /^\d+$/.test(val) || 'Must be an integer'
export const lengthValidator = (min) => (val) => val?.length >= min || `Must be at least ${min} characters`