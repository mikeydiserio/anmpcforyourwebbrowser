import Input from '@mui/material/Input'

const TextInput = ({props}: any) => {
  const {
    icon,
    disabled,
    error,
    handleChange,
    focus,
    name,
    note,
    onBlur,
    onFocus,
    type,
    text,
    valid,
    className,
  } = props
  const displayNote = (!valid) ? styles.isHidden : ''
  const focusIcon = (focus) ? styles.inputIconActive : ''

  const createIcon = (Icon, classes) => {
    return <Icon width="16" height="16" className={classes} />
  }

  const _handleBlur = (e) => {
    onBlur(name, e.target.value)
  }

  const _handleFocus = () => {
    onFocus(name)
  }

  const _handleChange = (e) => {
    handleChange(name, e.target.value)
  }

  return (
    <div>
      <Input
        className={[styles.input, className].join()}
        type={type}
        value={text}
        error={error}
        name={name}
        onBlur={_handleBlur}
        disabled={disabled}
        onFocus={_handleFocus}
        onChange={_handleChange}
      />
      {(icon) ? createIcon(icons[icon], [styles.inputIcon, focusIcon]) : null}
      {(note) ? <span className={[styles.note, displayNote].join()}>{note}</span> : null}
    </div>
  )
}


export default TextInput
